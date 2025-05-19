


import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Footer from "./components/Footer";
import PlaceOrder from "./components/PlaceOrder";
import PnLReport from "./components/PnlReport";
import LoginPage from "./components/LoginPage";
import UserLogin from "./components/UserLogin";
import StockChart from "./components/StockChart";
import TradingBot from "./components/TradingBot";


const App = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null); // Optional: store user data

  useEffect(() => {
    // Check for existing token and validate it
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('userData'); // Optional
    
    if (token) {
      // You might want to add token validation here
      setIsAuthenticated(true);
      if (user) {
        setUserData(JSON.parse(user));
      }
    }
  }, []);

  const handleLogin = (token, user) => {
    localStorage.setItem('authToken', token);
    if (user) {
      localStorage.setItem('userData', JSON.stringify(user));
      setUserData(user);
    }
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    // Clear all auth-related data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    // Reset all auth state
    setIsAuthenticated(false);
    setUserData(null);
    
    // Note: The redirect will be handled by the Router's Navigate component
  };

  return (
    <Router>
      {isAuthenticated ? (
        <div className="flex flex-col min-h-screen bg-gray-900 text-white">
          <Header onLogout={handleLogout} userData={userData} />
          <div className="flex flex-1">
            <Sidebar setSelectedOrder={setSelectedOrder} userData={userData} />
            <main className="flex-1 p-5">
              <Routes>
                <Route path="/dashboard" element={<Dashboard userData={userData} />} />
                <Route path="/place-order" element={<PlaceOrder />} />
                <Route path="/pnl-report" element={<PnLReport />} />
                <Route path="/chart_data" element={<StockChart />} />
                <Route path="/trading_bot" element={<TradingBot />} />
                {/* Add other routes as needed */}
                
                {/* Redirect to dashboard for any unknown routes */}
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </main>
          </div>
          <Footer />
        </div>
      ) : (
        <Routes>
          <Route 
            path="/login" 
            element={<LoginPage onLogin={handleLogin} />} 
          />
          <Route 
            path="/user-login" 
            element={<UserLogin onLogin={handleLogin} />} 
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </Router>
  );
};

export default App;



