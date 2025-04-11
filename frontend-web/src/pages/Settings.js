import React, { useEffect, useState } from "react";
import axios from "axios";

const Settings = ({ userId }) => {
  const [csas, setCsas] = useState([]);
  const [selectedCSA, setSelectedCSA] = useState("");

  useEffect(() => {
    const fetchCSAs = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/csas/fetch");
        setCsas(res.data);

        // Fetch user's current CSA
        const userRes = await axios.get(`http://localhost:5000/api/csas/selected/${userId}`);
        setSelectedCSA(userRes.data.serviceAreaId);
      } catch (error) {
        console.error("Error fetching CSAs:", error);
      }
    };

    fetchCSAs();
  }, []);

  const handleSave = async () => {
    try {
      await axios.post("http://localhost:5000/api/csas/set", { userId, serviceAreaId: selectedCSA });
      alert("Service Area updated successfully!");
    } catch (error) {
      console.error("Error updating CSA:", error);
    }
  };

  return (
    <div>
      <h2>Settings</h2>
      <label>Change Service Area (CSA):</label>
      <select onChange={(e) => setSelectedCSA(e.target.value)} value={selectedCSA}>
        <option value="">-- Select CSA --</option>
        {csas.map((csa) => (
          <option key={csa.serviceAreaId} value={csa.serviceAreaId}>
            {csa.serviceAreaId}
          </option>
        ))}
      </select>
      <button onClick={handleSave}>Update</button>
    </div>
  );
};

export default Settings;