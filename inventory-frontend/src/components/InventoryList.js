import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import { MoreVert } from "@mui/icons-material";
import axiosInstance, { logout } from "../axiosInstance";

const InventoryList = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalValue, setTotalValue] = useState(0);
  const [businessName, setBusinessName] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:600px)");

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const res = await axiosInstance.get("/profile");
      setBusinessName(res.data.business_name || "My Inventory");
    } catch (err) {
      if (err.response?.status === 401) logout(); // token expired or invalid
      else if (err.response?.status === 404) setBusinessName("My Inventory");
      else console.error("Error fetching profile:", err.response?.data || err.message);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await axiosInstance.get("/products");
      setProducts(res.data.products || []);
      setTotalValue(res.data.total_value || 0);
    } catch (err) {
      console.error("Error fetching products:", err.response?.data || err.message);
      if (err.response?.status === 401) logout();
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchProducts();
  }, [fetchProfile, fetchProducts]);

  // Delete product
  const handleDelete = async (id) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await axiosInstance.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err.response?.data || err.message);
      if (err.response?.status === 401) logout();
    }
  };

  // Menu handlers
  const handleMenuOpen = (event, product) => {
    setAnchorEl(event.currentTarget);
    setSelectedProduct(product);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProduct(null);
  };

  const filteredProducts = products.filter(
    (product) =>
      (product.item_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.category || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loadingProfile || loadingProducts) {
    return (
      <Container sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom>
        {businessName}
      </Typography>

      {/* Search bar */}
      <TextField
        label="Search by name or category"
        variant="outlined"
        fullWidth
        sx={{ mb: 3 }}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Desktop Table */}
      {!isMobile && (
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
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.item_name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>₹ {product.selling_price}</TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell>{product.purchase_date}</TableCell>
                    <TableCell>
                      <IconButton onClick={(e) => handleMenuOpen(e, product)}>
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
              <TableRow style={{ backgroundColor: "#fff3e0" }}>
                <TableCell colSpan={4} style={{ fontWeight: "bold" }}>
                  Total Inventory Value
                </TableCell>
                <TableCell style={{ fontWeight: "bold", color: "#4CAF50" }}>
                  ₹ {totalValue.toFixed(2)}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Mobile Card View */}
      {isMobile && (
        <Grid container spacing={2}>
          {filteredProducts.length === 0 ? (
            <Typography variant="body2" align="center" sx={{ mt: 2, width: "100%" }}>
              No products found.
            </Typography>
          ) : (
            filteredProducts.map((product) => (
              <Grid item xs={6} key={product.id}>
                <Card sx={{ boxShadow: 3, borderRadius: 3, p: 1, "&:hover": { boxShadow: 6 } }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" noWrap sx={{ mb: 0.5 }}>
                      {product.item_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 0.5 }}>
                      {product.category}
                    </Typography>
                    <Typography variant="body2">₹ {product.selling_price}</Typography>
                    <Typography variant="body2">Qty: {product.quantity}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                      {product.purchase_date}
                    </Typography>
                  </CardContent>
                  <Box display="flex" justifyContent="flex-end">
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, product)}>
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </Box>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            navigate(`/edit/${selectedProduct?.id}`);
            handleMenuClose();
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDelete(selectedProduct?.id);
            handleMenuClose();
          }}
          sx={{ color: "red" }}
        >
          Delete
        </MenuItem>
      </Menu>

      <Button variant="contained" color="primary" sx={{ mt: 3 }} onClick={() => navigate("/add")} fullWidth={isMobile}>
        Add Stock
      </Button>
    </Container>
  );
};

export default InventoryList;