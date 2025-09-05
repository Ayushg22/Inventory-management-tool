import React from "react";
import { Box, Typography, Grid, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      {/* Main Content */}
      <Box flexGrow={1} p={{ xs: 2, sm: 3 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}
        >
          Dashboard
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              onClick={() => navigate("/products")}
              sx={{
                p: { xs: 2, sm: 3 },
                textAlign: "center",
                cursor: "pointer",
                minHeight: { xs: 80, sm: 100 },
                "&:hover": { boxShadow: 6 },
              }}
            >
              <Typography variant="h6" sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                📦 Inventory List
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
                minHeight: { xs: 80, sm: 100 },
                "&:hover": { boxShadow: 6 },
              }}
            >
              <Typography variant="h6" sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                ➕ Add Sale
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
                minHeight: { xs: 80, sm: 100 },
                "&:hover": { boxShadow: 6 },
              }}
            >
              <Typography variant="h6" sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                📊 Sales Report
              </Typography>
            </Paper>
          </Grid>

          {/* ✅ Sales Summary */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              onClick={() => navigate("/sales-summary")}
              sx={{
                p: { xs: 2, sm: 3 },
                textAlign: "center",
                cursor: "pointer",
                minHeight: { xs: 80, sm: 100 },
                "&:hover": { boxShadow: 6 },
              }}
            >
              <Typography variant="h6" sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                📈 Sales Summary
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* ✅ Sticky Footer */}
      <Box
        component="footer"
        sx={{
          py: 2,
          textAlign: "center",
          borderTop: "1px solid #ddd",
          backgroundColor: "#f9f9f9",
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