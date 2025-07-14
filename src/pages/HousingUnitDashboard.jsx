import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import MasterDataTable from "../components/MasterDataTable";
import ModalForm from "../components/ModalForm";

function HousingUnitDashboard() {
  const [housingUnits, setHousingUnits] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    ext_id: "",
    square_meters: "",
    building_id: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const fieldsModal = [
    { id: "ext_id", text: "ID", type: "text" },
    { id: "square_meters", text: "Größe (m²)", type: "text" },
    {
      id: "building_id",
      text: "Gebäude ID",
      type: "select",
      options: buildings,
    },
  ];

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (_value, row) => row.ext_id || "-",
    },
    {
      key: "square_meters",
      label: "Größe (m²)",
    },
    {
      key: "building_id",
      label: "Gebäude ID",
      render: (_value, row) => row.building?.ext_id || "-",
    },
  ];

  useEffect(() => {
    fetchUserId();
  }, []);

  useEffect(() => {
    fetchHousingUnits();
    fetchBuildings();
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

  const fetchHousingUnits = async () => {
    const { data, error } = await supabase
      .from("housing_unit")
      .select(
        "id, ext_id, square_meters, building_id, building:building_id(ext_id)"
      )
      .order("ext_id", { ascending: true });
    if (!error) setHousingUnits(data);
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
    console.log(e.target);
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // Exclude nested `building` from payload
    const { building, ...cleanFormData } = formData;
    const payload = { ...cleanFormData, user_id: userId };

    if (editingId) {
      await supabase.from("housing_unit").update(payload).eq("id", editingId);
    } else {
      await supabase.from("housing_unit").insert(payload);
    }

    setShowModal(false);
    fetchHousingUnits();
  };

  const openModal = (unit = null) => {
    if (unit) {
      setFormData({
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

  const handleDelete = async (id) => {
    await supabase.from("housing_unit").delete().eq("id", id);
    fetchHousingUnits();
  };

  return (
    <div className="container mt-4">
      <h3>Wohnungseinheiten</h3>
      <button className="btn btn-primary mb-3" onClick={() => openModal()}>
        + Neue Einheit
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
          title={editingId ? "Gebäude bearbeiten" : "Neues Gebäude hinzufügen"}
        />
      )}

      <MasterDataTable
        columns={columns}
        data={housingUnits}
        onEdit={openModal}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default HousingUnitDashboard;
