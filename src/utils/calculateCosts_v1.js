export default async function calculateCosts(userId, supabase) {
  // Fetch necessary master data
  const { data: extraCosts } = await supabase
    .from("extra_cost")
    .select("*")
    .eq("user_id", userId);
  const { data: housingUnits } = await supabase
    .from("housing_unit")
    .select("id, square_meters, building_id");
  const { data: renters } = await supabase
    .from("renter")
    .select("id, housing_unit_id");

  const results = [];

  for (const cost of extraCosts) {
    const unitsInBuilding = housingUnits.filter(
      (hu) => hu.building_id === cost.building_id
    );
    const totalSquareMeters = unitsInBuilding.reduce(
      (sum, hu) => sum + hu.square_meters,
      0
    );

    for (const hu of unitsInBuilding) {
      const unitRenters = renters.filter((r) => r.housing_unit_id === hu.id);
      const factor = hu.square_meters / totalSquareMeters;
      const amount = factor * cost.cost;

      for (const renter of unitRenters) {
        results.push({
          user_id: userId,
          building_id: cost.building_id,
          housing_unit_id: hu.id,
          renter_id: renter.id,
          extra_cost_id: cost.id,
          factor,
          amount,
        });
      }
    }
  }

  // Clear old results and insert new ones
  await supabase.from("cost_result").delete().eq("user_id", userId);
  if (results.length > 0) {
    await supabase.from("cost_result").insert(results);
  }
}
