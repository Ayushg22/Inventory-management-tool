import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  Button
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DashboardNavbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <AppBar
      position="static"
      sx={{
        background: "linear-gradient(90deg, #2196F3, #21CBF3)",
        mb: 3,
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        
        {/* Left: Welcome message */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: "#fff",
              color: "#2196F3",
              width: 45,
              height: 45,
              fontWeight: "bold",
              fontSize: "1.2rem"
            }}
          >
            {user?.username?.[0]?.toUpperCase()}
          </Avatar>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Welcome back, {user?.username} 👋
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {user?.email}
            </Typography>
          </Box>
        </Box>

        {/* Right: Logout Button */}
        <Button
          color="inherit"
          onClick={handleLogout}
          startIcon={<LogoutIcon />}
          sx={{
            fontWeight: "bold",
            textTransform: "none",
            bgcolor: "rgba(255,255,255,0.15)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.25)" }
          }}
        >
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default DashboardNavbar;