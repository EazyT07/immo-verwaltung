import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

function HousingUnitDashboard() {
  const [housingUnits, setHousingUnits] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [formData, setFormData] = useState({
    ext_id: "",
    square_meters: "",
    building_id: "",
    building: {
      ext_id: "",
    },
  });
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [userId, setUserId] = useState(null);

  const fields = [
    { id: "ext_id", text: "ID" },
    { id: "square_meters", text: "Größe (m²)" },
    { id: "building_id", text: "Gebäude ID" },
  ];

  useEffect(() => {
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
    fetchUserId();
  }, []);

  useEffect(() => {
    fetchHousingUnits();
    fetchBuildings();
  }, [userId]);

  async function fetchHousingUnits() {
    const { data, error } = await supabase
      .from("housing_unit")
      .select(
        "id, ext_id, square_meters, building_id, building:building_id(ext_id)"
      );
    if (!error) setHousingUnits(data);
  }

  async function fetchBuildings() {
    const { data, error } = await supabase
      .from("building")
      .select("id, ext_id");
    if (!error) {
      setBuildings(data);
      console.log("Buildings:", data);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openModal = (unit = null) => {
    console.log("Modal Unit:", unit);
    if (unit) {
      setFormData({
        id: unit.id,
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

  const handleSubmit = async () => {
    // Exclude nested `building` from payload
    const { building, ...cleanFormData } = formData;
    const payload = { ...cleanFormData, user_id: userId };
    console.log("Form Data:", formData);
    console.log("Payload:", payload);

    if (editingId) {
      await supabase.from("housing_unit").update(payload).eq("id", editingId);
    } else {
      await supabase.from("housing_unit").insert(payload);
    }

    setShowModal(false);
    fetchHousingUnits();
  };

  const handleDelete = async (id) => {
    await supabase.from("housing_unit").delete().eq("id", id);
    fetchHousingUnits();
  };

  return (
    <div className="container mt-4">
      <h2>Wohnungseinheiten</h2>
      <button className="btn btn-primary mb-3" onClick={() => openModal()}>
        + Neue Einheit
      </button>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Größe (m²)</th>
            <th>Gebäude</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {housingUnits.map((unit) => (
            <tr key={unit.id}>
              <td>{unit.ext_id}</td>
              <td>{unit.square_meters}</td>
              <td>{unit.building?.ext_id}</td>
              <td>
                <button
                  className="btn btn-sm btn-outline-secondary me-2"
                  onClick={() => openModal(unit)}
                >
                  <i className="bi bi-pencil-square"></i>
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(unit.id)}
                >
                  <i className="bi bi-trash3"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
    </div>
  );
}

export default HousingUnitDashboard;
