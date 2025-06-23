import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

function RenterDashboard() {
  const [renters, setRenters] = useState([]);
  const [formData, setFormData] = useState({ name: "", prename: "" });
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    const fetchRenters = async () => {
      const { data, error } = await supabase
        .from("renter")
        .select("id, name, prename");
      if (!error) {
        setRenters(data);
      } else {
        console.error("Error fetching renters:", error.message);
      }
    };

    fetchRenters();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAdd = async () => {
    if (!formData.name || !formData.prename) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: userRow } = await supabase
      .from("user")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    const newRenter = {
      name: formData.name,
      prename: formData.prename,
      user_id: userRow.id,
    };

    if (editingId) {
      const { data, error } = await supabase
        .from("renter")
        .update(newRenter)
        .eq("id", editingId)
        .select();

      if (!error) {
        setRenters((prev) =>
          prev.map((r) => (r.id === editingId ? data[0] : r))
        );
        setEditingId(null);
        setFormData({ name: "", prename: "" });
        setShowModal(false);
      } else {
        console.error("Error updating renter:", error?.message);
      }
    } else {
      const { data, error } = await supabase
        .from("renter")
        .insert([newRenter])
        .select();

      if (!error && data.length > 0) {
        setRenters((prev) => [...prev, data[0]]);
        setFormData({ name: "", prename: "" });
        setShowModal(false);
      } else {
        console.error("Error adding renter:", error?.message);
      }
    }
  };

  const handleEdit = (renter) => {
    setFormData({ name: renter.name, prename: renter.prename });
    setEditingId(renter.id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    const { error } = await supabase
      .from("renter")
      .delete()
      .eq("id", confirmDeleteId);
    if (!error) {
      setRenters((prev) => prev.filter((r) => r.id !== confirmDeleteId));
    } else {
      console.error("Error deleting renter:", error?.message);
    }
    setConfirmDeleteId(null);
  };

  return (
    <div className="container py-4">
      <h2>Mieter</h2>

      <button
        onClick={() => {
          setFormData({ name: "", prename: "" });
          setEditingId(null);
          setShowModal(true);
        }}
        className="btn btn-primary mb-4"
      >
        + Neuer Mieter
      </button>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-sm modal-fullscreen-sm-down">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingId ? "Mieter bearbeiten" : "Neuer Mieter"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Vorname</label>
                  <input
                    type="text"
                    name="prename"
                    value={formData.prename}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
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
                <p>Möchten Sie diesen Mieter wirklich löschen?</p>
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

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Vorname</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {renters.map((renter) => (
              <tr key={renter.id}>
                <td>{renter.name}</td>
                <td>{renter.prename}</td>
                <td>
                  <button
                    className="btn btn-sm btn-secondary me-2"
                    onClick={() => handleEdit(renter)}
                  >
                    Bearbeiten
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(renter.id)}
                  >
                    Löschen
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RenterDashboard;
