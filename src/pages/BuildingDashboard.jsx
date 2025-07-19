import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import MasterDataTable from "../components/MasterDataTable";
import ModalForm from "../components/ModalForm";
import ModalDelete from "../components/ModalDelete";

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
    { id: "ext_id", text: "ID", type: "text" },
    { id: "street", text: "Strasse", type: "text" },
    { id: "house_nr", text: "Hausnummer", type: "text" },
    { id: "postal_code", text: "PLZ", type: "text" },
    { id: "city", text: "Stadt", type: "text" },
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
        <ModalForm
          fields={fieldsModal}
          formData={formData}
          onChange={handleChange}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
          isEditing={!!editingId}
          title={editingId ? "Gebäude bearbeiten" : "Neues Gebäude hinzufügen"}
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
        data={buildings}
        onEdit={openModal}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default BuildingDashboard;
