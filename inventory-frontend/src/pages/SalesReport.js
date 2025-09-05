// src/components/SalesReport.js
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Card,
  CardContent,
  Box,
  useMediaQuery,
  Grid,
} from "@mui/material";
import axiosInstance, { logout } from "../axiosInstance";

const SalesReport = ({ refreshTrigger }) => {
  const [sales, setSales] = useState([]);
  const isMobile = useMediaQuery("(max-width:600px)");

  const fetchSales = async () => {
    try {
      const res = await axiosInstance.get("/sales");
      setSales(res.data.sales || []);
    } catch (err) {
      console.error(err.response?.data || err.message);
      if (err.response?.status === 401) logout();
    }
  };

  // Fetch sales initially and whenever refreshTrigger changes
  useEffect(() => {
    fetchSales();
  }, [refreshTrigger]);

  // Group sales by date
  const groupedSales = sales.reduce((acc, sale) => {
    const date = sale.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(sale);
    return acc;
  }, {});

  const today = new Date().toISOString().split("T")[0];
  const todaySales = groupedSales[today] || [];

  const todayProfit = todaySales.reduce(
    (sum, sale) => sum + (sale.total_profit || 0),
    0
  );
  const todayTotalSales = todaySales.reduce(
    (sum, sale) => sum + (sale.total_amount || 0),
    0
  );

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Daily Profit Report
      </Typography>

      {/* Today's Summary */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          backgroundColor: "#fff",
          p: 2,
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Box
          sx={{
            flex: 1,
            p: 2,
            borderRadius: 2,
            bgcolor: "#e3f2fd",
            textAlign: "center",
            boxShadow: 2,
          }}
        >
          <Typography variant="h6" color="primary">
            Today’s Profit
          </Typography>
          <Typography variant="h5" fontWeight="bold" color="primary">
            ₹ {Number(todayProfit).toFixed(2)}
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            p: 2,
            borderRadius: 2,
            bgcolor: "#e8f5e9",
            textAlign: "center",
            boxShadow: 2,
          }}
        >
          <Typography variant="h6" color="success.main">
            Today’s Sales
          </Typography>
          <Typography variant="h5" fontWeight="bold" color="success.main">
            ₹ {Number(todayTotalSales).toFixed(2)}
          </Typography>
        </Box>
      </Box>

      {Object.keys(groupedSales).length === 0 ? (
        <Typography>No sales recorded yet.</Typography>
      ) : (
        Object.entries(groupedSales).map(([date, salesOnDate]) => (
          <Paper key={date} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {date}
            </Typography>

            {!isMobile && (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Quantity Sold</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Profit</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {salesOnDate.map((sale) =>
                    sale.items.map((item, idx) => (
                      <TableRow key={`${sale.id}-${idx}`}>
                        <TableCell>{item.item_name}</TableCell>
                        <TableCell>{item.quantity_sold}</TableCell>
                        <TableCell style={{ color: "#4CAF50", fontWeight: "bold" }}>
                          ₹ {Number(item.amount || 0).toFixed(2)}
                        </TableCell>
                        <TableCell style={{ color: "#1976d2", fontWeight: "bold" }}>
                          ₹ {Number(item.profit || 0).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  <TableRow style={{ backgroundColor: "#fff3e0" }}>
                    <TableCell colSpan={2} style={{ fontWeight: "bold" }}>
                      Daily Total
                    </TableCell>
                    <TableCell style={{ fontWeight: "bold", color: "#4CAF50" }}>
                      ₹ {Number(
                        salesOnDate.reduce((sum, sale) => sum + (sale.total_amount || 0), 0)
                      ).toFixed(2)}
                    </TableCell>
                    <TableCell style={{ fontWeight: "bold", color: "#1976d2" }}>
                      ₹ {Number(
                        salesOnDate.reduce((sum, sale) => sum + (sale.total_profit || 0), 0)
                      ).toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}

            {isMobile && (
              <Box>
                <Grid container spacing={2}>
                  {salesOnDate.map((sale) =>
                    sale.items.map((item, idx) => (
                      <Grid item xs={12} key={`${sale.id}-${idx}`}>
                        <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
                          <CardContent>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {item.item_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Quantity: {item.quantity_sold}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: "bold", color: "#4CAF50" }}
                            >
                              Amount: ₹ {Number(item.amount || 0).toFixed(2)}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: "bold", color: "#1976d2" }}
                            >
                              Profit: ₹ {Number(item.profit || 0).toFixed(2)}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))
                  )}
                </Grid>

                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: "#fff3e0",
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    Daily Total:{" "}
                    <span style={{ color: "#4CAF50" }}>
                      ₹ {Number(
                        salesOnDate.reduce((sum, sale) => sum + (sale.total_amount || 0), 0)
                      ).toFixed(2)}
                    </span>{" "}
                    |{" "}
                    <span style={{ color: "#1976d2" }}>
                      ₹ {Number(
                        salesOnDate.reduce((sum, sale) => sum + (sale.total_profit || 0), 0)
                      ).toFixed(2)}
                    </span>
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        ))
      )}
    </Container>
  );
};

export default SalesReport;