import React, { useState, useEffect } from "react";
import { TextField, Button, Container, Typography, Box } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logo from '../assets/logo.png';

const Login = () => {
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
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const processedData = {
      email: formData.email.replace(/\s/g, ""),
      password: formData.password.replace(/\s/g, ""),
    };
    try {
      const response = await axios.post("http://192.168.1.204:5001/api/auth/login", processedData);
      console.log("Login successful:", response.data);
      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Login failed.");
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
        <Box display="flex" justifyContent="center" mt={4}>
          <img src={logo} alt="AssistBC Logo" style={{ height: "200px" }} />
        </Box>
        <Container maxWidth="sm">
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
          >
            <Typography variant="h4" gutterBottom>
              Login
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
                Login
              </Button>
            </Box>
            <Box mt={2}>
              <Typography variant="body2">
                New to B-Sync?{" "}
                <a href="/register" style={{ color: "#1976d2", textDecoration: "none" }}>
                  Create an account →
                </a>
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Login;