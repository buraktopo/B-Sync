import React, { useEffect, useState } from "react";
import axios from "axios";

const ConnectDRO = ({ userId }) => {
  const [csas, setCsas] = useState([]);
  const [selectedCSA, setSelectedCSA] = useState("");

  useEffect(() => {
    const fetchCSAs = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/csas/fetch");
        setCsas(res.data);
      } catch (error) {
        console.error("Error fetching CSAs:", error);
      }
    };

    fetchCSAs();
  }, []);

  const handleSave = async () => {
    try {
      await axios.post("http://localhost:5001/api/csas/set", { userId, serviceAreaId: selectedCSA });
      alert("Service Area selected successfully!");
    } catch (error) {
      console.error("Error saving CSA:", error);
    }
  };

  return (
    <div>
      <h2>Connect DRO Account</h2>
      <label>Select Service Area (CSA):</label>
      <select onChange={(e) => setSelectedCSA(e.target.value)} value={selectedCSA}>
        <option value="">-- Select CSA --</option>
        {csas.map((csa) => (
          <option key={csa.serviceAreaId} value={csa.serviceAreaId}>
            {csa.serviceAreaId}
          </option>
        ))}
      </select>
      <button onClick={handleSave}>Save</button>
    </div>
  );
};

export default ConnectDRO;