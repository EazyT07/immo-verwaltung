export default async function calculateCosts(userId, supabase) {
  // Fetch necessary master data
  const { data: extraCosts } = await supabase
    .from("extra_cost")
    .select("*")
    .eq("user_id", userId);
  const { data: rentersData } = await supabase
    .from("renter")
    .select(
      "id, housing_unit_id, housing_unit:housing_unit_id(square_meters), year, months, persons"
    );

  const results = [];

  // Process all renters
  for (const renterData of rentersData) {
    // Calculate Total
    const total = rentersData.reduce(
      (sum, row) => sum + row.housing_unit.square_meters * row.months,
      0
    );
    if (total === 0) continue;
    const factor =
      (renterData.housing_unit.square_meters * renterData.months) / total;

    for (const costNew of extraCosts) {
      results.push({
        user_id: userId,
        building_id: costNew.building_id,
        housing_unit_id: renterData.housing_unit_id,
        renter_id: renterData.id,
        extra_cost_id: costNew.id,
        factor: parseFloat(factor).toFixed(4),
        amount: parseFloat(costNew.cost * factor).toFixed(2),
      });
    }
  }

  // Clear old results and insert new ones
  await supabase.from("cost_result").delete().eq("user_id", userId);
  if (results.length > 0) {
    await supabase.from("cost_result").insert(results);
  }
}
