// src/components/AddProductForm.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Container, Typography, Box, Alert } from "@mui/material";
import axiosInstance, { logout } from "../axiosInstance";

const AddProductForm = () => {
  const [formData, setFormData] = useState({
    item_name: "",
    buy_price: "",
    selling_price: "",
    quantity: "",
    purchase_date: "",
    category: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Submit product
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axiosInstance.post("/products", formData);
      setLoading(false);
      navigate("/inventory");
    } catch (err) {
      setLoading(false);
      console.error(err.response?.data || err.message);
      if (err.response?.status === 401) {
        logout();
      } else {
        setError("Failed to add product. Please try again.");
      }
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Add Product
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Item Name"
          name="item_name"
          fullWidth
          margin="normal"
          value={formData.item_name}
          onChange={handleChange}
          required
        />

        <TextField
          label="Buying Price"
          name="buy_price"
          type="number"
          fullWidth
          margin="normal"
          value={formData.buy_price}
          onChange={handleChange}
          required
          inputProps={{ min: 0, step: "0.01" }}
        />

        <TextField
          label="Selling Price"
          name="selling_price"
          type="number"
          fullWidth
          margin="normal"
          value={formData.selling_price}
          onChange={handleChange}
          required
          inputProps={{ min: 0, step: "0.01" }}
        />

        <TextField
          label="Quantity"
          name="quantity"
          type="number"
          fullWidth
          margin="normal"
          value={formData.quantity}
          onChange={handleChange}
          required
          inputProps={{ min: 0 }}
        />

        <TextField
          label="Purchase Date"
          name="purchase_date"
          type="date"
          fullWidth
          margin="normal"
          value={formData.purchase_date}
          onChange={handleChange}
          required
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="Category"
          name="category"
          fullWidth
          margin="normal"
          value={formData.category}
          onChange={handleChange}
          required
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 3, borderRadius: 2 }}
          fullWidth
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Product"}
        </Button>
      </Box>
    </Container>
  );
};

export default AddProductForm;