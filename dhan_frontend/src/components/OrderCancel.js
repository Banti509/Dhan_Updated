import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const CancelOrder = () => {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState('');
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const handleCancelOrder = async () => {
    if (!orderId) {
      setMessage("❌ Order ID is required.");
      return;
    }

    setLoading(true);
    setMessage('');
    setShowPopup(false);

    try {
      const response = await axios.delete('http://localhost:5000/cancel-order', {
        data: { symbol, orderId },
      });

      setMessage(`✅ Order Canceled Successfully! Order ID: ${response.data.response.orderId}`);
      setShowPopup(true); // Show success popup

      // Hide popup after 3 seconds
      setTimeout(() => setShowPopup(false), 3000);

      // Clear input fields
      setOrderId('');
    } catch (error) {
      setMessage(`❌ Error: ${error.response?.data?.error || "Failed to cancel order"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Cancel Binance Order</h1>

      <label className="block text-sm mb-2">Order ID:</label>
      <input 
        type="text" 
        value={orderId} 
        onChange={(e) => setOrderId(e.target.value)}
        className="w-full p-2 rounded bg-gray-700 border border-gray-600 mb-3"
        placeholder="Enter Order ID"
      />

      <label className="block text-sm mb-2">Symbol:</label>
      <input 
        type="text" 
        value={symbol} 
        onChange={(e) => setSymbol(e.target.value)}
        className="w-full p-2 rounded bg-gray-700 border border-gray-600 mb-3"
      />

      <button 
        onClick={handleCancelOrder} 
        disabled={loading}
        className="w-full p-2 mt-3 bg-red-500 text-white font-bold rounded hover:bg-red-600"
      >
        {loading ? 'Canceling Order...' : 'Cancel Order'}
      </button>

      <button
        onClick={() => navigate("/")}
        className="w-full p-2 mt-3 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        Back to Dashboard
      </button>

      {message && <div className="mt-4 p-2 bg-blue-600 text-white rounded">{message}</div>}

      {/* Popup Message */}
      {showPopup && (
        <div className="fixed top-10 right-10 bg-green-500 text-white p-3 rounded-lg shadow-lg">
          Order Canceled Successfully!
        </div>
      )}
    </div>
  );
};

export default CancelOrder;
