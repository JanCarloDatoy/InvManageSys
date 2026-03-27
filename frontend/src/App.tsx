import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProductProvider } from './contexts/ProductContext';
import { SaleProvider } from './contexts/SaleContext';
import { SupplierProvider } from './contexts/SupplierContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Products from './pages/Products/Products';
import Suppliers from './pages/Suppliers/Suppliers';
import Sales from './pages/Sales/Sales';
import Customers from './pages/Customers/Customers';
import Reports from './pages/Reports/Reports';
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ProductProvider>
          <SaleProvider>
            <SupplierProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="products" element={<Products />} />
                  <Route path="suppliers" element={<Suppliers />} />
                  <Route path="sales" element={<Sales />} />
                  <Route path="customers" element={<Customers />} />
                  <Route path="reports" element={<Reports />} />
                </Route>
              </Routes>
            </SupplierProvider>
          </SaleProvider>
        </ProductProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
