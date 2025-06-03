import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Container } from '@mui/material';
import theme from './theme';
import Navbar from './components/Navbar';
import InventoryList from './components/InventoryList';
import AddProductForm from './components/AddProductForm';
import EditProductForm from './components/EditProduct';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './routes/PrivateRoute';


function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Container sx={{ mt: 4 }}>
          <Routes>
            <Route path="/" element={<InventoryList />} />
            <Route path="/inventory" element={<InventoryList />} />
            <Route path="/add" element={<AddProductForm />} />
            <Route path="/edit/:id" element={<EditProductForm />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;
