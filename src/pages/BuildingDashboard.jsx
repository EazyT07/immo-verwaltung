import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import MasterDataTable from "../components/MasterDataTable";

function BuildingDashboard() {
  const [buildings, setBuildings] = useState([]);
  const [formData, setFormData] = useState({
    ext_id: "",
    street: "",
    house_nr: "",
    postal_code: "",
    city: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const fieldsModal = [
    { id: "ext_id", text: "ID" },
    { id: "street", text: "Strasse" },
    { id: "house_nr", text: "Hausnummer" },
    { id: "postal_code", text: "PLZ" },
    { id: "city", text: "Stadt" },
  ];

  const columns = [
    {
      key: "ext_id",
      label: "ID",
    },
    {
      key: "street",
      label: "Strasse",
    },
    {
      key: "house_nr",
      label: "Hausnummer",
    },
    {
      key: "postal_code",
      label: "PLZ",
    },
    {
      key: "city",
      label: "Stadt",
    },
  ];

  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    const { data, error } = await supabase
      .from("building")
      .select("*")
      .order("ext_id", { ascending: true });
    if (!error) setBuildings(data);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
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
    fetchBuildings();
  };

  const openModal = (building) => {
    if (building) {
      setFormData({
        ext_id: building.ext_id,
        street: building.street,
        house_nr: building.house_nr,
        postal_code: building.postal_code,
        city: building.city,
      });
      setEditingId(building.id);
    } else {
      setFormData({
        ext_id: "",
        street: "",
        house_nr: "",
        postal_code: "",
        city: "",
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
      .from("building")
      .delete()
      .eq("id", confirmDeleteId);
    if (!error) {
      setBuildings((prev) => prev.filter((b) => b.id !== confirmDeleteId));
    }
    setConfirmDeleteId(null);
  };

  return (
    <div className="container mt-4">
      <h3>Gebäude</h3>
      <button
        className="btn btn-primary mb-3"
        onClick={() => {
          setFormData({
            street: "",
            house_nr: "",
            postal_code: "",
            city: "",
          });
          setEditingId(null);
          setShowModal(true);
        }}
      >
        + Neues Gebäude
      </button>

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
                {fieldsModal.map((field) => (
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
                <button
                  className="btn btn-primary w-100"
                  onClick={handleSubmit}
                >
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
      <MasterDataTable
        columns={columns}
        data={buildings}
        onEdit={openModal}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default BuildingDashboard;
