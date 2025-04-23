import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Box, Button, Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, TextField } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const [serviceAreas, setServiceAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeServiceAreaId, setActiveServiceAreaId] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const fetchServiceAreas = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://192.168.1.204:5001/api/data/service-areas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServiceAreas(response.data);
      setActiveServiceAreaId(response.data.find((area) => area.isActive)?.serviceAreaId || null);
    } catch (err) {
      console.error("Failed to fetch service areas:", err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchUserInfo = useCallback(async () => {
    try {
      const res = await axios.get("http://192.168.1.204:5001/api/user/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserInfo(res.data);
    } catch (err) {
      console.error("Failed to fetch user info:", err.message);
    }
  }, [token]);

  const handleUserInfoChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put("http://192.168.1.204:5001/api/user/me", userInfo, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("User profile updated successfully!");
    } catch (err) {
      console.error("Failed to update user info:", err.message);
    }
  };

  const handleSetActive = async (serviceAreaId) => {
    try {
      await axios.post(
        "http://192.168.1.204:5001/api/data/set-active-service-area",
        { serviceAreaId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActiveServiceAreaId(serviceAreaId);
    } catch (err) {
      console.error("Failed to set active service area:", err.message);
    }
  };

  useEffect(() => {
    fetchServiceAreas();
    fetchUserInfo();
  }, [fetchServiceAreas, fetchUserInfo]);

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        Settings
      </Typography>
      <Box textAlign="center" mb={4}>
        <Button
          variant="contained"
          onClick={async () => {
            try {
              setLoading(true);
              await axios.post("http://192.168.1.204:5001/api/data/fetch-data", {}, {
                headers: { Authorization: `Bearer ${token}` },
              });
              fetchServiceAreas();
            } catch (err) {
              console.error("Failed to fetch DRO data:", err.message);
            } finally {
              setLoading(false);
            }
          }}
        >
          Fetch DRO Data
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center"><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Service Area</strong></TableCell>
                <TableCell><strong>Business Name</strong></TableCell>
                <TableCell><strong>Station</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell align="center"><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {serviceAreas.map((area) => (
                <TableRow key={area.serviceAreaId} selected={activeServiceAreaId === area.serviceAreaId}>
                  <TableCell>{area.csa}</TableCell>
                  <TableCell>{area.businessName}</TableCell>
                  <TableCell>{area.stationId}</TableCell>
                  <TableCell>{area.stationName}</TableCell>
                  <TableCell align="center">
                    {activeServiceAreaId === area.serviceAreaId ? (
                      <CheckCircleIcon sx={{ color: "green" }} />
                    ) : (
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleSetActive(area.serviceAreaId)}
                      >
                        Set Active
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Box textAlign="center" mt={4}>
        <Button variant="outlined" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </Box>
      <Box mt={6}>
        <Typography variant="h5" gutterBottom>Profile Info</Typography>
        {userInfo && (
          <Box component="form" onSubmit={handleUserUpdate} display="flex" flexDirection="column" width="100%" maxWidth="400px" mx="auto">
            <TextField
              label="Name"
              name="name"
              value={userInfo.name}
              onChange={handleUserInfoChange}
              margin="normal"
            />
            <TextField
              label="Phone"
              name="phone"
              value={userInfo.phone}
              onChange={handleUserInfoChange}
              margin="normal"
            />
            <TextField
              label="Title"
              name="title"
              value={userInfo.title}
              onChange={handleUserInfoChange}
              margin="normal"
            />
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>Update</Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Settings;