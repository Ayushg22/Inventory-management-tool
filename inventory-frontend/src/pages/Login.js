import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
} from '@mui/material';
import axiosInstance from '../axiosInstance';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showCreateBtn, setShowCreateBtn] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShowCreateBtn(false);

    try {
      const response = await axiosInstance.post('/login', form);
      const accessToken = response.data.access_token;
      const refreshToken = response.data.refresh_token;
      const user = response.data.user;

      login(accessToken, refreshToken, user);
      navigate('/');
    } catch (err) {
      const status = err.response?.status;
      const errorMsg = err.response?.data?.error || 'Login failed';

      console.error('Login failed:', err.response?.data || err.message);
      setError(errorMsg);

      if (status === 404 && err.response?.data?.redirect === '/register') {
        setShowCreateBtn(true);
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper
        elevation={4}
        sx={{
          p: 4,
          marginTop: 8,
          width: 350,
          bgcolor: '#fff8e1',
          borderRadius: 3,
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          Login to Your Account
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
          >
            Login
          </Button>

          <Typography align="center" sx={{ mt: 2 }}>
            New here?{' '}
            <Button
              variant="text"
              color="primary"
              onClick={() => navigate('/register')}
              sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}
            >
              Register
            </Button>{' '}
            first.
          </Typography>

          {showCreateBtn && (
            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              sx={{ mt: 2 }}
              onClick={() => navigate('/register')}
            >
              Create Account
            </Button>
          )}

          {error && (
            <Typography color="error" align="center" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;