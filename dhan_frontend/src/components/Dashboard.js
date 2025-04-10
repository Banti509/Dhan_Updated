
// import React from "react";
// import { Card, CardContent } from "../components/ui/card";


// export default function DashboardContent() {
//   return (
//     <div className="mt-6 grid grid-cols-3 gap-6">
//       <Card className="bg-gray-900 p-4 border border-yellow-500">
//         <CardContent>
//           <p className="text-lg font-bold">Create Order</p>
//         </CardContent>
//       </Card>
//       <Card className="bg-gray-900 p-4 border border-yellow-500">
//         <CardContent className="flex flex-col gap-3">
//           <p className="text-lg font-bold">Modify Order</p>
//         </CardContent>
//       </Card>
//       <Card className="bg-gray-900 p-4 border border-yellow-500">
//         <CardContent>
//           <p className="text-lg font-bold">Cancel Order</p>
//         </CardContent>
//       </Card>
//       <Card className="bg-gray-900 p-4 border border-yellow-500">
//         <CardContent>
//           <p className="text-lg font-bold">PNL Report & Order Sell</p>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }




// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { Card, CardContent } from "../components/ui/card";

// export default function DashboardContent() {
//   const navigate = useNavigate();

//   const handleNavigation = (path) => {
//     navigate(path);
//   };

//   return (
//     <div className="mt-6 grid grid-cols-3 gap-6">
//       <Card
//         className="bg-gray-900 p-4 border border-yellow-500 cursor-pointer hover:opacity-80"
//         onClick={() => handleNavigation("/place-order")}
//       >
//         <CardContent>
//           <p className="text-lg font-bold">Create Order</p>
//         </CardContent>
//       </Card>

//       <Card
//         className="bg-gray-900 p-4 border border-yellow-500 cursor-pointer hover:opacity-80"
//         onClick={() => handleNavigation("/modify-order")}
//       >
//         <CardContent className="flex flex-col gap-3">
//           <p className="text-lg font-bold">Modify Order</p>
//         </CardContent>
//       </Card>

//       <Card
//         className="bg-gray-900 p-4 border border-yellow-500 cursor-pointer hover:opacity-80"
//         onClick={() => handleNavigation("/cancel-order")}
//       >
//         <CardContent>
//           <p className="text-lg font-bold">Cancel Order</p>
//         </CardContent>
//       </Card>

//       <Card
//         className="bg-gray-900 p-4 border border-yellow-500 cursor-pointer hover:opacity-80"
//         onClick={() => handleNavigation("/pnl-report")}
//       >
//         <CardContent>
//           <p className="text-lg font-bold">PNL Report & Order Sell</p>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }




// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { Card, CardContent } from "../components/ui/card";

// export default function DashboardContent() {
//   const navigate = useNavigate();

//   const dashboardCards = [
//     {
//       title: "Create Order",
//       path: "/place-order",
//       icon: "📊",
//       description: "Place new trades and orders"
//     },
//     {
//       title: "Modify Order",
//       path: "/modify-order",
//       icon: "✏️",
//       description: "Edit your existing orders"
//     },
//     {
//       title: "Cancel Order",
//       path: "/cancel-order",
//       icon: "❌",
//       description: "Remove pending orders"
//     },
//     {
//       title: "PNL Report",
//       path: "/pnl-report",
//       icon: "💰",
//       description: "View profit/loss and close positions"
//     }
//   ];

//   return (
//     <div className="mt-8">
//       <h2 className="text-2xl font-bold mb-6">Trading Dashboard</h2>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {dashboardCards.map((card, index) => (
//           <Card
//             key={index}
//             className="bg-gray-800 border border-gray-700 hover:border-yellow-500 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-yellow-500/10"
//             onClick={() => navigate(card.path)}
//           >
//             <CardContent className="p-6 flex flex-col items-center text-center h-full">
//               <span className="text-3xl mb-3">{card.icon}</span>
//               <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
//               <p className="text-gray-400 text-sm">{card.description}</p>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// }



import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";

export default function DashboardContent() {
  const navigate = useNavigate();

  const handleCardClick = (path) => {
    navigate(path); // This will programmatically navigate to the specified path
  };

  const dashboardCards = [
    {
      id: 1, // Added unique ID
      title: "Create Order",
      path: "/place-order",
      icon: "📊",
      description: "Place new trades and orders"
    },
    {
      id: 2,
      title: "Modify Order",
      path: "/modify-order",
      icon: "✏️",
      description: "Edit your existing orders"
    },
    {
      id: 3,
      title: "Cancel Order",
      path: "/cancel-order",
      icon: "❌",
      description: "Remove pending orders"
    },
    {
      id: 4,
      title: "PNL Report",
      path: "/pnl-report",
      icon: "💰",
      description: "View profit/loss and close positions"
    }
  ];

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-6">Trading Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardCards.map((card) => (
          <Card
            key={card.id} // Using unique ID instead of index
            className="bg-gray-800 border border-gray-700 hover:border-yellow-500 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-yellow-500/10"
            onClick={() => handleCardClick(card.path)}
          >
            <CardContent className="p-6 flex flex-col items-center text-center h-full">
              <span className="text-3xl mb-3">{card.icon}</span>
              <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
              <p className="text-gray-400 text-sm">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}