import React from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh" bgcolor="#f9fafb">
      {/* Main Content */}
      <Box flexGrow={1} p={{ xs: 2, sm: 4 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontSize: { xs: "1.75rem", sm: "2rem" }, fontWeight: 600 }}
        >
          Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Your business at a glance 🚀
        </Typography>

        {/* ✅ Stats Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6">📦 Products</Typography>
                <Typography variant="h4">120</Typography>
                <Typography color="text.secondary">In stock</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6">💰 Sales Today</Typography>
                <Typography variant="h4">₹8,500</Typography>
                <Typography color="text.secondary">+12% vs yesterday</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6">📈 Revenue</Typography>
                <Typography variant="h4">₹2.5L</Typography>
                <Typography color="text.secondary">This month</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6">🏆 Best Seller</Typography>
                <Typography variant="h4">Ear Pods</Typography>
                <Typography color="text.secondary">5 units today</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* ✅ Action Buttons */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              onClick={() => navigate("/products")}
              sx={{
                p: { xs: 2, sm: 3 },
                textAlign: "center",
                cursor: "pointer",
                minHeight: { xs: 100, sm: 120 },
                borderRadius: 3,
                transition: "0.3s",
                "&:hover": { boxShadow: 6, transform: "translateY(-3px)" },
              }}
            >
              <Typography variant="h6">📦 Inventory List</Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your products
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper
              onClick={() => navigate("/sales/add")}
              sx={{
                p: { xs: 2, sm: 3 },
                textAlign: "center",
                cursor: "pointer",
                minHeight: { xs: 100, sm: 120 },
                borderRadius: 3,
                transition: "0.3s",
                "&:hover": { boxShadow: 6, transform: "translateY(-3px)" },
              }}
            >
              <Typography variant="h6">➕ Add Sale</Typography>
              <Typography variant="body2" color="text.secondary">
                Record new transactions
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper
              onClick={() => navigate("/sales-report")}
              sx={{
                p: { xs: 2, sm: 3 },
                textAlign: "center",
                cursor: "pointer",
                minHeight: { xs: 100, sm: 120 },
                borderRadius: 3,
                transition: "0.3s",
                "&:hover": { boxShadow: 6, transform: "translateY(-3px)" },
              }}
            >
              <Typography variant="h6">📊 Sales Report</Typography>
              <Typography variant="body2" color="text.secondary">
                Track your sales
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper
              onClick={() => navigate("/sales-summary")}
              sx={{
                p: { xs: 2, sm: 3 },
                textAlign: "center",
                cursor: "pointer",
                minHeight: { xs: 100, sm: 120 },
                borderRadius: 3,
                transition: "0.3s",
                "&:hover": { boxShadow: 6, transform: "translateY(-3px)" },
              }}
            >
              <Typography variant="h6">📈 Sales Summary</Typography>
              <Typography variant="body2" color="text.secondary">
                See detailed insights
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* ✅ Recent Activity */}
        <Box mt={5}>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <Paper sx={{ p: 2, borderRadius: 3 }}>
            <Typography variant="body2">✔️ Added sale for GPU - ₹50,000</Typography>
            <Typography variant="body2">✔️ New product added: S24 Ultra</Typography>
            <Typography variant="body2">⚠️ Low stock alert: Ear Pods (2 left)</Typography>
          </Paper>
        </Box>
      </Box>

      {/* ✅ Sticky Footer */}
      <Box
        component="footer"
        sx={{
          py: 2,
          textAlign: "center",
          borderTop: "1px solid #ddd",
          backgroundColor: "#f1f1f1",
          mt: "auto",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Inventory Manager. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;