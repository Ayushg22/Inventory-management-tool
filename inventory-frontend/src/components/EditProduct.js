// src/components/EditProduct.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box, Alert } from '@mui/material';
import axios from 'axios';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    item_name: '',
    price: '',
    quantity: '',
    purchase_date: '',
    category: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

useEffect(() => {
  axios.get(`http://localhost:5000/api/products/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => {
      setFormData({
        item_name: res.data.item_name,
        price: res.data.price,
        quantity: res.data.quantity,
        purchase_date: res.data.purchase_date,
        category: res.data.category
      });
    })
    .catch(() => setError('Failed to fetch product data'));
}, [id]);

 const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    await axios.put(`http://localhost:5000/api/products/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    setLoading(false);
    navigate('/inventory');
  } catch {
    setLoading(false);
    setError('Failed to update product. Please try again.');
  }
};


  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Edit Product</Typography>
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
          label="Price"
          name="price"
          type="number"
          fullWidth
          margin="normal"
          value={formData.price}
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
          disabled={loading}
          sx={{ mt: 3 }}
          fullWidth
        >
          {loading ? 'Updating...' : 'Update Product'}
        </Button>
      </Box>
    </Container>
  );
};

export default EditProduct;
