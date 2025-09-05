// src/components/AddSales.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  MenuItem,
  IconButton,
  Paper
} from "@mui/material";
import { AddCircle, RemoveCircle } from "@mui/icons-material";
import axiosInstance from "../axiosInstance";

const AddSales = ({ handleSaleAdded }) => {
  const [products, setProducts] = useState([]);
  const [saleItems, setSaleItems] = useState([{ product_id: "", quantity_sold: 1 }]);
  const [loading, setLoading] = useState(false);

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axiosInstance.get("/products");
        setProducts(res.data.products || []);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, []);

  const handleChange = (index, field, value) => {
    const newItems = [...saleItems];
    newItems[index][field] = value;
    setSaleItems(newItems);
  };

  const handleAddRow = () => setSaleItems([...saleItems, { product_id: "", quantity_sold: 1 }]);
  const handleRemoveRow = (index) => setSaleItems(saleItems.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    // Validate all products selected
    if (saleItems.some(item => !item.product_id || item.quantity_sold < 1)) {
      alert("Please select a product and enter a valid quantity for all items.");
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post("/sales", { items: saleItems });
      alert("Sale recorded successfully!");

      // Reset form to initial state
      setSaleItems([{ product_id: "", quantity_sold: 1 }]);

      // Trigger SalesReport to refresh
      handleSaleAdded?.(); // optional callback

    } catch (err) {
      console.error("Error recording sale:", err);
      alert(err.response?.data?.error || "Failed to record sale.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Record Sale</Typography>

      {saleItems.map((item, index) => (
        <Paper key={index} sx={{ p: 2, mb: 2 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <TextField
              select
              label="Product"
              value={item.product_id}
              onChange={(e) => handleChange(index, "product_id", e.target.value)}
              fullWidth
            >
              {products.map((p) => (
                <MenuItem key={p._id || p.id} value={p._id || p.id}>
                  {p.item_name} (Stock: {p.quantity})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              type="number"
              label="Quantity"
              value={item.quantity_sold}
              onChange={(e) => handleChange(index, "quantity_sold", parseInt(e.target.value))}
              fullWidth
              inputProps={{ min: 1 }}
            />

            <IconButton color="primary" onClick={handleAddRow}><AddCircle /></IconButton>
            {saleItems.length > 1 && (
              <IconButton color="error" onClick={() => handleRemoveRow(index)}><RemoveCircle /></IconButton>
            )}
          </Box>
        </Paper>
      ))}

      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Recording..." : "Record Sale"}
      </Button>
    </Container>
  );
};

export default AddSales;