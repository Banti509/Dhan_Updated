
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
// import { motion } from "framer-motion";

// const Login = () => {
//   const navigate = useNavigate();
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [message, setMessage] = useState("");
//   const [isSignUp, setIsSignUp] = useState(false);

//   const handleAuth = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);
//     setMessage("");

//     try {
//       const endpoint = isSignUp ? "signup" : "login";
//       const body = isSignUp 
//         ? { name, email, password } 
//         : { email, password };

//       const response = await fetch("http://localhost:5000/api/auth", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ action: endpoint, ...body }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || "Authentication failed");
//       }

//       setMessage(data.message);
      
//       if (!isSignUp) {
//         navigate("/dashboard");
//       } else {
//         setIsSignUp(false); // Switch back to login after successful signup
//       }
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGoogleAuth = async () => {
//     setLoading(true);
//     setError(null);
    
//     try {
//       const response = await fetch("http://localhost:5000/api/auth", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ action: "google_login", email }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || "Google authentication failed");
//       }

//       setMessage(data.message);
//       navigate("/dashboard");
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
//       <motion.div 
//         className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700"
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.3 }}
//       >
//         {/* Header */}
//         <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6 text-center">
//           <h1 className="text-2xl font-bold text-white">Dhan Trading Bot</h1>
//           <p className="text-gray-200 mt-1">
//             {/* {isSignUp ? "Create your account" : "Algorithmic Trading Platform"} */}
//           </p>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleAuth} className="p-8">
//           {error && (
//             <div className="mb-4 p-3 bg-red-900/50 text-red-300 rounded-lg text-sm">
//               {error}
//             </div>
//           )}
//           {message && (
//             <div className="mb-4 p-3 bg-green-900/50 text-green-300 rounded-lg text-sm">
//               {message}
//             </div>
//           )}

//           {isSignUp && (
//             <div className="mb-4">
//               <label className="block text-gray-300 mb-2">Full Name</label>
//               <input
//                 type="text"
//                 className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 placeholder="Enter your name"
//                 required
//               />
//             </div>
//           )}

//           <div className="mb-4">
//             <label className="block text-gray-300 mb-2">Email</label>
//             <input
//               type="email"
//               className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="Enter your email"
//               required
//             />
//           </div>

//           <div className="mb-6">
//             <label className="block text-gray-300 mb-2">Password</label>
//             <div className="relative">
//               <input
//                 type={showPassword ? "text" : "password"}
//                 className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="Enter password"
//                 required
//                 minLength={6}
//               />
//               <button
//                 type="button"
//                 className="absolute right-3 top-3 text-gray-400 hover:text-white"
//                 onClick={() => setShowPassword(!showPassword)}
//               >
//                 {showPassword ? <FaEye /> : <FaEyeSlash />}
//               </button>
//             </div>
//           </div>

//           <motion.button
//             type="submit"
//             className="w-full p-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg font-semibold mb-4"
//             disabled={loading}
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//           >
//             {loading ? (
//               <span className="flex items-center justify-center">
//                 <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                 </svg>
//                 {isSignUp ? "Creating Account..." : "Signing In..."}
//               </span>
//             ) : (
//               isSignUp ? "Sign Up" : "Sign In"
//             )}
//           </motion.button>

//           <div className="flex items-center my-4">
//             <div className="flex-1 border-t border-gray-700"></div>
//             <span className="px-3 text-gray-400 text-sm">or</span>
//             <div className="flex-1 border-t border-gray-700"></div>
//           </div>

//           <motion.button
//             type="button"
//             className="w-full p-3 bg-gray-700 text-white rounded-lg flex items-center justify-center gap-2 mb-6"
//             onClick={handleGoogleAuth}
//             disabled={loading}
//             whileHover={{ y: -2 }}
//             whileTap={{ scale: 0.98 }}
//           >
//             <FaGoogle className="text-red-400" /> Continue with Google
//           </motion.button>

//           <p className="text-center text-gray-400 text-sm">
//             {isSignUp ? "Already have an account? " : "Don't have an account? "}
//             <button 
//               type="button"
//               className="text-blue-400 hover:underline"
//               onClick={() => setIsSignUp(!isSignUp)}
//             >
//               {isSignUp ? "Sign In" : "Register"}
//             </button>
//           </p>
//         </form>

//         {/* Footer */}
//         <div className="bg-gray-900/50 p-4 text-center text-gray-400 text-xs">
//           <p>By continuing, you agree to our Terms and Privacy Policy</p>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default Login;









import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import { motion } from "framer-motion";

const Login = ({onLogin}) => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage("");

    try {
      const endpoint = isSignUp ? "signup" : "login";
      const body = isSignUp 
        ? { name, email, password } 
        : { email, password };

      const response = await fetch("http://localhost:5000/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: endpoint, ...body }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      setMessage(data.message);
      
      if (!isSignUp) {
        // Store the token and call onLogin
        localStorage.setItem('authToken', data.token); // Assuming your API returns a token
        onLogin(); // This should trigger the redirection
      } else {
        setIsSignUp(false);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("http://localhost:5000/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "google_login", email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Google authentication failed");
      }

      setMessage(data.message);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <motion.div 
        className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">Dhan Trading Bot</h1>
          <p className="text-gray-200 mt-1">
            {/* {isSignUp ? "Create your account" : "Algorithmic Trading Platform"} */}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-4 p-3 bg-green-900/50 text-green-300 rounded-lg text-sm">
              {message}
            </div>
          )}

          {isSignUp && (
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Full Name</label>
              <input
                type="text"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Email</label>
            <input
              type="email"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                minLength={6}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400 hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            className="w-full p-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg font-semibold mb-4"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isSignUp ? "Creating Account..." : "Signing In..."}
              </span>
            ) : (
              isSignUp ? "Sign Up" : "Sign In"
            )}
          </motion.button>

          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-gray-700"></div>
            <span className="px-3 text-gray-400 text-sm">or</span>
            <div className="flex-1 border-t border-gray-700"></div>
          </div>

          <motion.button
            type="button"
            className="w-full p-3 bg-gray-700 text-white rounded-lg flex items-center justify-center gap-2 mb-6"
            onClick={handleGoogleAuth}
            disabled={loading}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaGoogle className="text-red-400" /> Continue with Google
          </motion.button>

          <p className="text-center text-gray-400 text-sm">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <button 
              type="button"
              className="text-blue-400 hover:underline"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Sign In" : "Register"}
            </button>
          </p>
        </form>

        {/* Footer */}
        <div className="bg-gray-900/50 p-4 text-center text-gray-400 text-xs">
          <p>By continuing, you agree to our Terms and Privacy Policy</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;








