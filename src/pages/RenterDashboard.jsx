import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const RenterDashboard = () => {
  const [renters, setRenters] = useState([]);
  const [formData, setFormData] = useState({ name: "", prename: "" });
  const [editingId, setEditingId] = useState(null);

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
      } else {
        console.error("Error adding renter:", error?.message);
      }
    }
  };

  const handleEdit = (renter) => {
    setFormData({ name: renter.name, prename: renter.prename });
    setEditingId(renter.id);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Möchten Sie diesen Mieter wirklich löschen?"
    );
    if (!confirmed) return;

    const { error } = await supabase.from("renter").delete().eq("id", id);
    if (!error) {
      setRenters((prev) => prev.filter((r) => r.id !== id));
    } else {
      console.error("Error deleting renter:", error?.message);
    }
  };

  return (
    <div className="container py-4">
      <h2>Mieter</h2>

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
      <button onClick={handleAdd} className="btn btn-primary mb-4">
        {editingId ? "Mieter aktualisieren" : "Mieter hinzufügen"}
      </button>

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
  );
};

export default RenterDashboard;
