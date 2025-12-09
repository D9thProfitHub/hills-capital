import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import { QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import 'react-toastify/dist/ReactToastify.css';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { WebSocketProvider } from './context/WebSocketContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import ForexEducation from './pages/education/ForexEducation';
import CryptoEducation from './pages/education/CryptoEducation';
import SignalRoom from './pages/SignalRoom';
import CopyTrading from './pages/CopyTrading';
import AffiliateSystem from './pages/AffiliateSystem';
import RobotsAutoPilot from './pages/RobotsAutoPilot';
import Markets from './pages/Markets';
import TermsOfService from './pages/TermsOfService';
import WhatsAppButton from './components/WhatsAppButton';

import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

// Payment Pages
import PaymentStatus from './pages/PaymentStatus';
import PaymentHistory from './pages/PaymentHistory';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#D4AF37', // Darker gold color
      light: '#FFD700',
      dark: '#B8860B',
      contrastText: '#000',
    },
    secondary: {
      main: '#9c27b0', // Purple for secondary actions
      light: '#ba68c8',
      dark: '#7b1fa2',
      contrastText: '#fff',
    },
    success: {
      main: '#2e7d32', // Green for positive values
      light: '#4caf50',
      dark: '#1b5e20',
    },
    error: {
      main: '#d32f2f', // Red for negative values
      light: '#ef5350',
      dark: '#c62828',
    },
    background: {
      default: '#f5f7fa', // Light gray background
      paper: '#ffffff',   // White cards/containers
    },
    text: {
      primary: '#2c3e50',   // Dark text
      secondary: '#7f8c8d', // Secondary text
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px 0 rgba(0,0,0,0.1)',
          },
        },
      },
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <WebSocketProvider>
            <Router>
              <div className="app">
                <Navbar />
                <main className="main-content">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/forex-education" element={<ForexEducation />} />
                    <Route path="/crypto-education" element={<CryptoEducation />} />
                    <Route path="/signals" element={
                      <ProtectedRoute>
                        <SignalRoom />
                      </ProtectedRoute>
                    } />
                    <Route path="/copy-trading" element={
                      <ProtectedRoute>
                        <CopyTrading />
                      </ProtectedRoute>
                    } />
                    <Route path="/affiliate" element={
                      <ProtectedRoute>
                        <AffiliateSystem />
                      </ProtectedRoute>
                    } />
                    <Route path="/robots" element={
                      <ProtectedRoute>
                        <RobotsAutoPilot />
                      </ProtectedRoute>
                    } />
                    <Route path="/markets" element={<Markets />} />

                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } />
                    <Route path="/settings" element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    } />
                    <Route path="/payment-status/:paymentId" element={
                      <ProtectedRoute>
                        <PaymentStatus />
                      </ProtectedRoute>
                    } />
                    <Route path="/payment-history" element={
                      <ProtectedRoute>
                        <PaymentHistory />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </main>
                <Footer />
                <WhatsAppButton />
                <ToastContainer
                  position="bottom-right"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                />
              </div>
            </Router>
          </WebSocketProvider>
        </AuthProvider>
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
