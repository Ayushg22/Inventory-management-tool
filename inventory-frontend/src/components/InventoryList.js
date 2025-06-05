import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton,
  Button, TextField, Box
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import axios from 'axios';

const InventoryList = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalValue, setTotalValue] = useState(0);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/products', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const { products, total_value } = response.data;
      setProducts(products);
      setTotalValue(total_value);
    } catch (err) {
      console.error('Error fetching products:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const filteredProducts = (products || []).filter(product => 
  product.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()))
);


  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>My Inventory</Typography>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <TextField
          label="Search by name or category"
          variant="outlined"
          fullWidth
          sx={{ mb: 3 }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Purchase Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.map(product => (
              <TableRow key={product.id}>
                <TableCell>{product.item_name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.price}</TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell>{product.purchase_date}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => navigate(`/edit/${product.id}`)}>
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(product.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {filteredProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No products found.
                </TableCell>
              </TableRow>
            )}
</TableBody>

        </Table>
      </TableContainer>

      <TableRow style={{ backgroundColor: '#fff3e0' }}>
        <TableCell colSpan={4} style={{ fontWeight: 'bold' }}>
          Total Inventory Value
        </TableCell>
        <TableCell style={{ fontWeight: 'bold', color: '#4CAF50' }}>
          ₹ {totalValue.toFixed(2)}
        </TableCell>
        <TableCell />
      </TableRow>

      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
        onClick={() => navigate('/add')}
      >
        Add Stock
      </Button>
    </Container>
  );
};

export default InventoryList;
