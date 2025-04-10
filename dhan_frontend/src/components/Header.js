

// import React from "react";
// import { useNavigate } from "react-router-dom";
// import Button from "../components/ui/button";
// import { Search, Bell, Globe, Moon, LogOut } from "lucide-react";

// export default function Header({ onLogout }) {
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     if (onLogout) onLogout();
//     localStorage.removeItem('authToken');
//     navigate('/login');
//   };

//   return (
//     <header className="sticky top-0 z-50 bg-gray-700 backdrop-blur-sm border-b border-gray-800">
//       <div className="flex justify-between items-center h-16 px-4 mx-auto">
//         {/* Logo Section - Left aligned */}
//         <div className="flex items-center flex-1"> {/* Changed to flex-1 to take available space */}
//           <h1 className="text-xl font-bold text-green-500 text-left pl-1"> {/* Added text-left and pl-2 */}
//             Dhan Trading Bot
//           </h1>
//         </div>

//         {/* Navigation and Actions */}
//         <nav className="flex items-right gap-0 ">
//           <button className="p-2 text-gray-400 hover:text-white transition-colors">
//             <Search size={20} />
//           </button>
//           <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
//             <Bell size={20} />
//             <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
//           </button>
//           <button className="p-2 text-gray-400 hover:text-white transition-colors">
//             <Globe size={20} />
//           </button>
//           <button className="p-2 text-gray-400 hover:text-white transition-colors">
//             <Moon size={20} />
//           </button>
//           <Button className="bg-green-500 hover:bg-green-600 text-black font-medium">
//             Deposit
//           </Button>
//           <button onClick={handleLogout} className="p-2 text-red-400 hover:text-red-300">
//             <LogOut size={20} />
//           </button>
//         </nav>
//       </div>
//     </header>
//   );
// }











import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/button";
import { Search, Bell, Globe, Moon, LogOut } from "lucide-react";

export default function Header({ onLogout }) {
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = () => {
    if (onLogout) onLogout();
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const openLogoutConfirmation = () => {
    setIsLogoutModalOpen(true);
  };

  const closeLogoutConfirmation = () => {
    setIsLogoutModalOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-gray-700 backdrop-blur-sm border-b border-gray-800">
        <div className="flex justify-between items-center h-16 px-4 mx-auto">
          {/* Logo Section - Left aligned */}
          <div className="flex items-center flex-1">
            <h1 className="text-xl font-bold text-green-500 text-left pl-1">
              Dhan Trading Bot
            </h1>
          </div>

          {/* Navigation and Actions */}
          <nav className="flex items-right gap-0 ">
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Search size={20} />
            </button>
            <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Globe size={20} />
            </button>
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Moon size={20} />
            </button>
            <Button className="bg-green-500 hover:bg-green-600 text-black font-medium">
              Deposit
            </Button>
            <button 
              onClick={openLogoutConfirmation} 
              className="p-2 text-red-400 hover:text-red-300"
            >
              <LogOut size={20} />
            </button>
          </nav>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 max-w-sm">
            <h3 className="text-xl font-bold text-white mb-4">Confirm Logout</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to logout?</p>
            <div className="flex justify-end space-x-3">
              <Button onClick={closeLogoutConfirmation} className="bg-gray-600 hover:bg-gray-500">
                Cancel
              </Button>
              <Button onClick={handleLogout} className="bg-red-500 hover:bg-red-600">
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}