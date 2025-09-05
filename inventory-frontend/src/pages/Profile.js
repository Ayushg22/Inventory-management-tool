import React, { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance"; // use the same instance
import { Container, TextField, Button, Typography, Paper, Box } from "@mui/material";

const Profile = () => {
  const [profile, setProfile] = useState({
    business_name: "",
    gst_number: "",
    annual_turnover: "",
    owner_name: ""
  });
  const [loading, setLoading] = useState(true);

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("/profile");
        setProfile(res.data);
      } catch (err) {
        console.error("Error fetching profile:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post("/profile", profile);
      setProfile(res.data.profile || profile);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Failed to update profile");
    }
  };

  if (loading) return <Typography>Loading profile...</Typography>;

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          User Profile
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField label="Business Name" name="business_name" value={profile.business_name} onChange={handleChange} fullWidth />
          <TextField label="GST Number" name="gst_number" value={profile.gst_number} onChange={handleChange} fullWidth />
          <TextField label="Annual Turnover" name="annual_turnover" value={profile.annual_turnover} onChange={handleChange} fullWidth />
          <TextField label="Owner Name" name="owner_name" value={profile.owner_name} onChange={handleChange} fullWidth />
          <Button type="submit" variant="contained" color="primary">
            Save Changes
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;