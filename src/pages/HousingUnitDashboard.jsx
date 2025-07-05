import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import MasterDataTable from "../components/MasterDataTable";

function HousingUnitDashboard() {
  const [housingUnits, setHousingUnits] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    ext_id: "",
    square_meters: "",
    building_id: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (_value, row) => row.ext_id || "-",
    },
    {
      key: "square_meters",
      label: "Größe (m²)",
    },
    {
      key: "building_id",
      label: "Gebäude ID",
      render: (_value, row) => row.building?.ext_id || "-",
    },
  ];

  useEffect(() => {
    fetchUserId();
  }, []);

  useEffect(() => {
    fetchHousingUnits();
    fetchBuildings();
  }, [userId]);

  const fetchUserId = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: userRow } = await supabase
      .from("user")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();
    setUserId(userRow.id);
  };

  const fetchHousingUnits = async () => {
    const { data, error } = await supabase
      .from("housing_unit")
      .select(
        "id, ext_id, square_meters, building_id, building:building_id(ext_id)"
      )
      .order("ext_id", { ascending: true });
    if (!error) setHousingUnits(data);
  };

  async function fetchBuildings() {
    const { data, error } = await supabase
      .from("building")
      .select("id, ext_id");
    if (!error) {
      setBuildings(data);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // Exclude nested `building` from payload
    const { building, ...cleanFormData } = formData;
    const payload = { ...cleanFormData, user_id: userId };

    if (editingId) {
      await supabase.from("housing_unit").update(payload).eq("id", editingId);
    } else {
      await supabase.from("housing_unit").insert(payload);
    }

    setShowModal(false);
    fetchHousingUnits();
  };

  const openModal = (unit = null) => {
    if (unit) {
      setFormData({
        ext_id: unit.ext_id,
        square_meters: unit.square_meters,
        building_id: unit.building_id,
      });
      setEditingId(unit.id);
    } else {
      setFormData({
        ext_id: "",
        square_meters: "",
        building_id: "",
      });
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    await supabase.from("housing_unit").delete().eq("id", id);
    fetchHousingUnits();
  };

  return (
    <div className="container mt-4">
      <h3>Wohnungseinheiten</h3>
      <button className="btn btn-primary mb-3" onClick={() => openModal()}>
        + Neue Einheit
      </button>

      {/* Modal */}
      {showModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingId ? "Einheit bearbeiten" : "Neue Einheit"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <label className="form-label">ID</label>
                <input
                  name="ext_id"
                  value={formData.ext_id}
                  onChange={handleChange}
                  className="form-control mb-2"
                />
                <label className="form-label">Größe (m²)</label>
                <input
                  name="square_meters"
                  value={formData.square_meters}
                  onChange={handleChange}
                  className="form-control mb-2"
                />
                <label className="form-label">Gebäude</label>
                <select
                  name="building_id"
                  value={formData.building_id}
                  onChange={handleChange}
                  className="form-select mb-2"
                >
                  <option value="">-- bitte wählen --</option>
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.ext_id || b.id}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Abbrechen
                </button>
                <button className="btn btn-primary" onClick={handleSubmit}>
                  Speichern
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <MasterDataTable
        columns={columns}
        data={housingUnits}
        onEdit={openModal}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default HousingUnitDashboard;
