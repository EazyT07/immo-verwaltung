import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import MasterDataTable from "../components/MasterDataTable";
import calculateCosts from "../utils/calculateCosts";

function ResultDashboard() {
  const [costResult, setCostResult] = useState([]);
  const [userId, setUserId] = useState(null);

  const columns = [
    {
      key: "building_id",
      label: "Gebäude ID",
      render: (_value, row) => row.building?.ext_id || "-",
    },
    {
      key: "housing_unit_id",
      label: "Wohnung ID",
      render: (_value, row) => row.housing_unit?.ext_id || "-",
    },
    {
      key: "name",
      label: "Name",
      render: (_value, row) => row.renter?.name || "-",
    },
    {
      key: "year",
      label: "Jahr",
      render: (_value, row) => row.extra_cost?.year || "-",
    },
    {
      key: "cost_element",
      label: "Kostenart",
      render: (_value, row) => row.extra_cost?.cost_element || "-",
    },
    {
      key: "factor",
      label: "Faktor",
    },
    {
      key: "amount",
      label: "Betrag",
    },
  ];

  useEffect(() => {
    fetchUserId();
  }, []);

  useEffect(() => {
    fetchCostResult();
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

  const fetchCostResult = async () => {
    let select = "id, building_id, building:building_id(ext_id)";
    select = select + ", housing_unit_id, housing_unit:housing_unit_id(ext_id)";
    select = select + ", renter_id, renter:renter_id(name)";
    select =
      select + ", extra_cost_id, extra_cost:extra_cost_id(year, cost_element)";
    select = select + ", factor, amount";
    const { data, error } = await supabase
      .from("cost_result")
      .select(select)
      .order("building_id", { ascending: true });
    if (!error) setCostResult(data);
  };

  const openModal = () => {};

  const handleDelete = () => {};

  const handleCalculate = async () => {
    if (!userId) return;
    await calculateCosts(userId, supabase);
    fetchCostResult();
  };

  return (
    <div className="container mt-4">
      <h3>Abrechnung</h3>
      <button className="btn btn-primary mb-3" onClick={handleCalculate}>
        Berechnen
      </button>
      <MasterDataTable
        columns={columns}
        data={costResult}
        onEdit={openModal}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default ResultDashboard;
