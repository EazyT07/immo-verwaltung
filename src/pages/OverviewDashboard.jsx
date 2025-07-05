import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

function OverviewDashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    let { data: renterData, error } = await supabase
      .from("building")
      .select(
        "ext_id, street, house_nr, postal_code, city, housing_unit ( ext_id, square_meters, renter ( name, prename ) )"
      );
    if (error) {
      console.error("Error fetching master data:", error.message);
    } else {
      setData(renterData);
    }
    console.log("Übericht", renterData);
  };

  return (
    <div className="container mt-4">
      <h3>Übersicht Stammdaten</h3>
      {data.map((building) => (
        <div key={building.ext_id} className="mb-4">
          <h5>Gebäude: {building.ext_id}</h5>
          <p>
            Adresse: {building.street} {building.house_nr},{" "}
            {building.postal_code} {building.city}
          </p>

          <table className="table table-sm table-bordered">
            <thead>
              <tr>
                <th>Wohnung</th>
                <th>Größe (m²)</th>
                <th>Mieter Vorname</th>
                <th>Mieter Nachname</th>
              </tr>
            </thead>
            <tbody>
              {building.housing_unit?.map((unit) => (
                <tr key={unit.ext_id}>
                  <td>{unit.ext_id}</td>
                  <td>{unit.square_meters}</td>
                  {unit.renter ? (
                    unit.renter.map((singleRenter) => (
                      <>
                        <td>{singleRenter.prename}</td>
                        <td>{singleRenter.name}</td>
                      </>
                    ))
                  ) : (
                    <td colSpan="2">—</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default OverviewDashboard;
