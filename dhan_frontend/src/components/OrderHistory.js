

import React, { useEffect, useState } from "react";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/binance_order") // 🔥 Flask API se data fetch karna
      .then((response) => response.json())
      .then((data) => setOrders(data))
      .catch((error) => console.error("Error fetching orders:", error));
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">Order History</h2>
      <table className="w-full border border-gray-700 text-left text-sm bg-black text-white">
        <thead>
          <tr className="border-b border-gray-600">
            <th className="p-2">ID</th>
            <th className="p-2">Symbol</th>
            <th className="p-2">Type</th>
            <th className="p-2">Side</th>
            <th className="p-2">Price</th>
            <th className="p-2">Quantity</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((binance_order) => (
            <tr key={binance_order.id} className="border-b border-gray-600">
              <td className="p-2">{binance_order.id}</td>
              <td className="p-2">{binance_order.symbol}</td>
              <td className="p-2">{binance_order.order_type}</td>
              <td className={`p-2 ${binance_order.side === "BUY" ? "text-green-500" : "text-red-500"}`}>
                {binance_order.side}
              </td>
              <td className="p-2">{binance_order.price}</td>
              <td className="p-2">{binance_order.quantity}</td>
              <td className={`p-2 ${binance_order.status === "Filled" ? "text-green-400" : "text-yellow-400"}`}>
                {binance_order.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderHistory;
