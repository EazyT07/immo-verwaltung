import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

function BuildingDashboard() {
  const [buildings, setBuildings] = useState([]);
  const [formData, setFormData] = useState({
    street: "",
    house_nr: "",
    postal_code: "",
    city: "",
    square_meters: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const fields = [
    { id: "street", text: "Strasse" },
    { id: "house_nr", text: "Hausnummer" },
    { id: "postal_code", text: "PLZ" },
    { id: "city", text: "Stadt" },
    { id: "square_meters", text: "Quadratmeter" },
  ];

  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    const { data, error } = await supabase.from("building").select("*");
    if (!error) setBuildings(data);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAdd = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: userRow } = await supabase
      .from("user")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    const newBuilding = {
      ...formData,
      user_id: userRow.id,
      square_meters: parseFloat(formData.square_meters),
    };

    if (editingId) {
      const { data, error } = await supabase
        .from("building")
        .update(newBuilding)
        .eq("id", editingId)
        .select();
      if (!error) {
        setBuildings((prev) =>
          prev.map((b) => (b.id === editingId ? data[0] : b))
        );
      }
    } else {
      const { data, error } = await supabase
        .from("building")
        .insert([newBuilding])
        .select();
      if (!error) {
        setBuildings((prev) => [...prev, data[0]]);
      }
    }

    setShowModal(false);
    setEditingId(null);
    setFormData({
      street: "",
      house_nr: "",
      postal_code: "",
      city: "",
      square_meters: "",
    });
  };

  const handleEdit = (building) => {
    setFormData(building);
    setEditingId(building.id);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    const { error } = await supabase
      .from("building")
      .delete()
      .eq("id", confirmDeleteId);
    if (!error) {
      setBuildings((prev) => prev.filter((b) => b.id !== confirmDeleteId));
    }
    setConfirmDeleteId(null);
  };

  return (
    <div>
      <h3>Gebäude</h3>
      <button
        className="btn btn-primary mb-3"
        onClick={() => {
          setFormData({
            street: "",
            house_nr: "",
            postal_code: "",
            city: "",
            square_meters: "",
          });
          setEditingId(null);
          setShowModal(true);
        }}
      >
        + Neues Gebäude
      </button>

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Adresse</th>
              <th>PLZ</th>
              <th>Stadt</th>
              <th>qm</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {buildings.map((b) => (
              <tr key={b.id}>
                <td>
                  {b.street} {b.house_nr}
                </td>
                <td>{b.postal_code}</td>
                <td>{b.city}</td>
                <td>{b.square_meters}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-secondary me-2"
                    onClick={() => handleEdit(b)}
                    title="Bearbeiten"
                  >
                    <i className="bi bi-pencil-square"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => setConfirmDeleteId(b.id)}
                    title="Löschen"
                  >
                    <i className="bi bi-trash3"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-sm modal-fullscreen-sm-down">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingId ? "Gebäude bearbeiten" : "Neues Gebäude"}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {fields.map((field) => (
                  <div className="mb-2" key={field.id}>
                    <label className="form-label">{field.text}</label>
                    <input
                      name={field.id}
                      className="form-control"
                      value={formData[field.id]}
                      onChange={handleChange}
                    />
                  </div>
                ))}
              </div>
              <div className="modal-footer d-flex flex-column gap-2">
                <button
                  className="btn btn-secondary w-100"
                  onClick={() => setShowModal(false)}
                >
                  Abbrechen
                </button>
                <button className="btn btn-primary w-100" onClick={handleAdd}>
                  {editingId ? "Aktualisieren" : "Hinzufügen"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-sm modal-fullscreen-sm-down">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Löschen bestätigen</h5>
              </div>
              <div className="modal-body">
                <p>Möchten Sie dieses Gebäude wirklich löschen?</p>
              </div>
              <div className="modal-footer d-flex flex-column gap-2">
                <button
                  className="btn btn-secondary w-100"
                  onClick={() => setConfirmDeleteId(null)}
                >
                  Abbrechen
                </button>
                <button
                  className="btn btn-danger w-100"
                  onClick={confirmDelete}
                >
                  Löschen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BuildingDashboard;
