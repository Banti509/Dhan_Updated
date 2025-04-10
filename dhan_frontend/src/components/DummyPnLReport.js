// import { useState, useEffect } from "react";
// import axios from "axios";

// export default function PnLReport() {
//     const [orders, setOrders] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         async function fetchPnL() {
//             try {
//                 const response = await axios.get("http://localhost:5000/api/dummy_pnl_report");
//                 setOrders(response.data);
//             } catch (err) {
//                 setError("Failed to load PnL data.");
//             } finally {
//                 setLoading(false);
//             }
//         }
//         fetchPnL();
//     }, []);

//     return (
//         <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white max-w-3xl mx-auto">
//             <h1 className="text-xl font-bold mb-4 text-center">Dummy Order PnL Report</h1>

//             {loading ? (
//                 <p className="text-center text-blue-500">Loading PnL data...</p>
//             ) : error ? (
//                 <p className="text-center text-red-500">{error}</p>
//             ) : (
//                 <div className="overflow-x-auto">
//                     <table className="w-full border-collapse border border-gray-300">
//                         <thead className="bg-gray-100">
//                             <tr>
//                                 <th className="border p-2">Order ID</th>
//                                 <th className="border p-2">Symbol</th>
//                                 <th className="border p-2">Buy Price</th>
//                                 <th className="border p-2">Live Price</th>
//                                 <th className="border p-2">Quantity</th>
//                                 <th className="border p-2">PnL</th>
//                                 <th className="border p-2">PnL %</th>
//                                 <th className="border p-2">Type</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {orders.map((order) => (
//                                 <tr key={order.order_id} className="text-center">
//                                     <td className="border p-2">{order.order_id}</td>
//                                     <td className="border p-2">{order.symbol}</td>
//                                     <td className="border p-2">${order.price.toFixed(2)}</td>
//                                     <td className="border p-2">${order.live_price.toFixed(2)}</td>
//                                     <td className="border p-2">{order.quantity}</td>
//                                     <td className={`border p-2 ${order.unrealized_pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
//                                         ${order.unrealized_pnl.toFixed(2)}
//                                     </td>
//                                     <td className={`border p-2 ${order.pnl_percentage >= 0 ? "text-green-500" : "text-red-500"}`}>
//                                         {order.pnl_percentage.toFixed(2)}%
//                                     </td>
//                                     <td className="border p-2">{order.order_type}</td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             )}
//         </div>
//     );
// }





import { useState, useEffect } from "react";
import axios from "axios";

export default function PnLReport() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchPnL() {
            try {
                const response = await axios.get("http://localhost:5000/api/dummy_pnl_report");
                setOrders(response.data);
            } catch (err) {
                setError("Failed to load PnL data.");
            } finally {
                setLoading(false);
            }
        }
        fetchPnL();
    }, []);

    // Calculate Totals
    const totalQuantity = orders.reduce((sum, order) => sum + order.quantity, 0);
    const totalProfit = orders.reduce((sum, order) => sum + (order.unrealized_pnl > 0 ? order.unrealized_pnl : 0), 0);
    const totalLoss = orders.reduce((sum, order) => sum + (order.unrealized_pnl < 0 ? order.unrealized_pnl : 0), 0);
    const totalPnLPercentage = orders.length ? totalProfit / orders.reduce((sum, order) => sum + order.price * order.quantity, 0) * 100 : 0;

    return (
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg text-white max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-4 text-center">Dummy Order PnL Report</h1>

            {loading ? (
                <p className="text-center text-blue-500">Loading PnL data...</p>
            ) : error ? (
                <p className="text-center text-red-500">{error}</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border border-gray-600 rounded-lg text-sm">
                        <thead className="bg-gray-700 text-white sticky top-0">
                            <tr className="uppercase text-gray-300">
                                <th className="border border-gray-600 p-2">Order ID</th>
                                <th className="border border-gray-600 p-2">Symbol</th>
                                <th className="border border-gray-600 p-2">Buy Price</th>
                                <th className="border border-gray-600 p-2">Live Price</th>
                                <th className="border border-gray-600 p-2">Quantity</th>
                                <th className="border border-gray-600 p-2">PnL %</th>
                                <th className="border border-gray-600 p-2">Profit</th>
                                <th className="border border-gray-600 p-2">Loss</th>
                                <th className="border border-gray-600 p-2">Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order, index) => {
                                const profit = order.unrealized_pnl > 0 ? order.unrealized_pnl : 0;
                                const loss = order.unrealized_pnl < 0 ? order.unrealized_pnl : 0;

                                return (
                                    <tr key={order.order_id} className={`text-center text-gray-300 ${index % 2 === 0 ? "bg-gray-800" : "bg-gray-700"} hover:bg-gray-600`}>
                                        <td className="border border-gray-600 p-2 font-mono">{order.order_id}</td>
                                        <td className="border border-gray-600 p-2">{order.symbol}</td>
                                        <td className="border border-gray-600 p-2 font-mono">${order.price.toFixed(2)}</td>
                                        <td className="border border-gray-600 p-2 font-mono">${order.live_price.toFixed(2)}</td>
                                        <td className="border border-gray-600 p-2 font-mono">{order.quantity.toFixed(3)}</td>
                                        <td className={`border border-gray-600 p-2 font-mono ${order.pnl_percentage >= 0 ? "text-green-400" : "text-red-400"}`}>
                                            {order.pnl_percentage.toFixed(2)}%
                                        </td>
                                        <td className="border border-gray-600 p-2 font-mono text-green-400">
                                            {profit > 0 ? `$${profit.toFixed(2)}` : "-"}
                                        </td>
                                        <td className="border border-gray-600 p-2 font-mono text-red-400">
                                            {loss < 0 ? `$${loss.toFixed(2)}` : "-"}
                                        </td>
                                        <td className="border border-gray-600 p-2">{order.order_type}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="bg-gray-800 font-bold text-white">
                            <tr className="text-center">
                                <td className="border border-gray-600 p-2" colSpan="4">Total</td>
                                <td className="border border-gray-600 p-2">{totalQuantity.toFixed(2)}</td>
                                <td className="border border-gray-600 p-2 text-green-400">{totalPnLPercentage.toFixed(2)}%</td>
                                <td className="border border-gray-600 p-2 text-green-400">${totalProfit.toFixed(2)}</td>
                                <td className="border border-gray-600 p-2 text-red-400">${totalLoss.toFixed(2)}</td>
                                <td className="border border-gray-600 p-2">-</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}
        </div>
    );
}
