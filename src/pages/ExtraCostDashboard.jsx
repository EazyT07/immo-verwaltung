import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import MasterDataTable from "../components/MasterDataTable";

function ExtraCostDashboard() {
  const [extraCosts, setExtraCosts] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    building_id: "",
    year: "",
    cost_element: "",
    cost: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const columns = [
    {
      key: "building_id",
      label: "Gebäude ID",
      render: (_value, row) => row.building?.ext_id || "-",
    },
    {
      key: "year",
      label: "Jahr",
    },
    {
      key: "cost_element",
      label: "Kostenart",
    },
    {
      key: "cost",
      label: "Betrag in €",
    },
  ];

  useEffect(() => {
    fetchUserId();
  }, []);

  useEffect(() => {
    fetchBuildings();
    fetchExtraCosts();
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

  const fetchExtraCosts = async () => {
    const { data, error } = await supabase
      .from("extra_cost")
      .select(
        "id, building_id, building:building_id(ext_id), year, cost_element, cost"
      )
      .order("building_id", { ascending: true });
    if (!error) setExtraCosts(data);
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
      await supabase.from("extra_cost").update(payload).eq("id", editingId);
    } else {
      await supabase.from("extra_cost").insert(payload);
    }

    setShowModal(false);
    fetchExtraCosts();
  };

  const openModal = (extra_cost = null) => {
    if (extra_cost) {
      setFormData({
        building_id: extra_cost.building_id,
        year: extra_cost.year,
        cost_element: extra_cost.cost_element,
        cost: extra_cost.cost,
      });
      setEditingId(extra_cost.id);
    } else {
      setFormData({
        building_id: "",
        year: "",
        cost_element: "",
        cost: "",
      });
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    await supabase.from("extra_cost").delete().eq("id", id);
    fetchExtraCosts();
  };

  return (
    <div className="container mt-4">
      <h3>Nebenkosten</h3>
      <button className="btn btn-primary mb-3" onClick={() => openModal()}>
        + Neue Nebenkosten
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
                <label className="form-label">Jahr</label>
                <input
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="form-control mb-2"
                />
                <label className="form-label">Kostenart</label>
                <input
                  name="cost_element"
                  value={formData.cost_element}
                  onChange={handleChange}
                  className="form-control mb-2"
                />
                <label className="form-label">Betrag in €</label>
                <input
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  className="form-control mb-2"
                />
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
        data={extraCosts}
        onEdit={openModal}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default ExtraCostDashboard;
