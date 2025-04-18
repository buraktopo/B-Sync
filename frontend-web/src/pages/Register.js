import React, { useState, useEffect } from "react";
import { TextField, Button, Container, Typography, Box } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5001/api/auth/register", formData);
      console.log("Registration successful:", response.data);
      localStorage.setItem("token", response.data.token); // Assuming the token is returned in the response
      alert("Registration successful! Please log in.");
      navigate("/dashboard");
    } catch (err) {
      console.error("Registration error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <Box minHeight="100vh" mt={-4}>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        textAlign="center"
      >
        <Box display="flex" justifyContent="center" mb={2}>
          <img src={require("../assets/logo.png")} alt="B-Sync Logo" style={{ height: "150px" }} />
        </Box>
        <Container maxWidth="sm">
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            textAlign="center"
          >
            <Typography variant="h4" gutterBottom>
              Register
            </Typography>
            {error && <Typography color="error">{error}</Typography>}
            <Box
              component="form"
              onSubmit={handleSubmit}
              bgcolor="#f5f5f5"
              p={3}
              borderRadius={2}
              boxShadow={1}
              width="60%"
            >
              <TextField
                fullWidth
                size="small"
                sx={{ maxWidth: 360 }}
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
              />
              <TextField
                fullWidth
                size="small"
                sx={{ maxWidth: 360 }}
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                margin="normal"
              />
              <Button type="submit" variant="contained" color="primary" fullWidth sx={{ maxWidth: 360, mt: 2 }}>
                Register
              </Button>
            </Box>
            <Box mt={2}>
              <Typography variant="body2">
                Already have an account?{" "}
                <a href="/login" style={{ color: "#1976d2", textDecoration: "none" }}>
                  Log in →
                </a>
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Register;