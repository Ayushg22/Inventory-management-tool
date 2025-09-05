// src/App.js
import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, Container, CircularProgress, Box } from "@mui/material";
import theme from "./theme";
import Navbar from "./components/Navbar";
import DashboardNavbar from "./components/DashboardNavbar";
import PrivateRoute from "./routes/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";

// Lazy-loaded pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const InventoryList = lazy(() => import("./components/InventoryList"));
const AddProductForm = lazy(() => import("./components/AddProductForm"));
const EditProductForm = lazy(() => import("./components/EditProduct"));
const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const Profile = lazy(() => import("./pages/Profile"));
const AddSales = lazy(() => import("./pages/AddSales"));
const SalesReport = lazy(() => import("./pages/SalesReport"));
const SalesSummary = lazy(() => import("./pages/SalesSummary"));

// Loader component for Suspense fallback
const Loader = () => (
  <Box display="flex" justifyContent="center" alignItems="center" mt={10}>
    <CircularProgress />
  </Box>
);

// Navbar wrapper to show DashboardNavbar only on "/"
const NavbarWrapper = () => {
  const location = useLocation();
  return location.pathname === "/" ? <DashboardNavbar /> : <Navbar />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <NavbarWrapper />

          <Container sx={{ mt: 4 }}>
            <Suspense fallback={<Loader />}>
              <Routes>
              {/* Public routes */}
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />

              {/* Private routes */}
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/products"
                element={
                  <PrivateRoute>
                    <InventoryList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/add"
                element={
                  <PrivateRoute>
                    <AddProductForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/edit/:id"
                element={
                  <PrivateRoute>
                    <EditProductForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/sales/add"
                element={
                  <PrivateRoute>
                    <AddSales />
                  </PrivateRoute>
                }
              />
              <Route
                path="/sales-report"
                element={
                  <PrivateRoute>
                    <SalesReport />
                  </PrivateRoute>
                }
              />
              <Route
                path="/sales-summary"
                element={
                  <PrivateRoute>
                    <SalesSummary />
                  </PrivateRoute>
                }
              />

              {/* Redirect unknown routes */}
              <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Suspense>
          </Container>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;