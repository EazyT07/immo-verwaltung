import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import MasterDataTable from "../components/MasterDataTable";
import ModalForm from "../components/ModalForm";
import ModalDelete from "../components/ModalDelete";

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

  const fieldsModal = [
    {
      id: "building_id",
      text: "Gebäude ID",
      type: "select",
      options: buildings,
    },
    { id: "year", text: "Jahr", type: "text" },
    { id: "cost_element", text: "Kostenart", type: "text" },
    { id: "cost", text: "Kosten", type: "text" },
  ];

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

  const handleDelete = (id) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    const { error } = await supabase
      .from("extra_cost")
      .delete()
      .eq("id", confirmDeleteId);
    if (!error) {
      setExtraCosts((prev) => prev.filter((e) => e.id !== confirmDeleteId));
    }
    setConfirmDeleteId(null);
  };

  return (
    <div className="container mt-4">
      <h3>Nebenkosten</h3>
      <button className="btn btn-primary mb-3" onClick={() => openModal()}>
        + Neue Nebenkosten
      </button>

      {/* Modal */}
      {showModal && (
        <ModalForm
          fields={fieldsModal}
          formData={formData}
          onChange={handleChange}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
          isEditing={!!editingId}
          title={editingId ? "Kosten bearbeiten" : "Neue Kosten hinzufügen"}
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
        data={extraCosts}
        onEdit={openModal}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default ExtraCostDashboard;
