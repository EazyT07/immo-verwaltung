import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import MasterDataTable from "../components/MasterDataTable";
import ModalForm from "../components/ModalForm";
import ModalDelete from "../components/ModalDelete";

function RenterDashboard() {
  const [renters, setRenters] = useState([]);
  const [housing_units, setHousingUnits] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    prename: "",
    date_from: "",
    date_to: "",
    housing_unit_id: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const fieldsModal = [
    { id: "name", text: "Name", type: "text" },
    { id: "prename", text: "Vorname", type: "text" },
    { id: "date_from", text: "Datum von", type: "text" },
    { id: "date_to", text: "Datum bis", type: "text" },
    {
      id: "housing_unit_id",
      text: "Wohnnung ID",
      type: "select",
      options: housing_units,
    },
  ];

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
      key: "date_from",
      label: "Datum von",
    },
    {
      key: "date_to",
      label: "Datum bis",
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
        "id, name, prename, date_from, date_to, housing_unit_id, housing_unit:housing_unit_id(ext_id)"
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
        date_from: renter.date_from,
        date_to: renter.date_to,
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
    <div className="container mt-4">
      <h3>Mieter</h3>
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
        <ModalForm
          fields={fieldsModal}
          formData={formData}
          onChange={handleChange}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
          isEditing={!!editingId}
          title={editingId ? "Mieter bearbeiten" : "Neuen Mieter hinzufügen"}
        />
      )}

      {confirmDeleteId && (
        <ModalDelete
          onCancel={() => setConfirmDeleteId(null)}
          onConfirm={confirmDelete}
        />
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
