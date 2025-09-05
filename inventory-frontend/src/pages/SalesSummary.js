import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
import axiosInstance from "../axiosInstance";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"];

const SalesSummary = () => {
  const [dailySales, setDailySales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axiosInstance.get("/sales/summary");
        setDailySales(res.data.dailySales || []);
        setTopProducts(res.data.topProducts || []);
      } catch (err) {
        console.error("Error fetching sales summary:", err);
      }
    };
    fetchSummary();
  }, []);

  const formatCurrency = (amount) => `₹ ${Number(amount || 0).toFixed(2)}`;

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Sales Summary
      </Typography>

      {/* Charts Section */}
      <Box
        display="flex"
        flexDirection={isMobile ? "column" : "row"}
        gap={4}
        mb={4}
      >
        {/* Top Selling Products - Bar Chart */}
        {topProducts.length > 0 && (
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              Top Selling Products
            </Typography>
            <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
              <BarChart
                data={topProducts.slice(0, 5)}
                margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => value || 0} />
                <Legend />
                <Bar dataKey="quantity" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        )}

        {/* Sales & Profit Over Time - Line Chart */}
        {dailySales.length > 0 && (
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              Sales & Profit Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
              <LineChart
                data={dailySales}
                margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8884d8" />
                <Line type="monotone" dataKey="profit" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        )}
      </Box>

      {/* Profit Distribution - Pie Chart */}
      {topProducts.length > 0 && (
        <Paper sx={{ p: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Profit Distribution by Product
          </Typography>
          <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
            <PieChart>
              <Pie
                data={topProducts.slice(0, 5)}
                dataKey="profit"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={isMobile ? 80 : 100}
                label={(entry) => `${entry.name}: ${formatCurrency(entry.profit)}`}
              >
                {topProducts.slice(0, 5).map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      )}

      {/* Daily Sales Table */}
      {dailySales.length === 0 ? (
        <Typography>No sales recorded yet.</Typography>
      ) : (
        <Paper sx={{ p: 2, overflowX: "auto" }}>
          <Typography variant="h6" gutterBottom>
            Daily Sales Summary
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Total Items Sold</TableCell>
                <TableCell>Total Sales</TableCell>
                <TableCell>Total Profit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dailySales.map((day) => (
                <TableRow key={day.date}>
                  <TableCell>{day.date}</TableCell>
                  <TableCell>{day.total_items || 0}</TableCell>
                  <TableCell>{formatCurrency(day.sales)}</TableCell>
                  <TableCell>{formatCurrency(day.profit)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Container>
  );
};

export default SalesSummary;