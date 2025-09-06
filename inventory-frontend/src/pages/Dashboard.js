import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../axiosInstance"; // 🔑 axios setup with JWT

const Dashboard = () => {
  const navigate = useNavigate();

  // 🔹 State for stats
  const [stats, setStats] = useState({
    totalProducts: 0,
    salesToday: 0,
    revenueMonth: 0,
    bestSeller: { name: "N/A", quantity: 0 },
  });

  // 🔹 State for recent activity
  const [recentSales, setRecentSales] = useState([]);

  useEffect(() => {
    const fetchStatsAndActivity = async () => {
      try {
        // ✅ Fetch products count
        const productsRes = await axiosInstance.get("/products");
        const totalProducts = productsRes.data.products?.length || 0;

        // ✅ Fetch sales summary
        const salesSummaryRes = await axiosInstance.get("/sales/summary");
        const dailySales = salesSummaryRes.data.dailySales || [];
        const topProducts = salesSummaryRes.data.topProducts || [];

        const today = new Date().toISOString().slice(0, 10);
        const todayData = dailySales.find((d) => d.date === today);

        const salesToday = todayData ? todayData.sales : 0;
        const revenueMonth = Math.round(
          dailySales
            .filter((d) => d.date.startsWith(today.slice(0, 7)))
            .reduce((sum, d) => sum + d.sales, 0)
        );
        
        // Format with commas
        const formattedRevenueMonth = revenueMonth.toLocaleString();

        const bestSeller =
          topProducts.length > 0
            ? topProducts[0]
            : { name: "N/A", quantity: 0 };

        setStats({
          totalProducts,
          salesToday,
          revenueMonth,
          bestSeller,
        });

        // ✅ Fetch recent sales (limit to 5 latest)
        const salesRes = await axiosInstance.get("/sales");
        let salesList = salesRes.data.sales || [];

        // Sort by date (latest first) and take top 5
        salesList = salesList
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);

        setRecentSales(salesList);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchStatsAndActivity();
  }, []);

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
        <Grid item xs={12} sm={6} md={3}>
  <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
    <CardContent>
      <Typography variant="h6">📦 Products</Typography>
      <Typography variant="h4">{stats.totalProducts.toLocaleString()}</Typography>
      <Typography color="text.secondary">In stock</Typography>
    </CardContent>
  </Card>
</Grid>

<Grid item xs={12} sm={6} md={3}>
  <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
    <CardContent>
      <Typography variant="h6">💰 Sales Today</Typography>
      <Typography variant="h4">₹{stats.salesToday.toLocaleString()}</Typography>
      <Typography color="text.secondary">vs yesterday</Typography>
    </CardContent>
  </Card>
</Grid>

<Grid item xs={12} sm={6} md={3}>
  <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
    <CardContent>
      <Typography variant="h6">📈 Revenue</Typography>
      <Typography variant="h4">₹{stats.revenueMonth.toLocaleString()}</Typography>
      <Typography color="text.secondary">This month</Typography>
    </CardContent>
  </Card>
</Grid>

<Grid item xs={12} sm={6} md={3}>
  <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
    <CardContent>
      <Typography variant="h6">🏆 Best Seller</Typography>
      <Typography variant="h4">{stats.bestSeller.name}</Typography>
      <Typography color="text.secondary">
        {stats.bestSeller.quantity.toLocaleString()} units sold
      </Typography>
    </CardContent>
  </Card>
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

        {/* ✅ Recent Activity (Dynamic) */}
        <Box mt={5}>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <Paper sx={{ p: 2, borderRadius: 3 }}>
            {recentSales.length > 0 ? (
              recentSales.map((sale) => (
                <Box key={sale.id} mb={1}>
                  <Typography variant="body2">
                    ✔️ Sale recorded on {sale.date} — ₹{sale.total_amount}
                  </Typography>
                  {sale.items.slice(0, 2).map((item, idx) => (
                    <Typography key={idx} variant="body2" color="text.secondary">
                      • {item.item_name} ({item.quantity_sold} units)
                    </Typography>
                  ))}
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No recent sales yet.
              </Typography>
            )}
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