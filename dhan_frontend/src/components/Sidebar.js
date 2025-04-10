

// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Home, ClipboardList, Settings, User, ChevronDown } from "lucide-react";

// export default function Sidebar({ setSelectedOrder }) {
//   const [openDropdown, setOpenDropdown] = useState(null);
//   const [openSubmenu, setOpenSubmenu] = useState(null); // Separate state for submenu
//   const navigate = useNavigate();

//   // Function to toggle main dropdowns (Orders, User Data History)
//   const toggleDropdown = (dropdown) => {
//     setOpenDropdown(openDropdown === dropdown ? null : dropdown);
//     setOpenSubmenu(null); // Close any open submenu when switching main dropdown
//   };

//   // Function to toggle submenus (Spot Order inside Orders)
//   const toggleSubmenu = (submenu) => {
//     setOpenSubmenu(openSubmenu === submenu ? null : submenu);
//   };

//   return (
//     <div className="w-64 p-4 border-r border-gray-700 flex flex-col gap-4">
//       <nav className="flex flex-col gap-2">
//         <button className="flex items-center gap-2 p-2 rounded-lg bg-gray-800">
//           <Home /> Dashboard
//         </button>

//         {/* Orders Dropdown */}
//         <div>
//           <button
//             className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-gray-800"
//             onClick={() => toggleDropdown("orders")}
//           >
//             <span className="flex items-center gap-2"><ClipboardList /> Orders</span>
//             <ChevronDown className={`transition-transform ${openDropdown === "orders" ? "rotate-180" : ""}`} />
//           </button>

//           {openDropdown === "orders" && (
//             <div className="ml-6 mt-2 flex flex-col gap-2">
//               <button
//                 className="p-2 rounded-lg hover:bg-gray-700"
//                 onClick={() => toggleSubmenu("spotOrders")}
//               >
//                 Spot Order
//               </button>

//               {openSubmenu === "spotOrders" && (
//                 <div className="ml-6 mt-2 flex flex-col gap-2">
//                   <button className="p-2 rounded-lg hover:bg-gray-500" onClick={() => navigate('/place-order')}>
//                     Create Order
//                   </button>
//                   <button className="p-2 rounded-lg hover:bg-gray-500" onClick={() => navigate('/pnl-report')}>
//                     PNL Report
//                   </button>
//                   <button className="p-2 rounded-lg hover:bg-gray-500" onClick={() => navigate('/modify-order')}>
//                     Order Modify
//                   </button>
//                   <button className="p-2 rounded-lg hover:bg-gray-500" onClick={() => navigate('/cancel-order')}>
//                     Order Cancel
//                   </button>
//                   <button className="p-2 rounded-lg hover:bg-gray-500" onClick={() => navigate('/dummy_pnl_report')}>
//                     Dummy Order PNL
//                   </button>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* User Data History Dropdown */}
//         <div>
//           <button
//             className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-gray-800"
//             onClick={() => toggleDropdown("userHistory")}
//           >
//             <span className="flex items-center gap-2"><User /> User Data History</span>
//             <ChevronDown className={`transition-transform ${openDropdown === "userHistory" ? "rotate-180" : ""}`} />
//           </button>

//           {openDropdown === "userHistory" && (
//             <div className="ml-6 mt-2 flex flex-col gap-2">
//               <button
//                 className="p-2 rounded-lg hover:bg-gray-700"
//                 onClick={() => toggleSubmenu("userDetails")}
//               >
//                 Show Data
//               </button>

//               {openSubmenu === "userDetails" && (
//                 <div className="ml-6 mt-2 flex flex-col gap-2">
//                   <button className="p-2 rounded-lg hover:bg-gray-600" onClick={() => navigate('/binance_order')}>
//                     Order Details
//                   </button>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* User Account Dropdown */}
//         <div>
//           <button
//             className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-gray-800"
//             onClick={() => toggleDropdown("Account")}
//           >
//             <span className="flex items-center gap-2"><User /> Account</span>
//             <ChevronDown className={`transition-transform ${openDropdown === "Account" ? "rotate-180" : ""}`} />
//           </button>

//           {openDropdown === "Account" && (
//             <div className="ml-6 mt-2 flex flex-col gap-2">
//               <button
//                 className="p-2 rounded-lg hover:bg-gray-700" onClick={() => navigate('/LoginPage')}>
//                 Create login Account
//               </button>
//             </div>
//           )}
//           {openDropdown === "Account" && (
//             <div className="ml-6 mt-2 flex flex-col gap-2">
//               <button
//                 className="p-2 rounded-lg hover:bg-gray-700" onClick={() => navigate('/UserLogin')}>
//                 Create User Account
//               </button>
//             </div>
//           )}
//         </div>


//         {/* <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-800">
//           <User /> Account
//         </button> */}
//         <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-800">
//           <Settings /> Settings
//         </button>
//       </nav>
//     </div>
//   );
// }










import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, ClipboardList, Settings, User, ChevronDown } from "lucide-react";

export default function Sidebar() {
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const navigate = useNavigate();

  const menuItems = [
    {
      name: "Dashboard",
      icon: <Home size={18} />,
      action: () => navigate("/")
    },
    {
      name: "Orders",
      icon: <ClipboardList size={18} />,
      submenus: [
        {
          name: "Spot Order",
          items: [
            { name: "Create Order", path: "/place-order" },
            { name: "PNL Report", path: "/pnl-report" },
            { name: "Order Modify", path: "/modify-order" },
            { name: "Order Cancel", path: "/cancel-order" },
            { name: "Dummy Order PNL", path: "/dummy_pnl_report" }
          ]
        }
      ]
    },
    {
      name: "User Data History",
      icon: <User size={18} />,
      submenus: [
        {
          name: "Show Data",
          items: [
            { name: "Order Details", path: "/binance_order" }
          ]
        }
      ]
    },
    {
      name: "Account",
      icon: <User size={18} />,
      submenus: [
        {
          name: "Account Management",
          items: [
            { name: "Create Login Account", path: "/LoginPage" },
            { name: "Create User Account", path: "/UserLogin" }
          ]
        }
      ]
    },
    {
      name: "Settings",
      icon: <Settings size={18} />,
      action: () => navigate("/settings")
    }
  ];

  const toggleMenu = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
    setActiveSubmenu(null);
  };

  const toggleSubmenu = (submenuName) => {
    setActiveSubmenu(activeSubmenu === submenuName ? null : submenuName);
  };

  return (
    <div className="w-64 h-full p-4 border-r border-gray-700 bg-gray-900 flex flex-col gap-2">
      <nav className="flex flex-col gap-1">
        {menuItems.map((item, index) => (
          <div key={index}>
            {item.action ? (
              <button
                onClick={item.action}
                className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-800 transition-colors text-left"
              >
                <span className="flex items-center gap-3">
                  {item.icon}
                  {item.name}
                </span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => toggleMenu(item.name)}
                  className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    {item.icon}
                    {item.name}
                  </span>
                  <ChevronDown 
                    size={16}
                    className={`transition-transform ${activeMenu === item.name ? "rotate-180" : ""}`}
                  />
                </button>

                {activeMenu === item.name && item.submenus && (
                  <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-gray-700">
                    {item.submenus.map((submenu, subIdx) => (
                      <div key={subIdx}>
                        <button
                          onClick={() => toggleSubmenu(submenu.name)}
                          className="flex items-center justify-between w-full p-2 pl-3 rounded-lg hover:bg-gray-800 transition-colors"
                        >
                          {submenu.name}
                          {submenu.items && (
                            <ChevronDown 
                              size={14}
                              className={`transition-transform ${activeSubmenu === submenu.name ? "rotate-180" : ""}`}
                            />
                          )}
                        </button>

                        {activeSubmenu === submenu.name && submenu.items && (
                          <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-gray-700">
                            {submenu.items.map((subItem, itemIdx) => (
                              <button
                                key={itemIdx}
                                onClick={() => navigate(subItem.path)}
                                className="w-full p-2 pl-3 rounded-lg hover:bg-gray-700 text-gray-300 text-sm transition-colors text-left"
                              >
                                {subItem.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}