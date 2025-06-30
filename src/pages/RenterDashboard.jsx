import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import MasterDataTable from "../components/MasterDataTable";

function RenterDashboard() {
  const [renters, setRenters] = useState([]);
  const [housing_units, setHousingUnits] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    prename: "",
    housing_unit_id: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const columns = [
    {
      key: "name",
      label: "Name",
    },
    {
      key: "prename",
      label: "Vorname",
    },
    {
      key: "housing_unit_id",
      label: "Wohnung ID",
      render: (_value, row) => row.housing_unit?.ext_id || "-",
    },
  ];

  useEffect(() => {
    fetchRenters();
    fetchHousingUnits();
  }, []);

  const fetchRenters = async () => {
    const { data, error } = await supabase
      .from("renter")
      .select(
        "id, name, prename, housing_unit_id, housing_unit:housing_unit_id(ext_id)"
      );
    if (!error) {
      setRenters(data);
    } else {
      console.error("Error fetching renters:", error.message);
    }
  };

  const fetchHousingUnits = async () => {
    const { data, error } = await supabase
      .from("housing_unit")
      .select("id, ext_id");
    if (!error) {
      setHousingUnits(data);
    } else {
      console.error("Error fetching housing units:", error.message);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: userRow, error: userError } = await supabase
      .from("user")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    if (userError || !userRow) {
      console.error("Error fetching user row:", userError?.message);
      return;
    }

    const payload = { ...formData, user_id: userRow.id };
    let error;
    if (editingId) {
      ({ error } = await supabase
        .from("renter")
        .update(payload)
        .eq("id", editingId));
    } else {
      ({ error } = await supabase.from("renter").insert(payload));
    }

    if (error) {
      console.error("Error saving renter:", error.message);
    }

    setShowModal(false);
    fetchRenters();
  };

  const openModal = (renter) => {
    if (renter) {
      setFormData({
        name: renter.name,
        prename: renter.prename,
        housing_unit_id: renter.housing_unit_id,
      });
      setEditingId(renter.id);
    } else {
      setFormData({
        name: "",
        prename: "",
        housing_unit_id: "",
      });
      setEditingId(null);
    }
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
                <label className="form-label">Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control mb-2"
                />
                <label className="form-label">Vorname</label>
                <input
                  name="prename"
                  value={formData.prename}
                  onChange={handleChange}
                  className="form-control mb-2"
                />
                <label className="form-label">Wohnung</label>
                <select
                  name="housing_unit_id"
                  value={formData.housing_unit_id}
                  onChange={handleChange}
                  className="form-select mb-2"
                >
                  <option value="">-- bitte wählen --</option>
                  {housing_units.map((b) => (
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

      <MasterDataTable
        columns={columns}
        data={renters}
        onEdit={openModal}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default RenterDashboard;
