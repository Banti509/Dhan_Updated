
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaPlay, FaStop, FaTrash, FaEye, FaPlus, FaChevronDown, FaChevronUp, FaSyncAlt } from 'react-icons/fa';

const API_BASE_URL = 'http://localhost:5000/api/trading_bot';

const TradingBot = () => {
  // State management
  const [botStatus, setBotStatus] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const [positions, setPositions] = useState({});
  const [symbolInput, setSymbolInput] = useState('');
  const [securityIdInput, setSecurityIdInput] = useState('');
  const [quantityInput, setQuantityInput] = useState(1);
  const [exchangeSegmentInput, setExchangeSegmentInput] = useState('FNO');
  const [rsiSettings, setRsiSettings] = useState({ oversold: 30, overbought: 70 });
  const [supertrendSettings, setSupertrendSettings] = useState({ period: 10, multiplier: 4 });
  const [expandedSymbols, setExpandedSymbols] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Fetch all initial data
  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchStatus(),
        fetchWatchlist(),
      ]);
    } catch (error) {
      showSnackbar('Error fetching initial data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const fetchStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/status`);
      setBotStatus(response.data.data.bot_running);
      setPositions(response.data.data.positions || {});
    } catch (error) {
      showSnackbar('Error fetching bot status', 'error');
    }
  };

  const fetchWatchlist = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/watchlist`);
      setWatchlist(response.data.data || []);
    } catch (error) {
      showSnackbar('Error fetching watchlist', 'error');
    }
  };

  // Toggle symbol details visibility
  const toggleSymbolDetails = (symbol) => {
    setExpandedSymbols(prev => ({
      ...prev,
      [symbol]: !prev[symbol]
    }));
  };

  // Bot control functions
  const toggleBot = async () => {
    setIsLoading(true);
    try {
      if (botStatus) {
        await axios.post(`${API_BASE_URL}/stop`);
        setBotStatus(false);
        showSnackbar('Trading bot stopped', 'success');
      } else {
        await axios.post(`${API_BASE_URL}/start`);
        setBotStatus(true);
        showSnackbar('Trading bot started', 'success');
      }
      await fetchStatus();
    } catch (error) {
      showSnackbar(`Error ${botStatus ? 'stopping' : 'starting'} bot`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Watchlist management
  const handleAddToWatchlist = async () => {
    if (!symbolInput || !securityIdInput || !quantityInput) {
      showSnackbar('Symbol, Security ID, and Quantity are required', 'error');
      return;
    }
    if (parseInt(quantityInput) <= 0) {
      showSnackbar('Quantity must be positive', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/watchlist/add`, {
        symbol: symbolInput,
        security_id: securityIdInput,
        quantity: parseInt(quantityInput),
        exchange_segment: exchangeSegmentInput,
        rsi_oversold: rsiSettings.oversold,
        rsi_overbought: rsiSettings.overbought,
        supertrend_period: supertrendSettings.period,
        supertrend_multiplier: supertrendSettings.multiplier,
      });
      setSymbolInput('');
      setSecurityIdInput('');
      setQuantityInput(1);
      setExchangeSegmentInput('FNO');
      showSnackbar(`${symbolInput} added to watchlist`, 'success');
      await fetchWatchlist();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Error adding to watchlist', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromWatchlist = async (symbol) => {
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/watchlist/remove`, { symbol });
      showSnackbar(`${symbol} removed from watchlist`, 'success');
      await fetchWatchlist();
      // Clear expanded state if removed symbol was expanded
      setExpandedSymbols(prev => {
        const newState = {...prev};
        delete newState[symbol];
        return newState;
      });
    } catch (error) {
      showSnackbar('Error removing from watchlist', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualTrade = async (symbol, action) => {
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/trade`, {
        symbol,
        action
      });
      showSnackbar(`${action} order placed for ${symbol}`, 'success');
      await fetchStatus();
    } catch (error) {
      showSnackbar(`Error placing ${action} order`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceSignal = async (symbol, signal) => {
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/force_signal`, {
        symbol,
        signal
      });
      showSnackbar(`Forced ${signal} signal for ${symbol}`, 'success');
      await fetchStatus();
    } catch (error) {
      showSnackbar(`Error forcing ${signal} signal`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPosition = async (symbol) => {
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/reset_position`, { symbol });
      showSnackbar(`Position reset for ${symbol}`, 'success');
      await fetchStatus();
    } catch (error) {
      showSnackbar('Error resetting position', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getPositionStatus = (symbol) => {
    return positions[symbol] === 1 ? 'LONG' : 'FLAT';
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      {/* <header className="bg-indigo-600 text-white p-4 shadow-md"> */}
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Watchlist Management</h1>
          <div className="flex items-center space-x-4">
            <button 
              onClick={fetchInitialData} 
              disabled={isLoading}
              className="flex items-center px-3 py-1 bg-indigo-700 rounded hover:bg-indigo-800 disabled:opacity-50"
            >
              <FaSyncAlt className="mr-2" />
              Refresh
            </button>
            <button
              onClick={toggleBot}
              disabled={isLoading}
              className={`flex items-center px-4 py-2 rounded-md font-medium ${
                botStatus 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-green-500 hover:bg-green-600'
              } disabled:opacity-50`}
            >
              {botStatus ? (
                <>
                  <FaStop className="mr-2" />
                  Stop Bot
                </>
              ) : (
                <>
                  <FaPlay className="mr-2" />
                  Start Bot
                </>
              )}
            </button>
          </div>
        </div>
      {/* </header> */}

      {/* Main Content */}
      <main className="container mx-auto p-4">
        <div className="bg-gray-900 rounded-lg shadow-md p-6">
          {/* <h2 className="text-xl font-semibold mb-4">Watchlist Management</h2> */}
          
          {/* Add Symbol Form */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Symbol</label>
                <input
                  type="text"
                  value={symbolInput}
                  onChange={(e) => setSymbolInput(e.target.value.toUpperCase())}
                  placeholder="e.g. RELIANCE"
                  className="w-full px-3 py-2 border text-black border-gray-300  rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Security ID</label>
                <input
                  type="text"
                  value={securityIdInput}
                  onChange={(e) => setSecurityIdInput(e.target.value)}
                  placeholder="Security ID"
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantityInput}
                  onChange={(e) => setQuantityInput(e.target.value)}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex items-end">
                <button 
                  onClick={handleAddToWatchlist}
                  disabled={isLoading || !symbolInput || !securityIdInput || !quantityInput}
                  className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  <FaPlus className="mr-2" />
                  Add Symbol
                </button>
              </div>
            </div>

            {/* Advanced Settings Toggle */}
            <button 
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 mb-2"
            >
              {showAdvancedSettings ? <FaChevronUp className="mr-1" /> : <FaChevronDown className="mr-1" />}
              Advanced Settings
            </button>

            {/* Advanced Settings Form */}
            {showAdvancedSettings && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-3 p-3 bg-gray-100 rounded-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exchange Segment</label>
                  <select
                    value={exchangeSegmentInput}
                    onChange={(e) => setExchangeSegmentInput(e.target.value)}
                    className="w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="NSE_FNO">NSE_FNO</option>
                    <option value="NSE_EQ">NSE_EQUITY</option>
                    <option value="MCX">MCX</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-black font-medium text-gray-700 mb-1">RSI Oversold</label>
                  <input
                    type="number"
                    value={rsiSettings.oversold}
                    onChange={(e) => setRsiSettings({ ...rsiSettings, oversold: parseInt(e.target.value) || 30 })}
                    className="w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RSI Overbought</label>
                  <input
                    type="number"
                    value={rsiSettings.overbought}
                    onChange={(e) => setRsiSettings({ ...rsiSettings, overbought: parseInt(e.target.value) || 70 })}
                    className="w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supertrend Period</label>
                  <input
                    type="number"
                    value={supertrendSettings.period}
                    onChange={(e) => setSupertrendSettings({ ...supertrendSettings, period: parseInt(e.target.value) || 10 })}
                    className="w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supertrend Multiplier</label>
                  <input
                    type="number"
                    step="0.1"
                    value={supertrendSettings.multiplier}
                    onChange={(e) => setSupertrendSettings({ ...supertrendSettings, multiplier: parseFloat(e.target.value) || 3 })}
                    className="w-full px-3 py-2 border text-black border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Watchlist Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Symbol
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {watchlist.length > 0 ? (
                  watchlist.map((item) => (
                    <React.Fragment key={item.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">{item.symbol}</div>
                          </div>
                          <div className="text-sm text-gray-500">{item.exchange_segment}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            positions[item.symbol] === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {getPositionStatus(item.symbol)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => toggleSymbolDetails(item.symbol)}
                              className={`text-indigo-600 hover:text-indigo-900 ${expandedSymbols[item.symbol] ? 'text-indigo-900' : ''}`}
                              title="View details"
                            >
                              <FaEye />
                            </button>
                            <button
                              onClick={() => handleManualTrade(item.symbol, 'BUY')}
                              disabled={positions[item.symbol] === 1}
                              className={`text-green-600 hover:text-green-900 ${positions[item.symbol] === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                              title="Buy"
                            >
                              Buy
                            </button>
                            <button
                              onClick={() => handleManualTrade(item.symbol, 'SELL')}
                              disabled={positions[item.symbol] === 1}
                              className={`text-red-600 hover:text-red-900 ${positions[item.symbol] === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                              title="Sell"
                            >
                              Sell
                            </button>
                            <button
                              onClick={() => handleRemoveFromWatchlist(item.symbol)}
                              className="text-gray-600 hover:text-gray-900"
                              title="Remove"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedSymbols[item.symbol] && (
                        <tr>
                          <td colSpan="4" className="px-6 py-4 bg-gray-50">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-sm font-medium text-gray-500">Current Position</p>
                                <p className={`text-sm font-semibold ${
                                  positions[item.symbol] === 1 ? 'text-green-600' : 'text-gray-600'
                                }`}>
                                  {getPositionStatus(item.symbol)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Quantity</p>
                                <p className="text-sm font-semibold text-gray-900">{item.quantity}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">RSI Settings</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {item.rsi_oversold} / {item.rsi_overbought}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Supertrend</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {item.supertrend_period} / {item.supertrend_multiplier}
                                </p>
                              </div>
                            </div>
                            <div className="mt-4 flex space-x-2">
                              <button
                                onClick={() => handleForceSignal(item.symbol, 'BUY')}
                                disabled={positions[item.symbol] === 1}
                                className={`px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md ${
                                  positions[item.symbol] === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-200'
                                }`}
                              >
                                Force Buy Signal
                              </button>
                              <button
                                onClick={() => handleForceSignal(item.symbol, 'SELL')}
                                disabled={positions[item.symbol] === 1}
                                className={`px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md ${
                                  positions[item.symbol] === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-200'
                                }`}
                              >
                                Force Sell Signal
                              </button>
                              <button
                                onClick={() => handleResetPosition(item.symbol)}
                                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                              >
                                Reset Position
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                      Your watchlist is empty. Add symbols to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Snackbar Notification */}
      {snackbar.open && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-md shadow-lg flex items-center justify-between min-w-[300px] ${
          snackbar.severity === 'error' ? 'bg-red-500' : 
          snackbar.severity === 'success' ? 'bg-green-500' : 'bg-blue-500'
        } text-white`}>
          <p>{snackbar.message}</p>
          <button 
            onClick={handleCloseSnackbar}
            className="ml-4 text-white hover:text-gray-200"
          >
            <span className="text-xl">×</span>
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
            <span>Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradingBot;









// import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
// import { FaPlay, FaStop, FaTrash, FaEye, FaPlus, FaChevronDown, FaChevronUp, FaSyncAlt } from 'react-icons/fa';

// const API_BASE_URL = 'http://localhost:5000/api/trading_bot';

// const TradingBot = () => {
//   // State management
//   const [botStatus, setBotStatus] = useState(false);
//   const [watchlist, setWatchlist] = useState([]);
//   const [positions, setPositions] = useState({});
//   const [ltpData, setLtpData] = useState({});
//   const [symbolInput, setSymbolInput] = useState('');
//   const [securityIdInput, setSecurityIdInput] = useState('');
//   const [quantityInput, setQuantityInput] = useState(1);
//   const [exchangeSegmentInput, setExchangeSegmentInput] = useState('FNO');
//   const [rsiSettings, setRsiSettings] = useState({ oversold: 30, overbought: 70 });
//   const [supertrendSettings, setSupertrendSettings] = useState({ period: 10, multiplier: 4 });
//   const [expandedSymbols, setExpandedSymbols] = useState({});
//   const [isLoading, setIsLoading] = useState(false);
//   const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
//   const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

//   // Fetch all initial data
//   const fetchInitialData = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       await Promise.all([
//         fetchStatus(),
//         fetchWatchlist(),
//       ]);
//     } catch (error) {
//       showSnackbar('Error fetching initial data', 'error');
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchInitialData();
    
//     // Set up interval for fetching LTP data
//     const ltpInterval = setInterval(fetchLtpData, 5000);
//     return () => clearInterval(ltpInterval);
//   }, [fetchInitialData]);

//   const fetchStatus = async () => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/status`);
//       setBotStatus(response.data.data.bot_running);
//       setPositions(response.data.data.positions || {});
//     } catch (error) {
//       showSnackbar('Error fetching bot status', 'error');
//     }
//   };

//   const fetchWatchlist = async () => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/watchlist`);
//       setWatchlist(response.data.data || []);
//     } catch (error) {
//       showSnackbar('Error fetching watchlist', 'error');
//     }
//   };

//   const fetchLtpData = async () => {
//     if (watchlist.length === 0) return;
    
//     try {
//       const symbols = watchlist.map(item => item.symbol);
//       const response = await axios.post(`${API_BASE_URL}/get_ltp`, { symbols });
//       setLtpData(response.data.data || {});
//     } catch (error) {
//       console.error('Error fetching LTP data:', error);
//     }
//   };

//   // Toggle symbol details visibility
//   const toggleSymbolDetails = (symbol) => {
//     setExpandedSymbols(prev => ({
//       ...prev,
//       [symbol]: !prev[symbol]
//     }));
//   };

//   // Bot control functions
//   const toggleBot = async () => {
//     setIsLoading(true);
//     try {
//       if (botStatus) {
//         await axios.post(`${API_BASE_URL}/stop`);
//         setBotStatus(false);
//         showSnackbar('Trading bot stopped', 'success');
//       } else {
//         await axios.post(`${API_BASE_URL}/start`);
//         setBotStatus(true);
//         showSnackbar('Trading bot started', 'success');
//       }
//       await fetchStatus();
//     } catch (error) {
//       showSnackbar(`Error ${botStatus ? 'stopping' : 'starting'} bot`, 'error');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Watchlist management
//   const handleAddToWatchlist = async () => {
//     if (!symbolInput || !securityIdInput || !quantityInput) {
//       showSnackbar('Symbol, Security ID, and Quantity are required', 'error');
//       return;
//     }
//     if (parseInt(quantityInput) <= 0) {
//       showSnackbar('Quantity must be positive', 'error');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       await axios.post(`${API_BASE_URL}/watchlist/add`, {
//         symbol: symbolInput,
//         security_id: securityIdInput,
//         quantity: parseInt(quantityInput),
//         exchange_segment: exchangeSegmentInput,
//         rsi_oversold: rsiSettings.oversold,
//         rsi_overbought: rsiSettings.overbought,
//         supertrend_period: supertrendSettings.period,
//         supertrend_multiplier: supertrendSettings.multiplier,
//       });
//       setSymbolInput('');
//       setSecurityIdInput('');
//       setQuantityInput(1);
//       setExchangeSegmentInput('FNO');
//       showSnackbar(`${symbolInput} added to watchlist`, 'success');
//       await fetchWatchlist();
//     } catch (error) {
//       showSnackbar(error.response?.data?.message || 'Error adding to watchlist', 'error');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleRemoveFromWatchlist = async (symbol) => {
//     setIsLoading(true);
//     try {
//       await axios.post(`${API_BASE_URL}/watchlist/remove`, { symbol });
//       showSnackbar(`${symbol} removed from watchlist`, 'success');
//       await fetchWatchlist();
//       setExpandedSymbols(prev => {
//         const newState = {...prev};
//         delete newState[symbol];
//         return newState;
//       });
//     } catch (error) {
//       showSnackbar('Error removing from watchlist', 'error');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleManualTrade = async (symbol, action) => {
//     setIsLoading(true);
//     try {
//       await axios.post(`${API_BASE_URL}/trade`, {
//         symbol,
//         action
//       });
//       showSnackbar(`${action} order placed for ${symbol}`, 'success');
//       await fetchStatus();
//     } catch (error) {
//       showSnackbar(`Error placing ${action} order`, 'error');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleForceSignal = async (symbol, signal) => {
//     setIsLoading(true);
//     try {
//       await axios.post(`${API_BASE_URL}/force_signal`, {
//         symbol,
//         signal
//       });
//       showSnackbar(`Forced ${signal} signal for ${symbol}`, 'success');
//       await fetchStatus();
//     } catch (error) {
//       showSnackbar(`Error forcing ${signal} signal`, 'error');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleResetPosition = async (symbol) => {
//     setIsLoading(true);
//     try {
//       await axios.post(`${API_BASE_URL}/reset_position`, { symbol });
//       showSnackbar(`Position reset for ${symbol}`, 'success');
//       await fetchStatus();
//     } catch (error) {
//       showSnackbar('Error resetting position', 'error');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Helper functions
//   const showSnackbar = (message, severity) => {
//     setSnackbar({ open: true, message, severity });
//   };

//   const handleCloseSnackbar = () => {
//     setSnackbar({ ...snackbar, open: false });
//   };

//   const getPositionStatus = (symbol) => {
//     return positions[symbol] === 1 ? 'LONG' : 'FLAT';
//   };

//   return (
//     <div className="min-h-screen bg-gray-900 text-white">
//       {/* Header */}
//       <div className="container mx-auto flex justify-between items-center p-4">
//         <h1 className="text-2xl font-bold">Watchlist Management</h1>
//         <div className="flex items-center space-x-4">
//           <button 
//             onClick={fetchInitialData} 
//             disabled={isLoading}
//             className="flex items-center px-3 py-1 bg-indigo-700 rounded hover:bg-indigo-800 disabled:opacity-50"
//           >
//             <FaSyncAlt className="mr-2" />
//             Refresh
//           </button>
//           <button
//             onClick={toggleBot}
//             disabled={isLoading}
//             className={`flex items-center px-4 py-2 rounded-md font-medium ${
//               botStatus 
//                 ? 'bg-red-500 hover:bg-red-600' 
//                 : 'bg-green-500 hover:bg-green-600'
//             } disabled:opacity-50`}
//           >
//             {botStatus ? (
//               <>
//                 <FaStop className="mr-2" />
//                 Stop Bot
//               </>
//             ) : (
//               <>
//                 <FaPlay className="mr-2" />
//                 Start Bot
//               </>
//             )}
//           </button>
//         </div>
//       </div>

//       {/* Main Content */}
//       <main className="container mx-auto p-4">
//         <div className="bg-gray-800 rounded-lg shadow-md p-6">
//           {/* Add Symbol Form */}
//           <div className="bg-gray-700 p-4 rounded-lg mb-6">
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
//               <div>
//                 <label className="block text-sm font-medium text-gray-300 mb-1">Symbol</label>
//                 <input
//                   type="text"
//                   value={symbolInput}
//                   onChange={(e) => setSymbolInput(e.target.value.toUpperCase())}
//                   placeholder="e.g. RELIANCE"
//                   className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-300 mb-1">Security ID</label>
//                 <input
//                   type="text"
//                   value={securityIdInput}
//                   onChange={(e) => setSecurityIdInput(e.target.value)}
//                   placeholder="Security ID"
//                   className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-300 mb-1">Quantity</label>
//                 <input
//                   type="number"
//                   min="1"
//                   value={quantityInput}
//                   onChange={(e) => setQuantityInput(e.target.value)}
//                   className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                 />
//               </div>
//               <div className="flex items-end">
//                 <button 
//                   onClick={handleAddToWatchlist}
//                   disabled={isLoading || !symbolInput || !securityIdInput || !quantityInput}
//                   className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
//                 >
//                   <FaPlus className="mr-2" />
//                   Add Symbol
//                 </button>
//               </div>
//             </div>

//             {/* Advanced Settings Toggle */}
//             <button 
//               onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
//               className="flex items-center text-sm text-indigo-400 hover:text-indigo-300 mb-2"
//             >
//               {showAdvancedSettings ? <FaChevronUp className="mr-1" /> : <FaChevronDown className="mr-1" />}
//               Advanced Settings
//             </button>

//             {/* Advanced Settings Form */}
//             {showAdvancedSettings && (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-3 p-3 bg-gray-600 rounded-md">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-1">Exchange Segment</label>
//                   <select
//                     value={exchangeSegmentInput}
//                     onChange={(e) => setExchangeSegmentInput(e.target.value)}
//                     className="w-full px-3 py-2 bg-gray-500 border border-gray-400 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                   >
//                     <option value="FNO">FNO</option>
//                     <option value="EQUITY">EQUITY</option>
//                     <option value="MCX">MCX</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-1">RSI Oversold</label>
//                   <input
//                     type="number"
//                     value={rsiSettings.oversold}
//                     onChange={(e) => setRsiSettings({ ...rsiSettings, oversold: parseInt(e.target.value) || 30 })}
//                     className="w-full px-3 py-2 bg-gray-500 border border-gray-400 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-1">RSI Overbought</label>
//                   <input
//                     type="number"
//                     value={rsiSettings.overbought}
//                     onChange={(e) => setRsiSettings({ ...rsiSettings, overbought: parseInt(e.target.value) || 70 })}
//                     className="w-full px-3 py-2 bg-gray-500 border border-gray-400 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-1">Supertrend Period</label>
//                   <input
//                     type="number"
//                     value={supertrendSettings.period}
//                     onChange={(e) => setSupertrendSettings({ ...supertrendSettings, period: parseInt(e.target.value) || 10 })}
//                     className="w-full px-3 py-2 bg-gray-500 border border-gray-400 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-1">Supertrend Multiplier</label>
//                   <input
//                     type="number"
//                     step="0.1"
//                     value={supertrendSettings.multiplier}
//                     onChange={(e) => setSupertrendSettings({ ...supertrendSettings, multiplier: parseFloat(e.target.value) || 3 })}
//                     className="w-full px-3 py-2 bg-gray-500 border border-gray-400 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                   />
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Watchlist Table */}
//           <div className="overflow-x-auto">
//             <div className="relative">
//               {/* Fixed Header */}
//               <table className="min-w-full">
//                 <thead className="bg-gray-700 sticky top-0 z-10">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Symbol</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Position</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Quantity</th>
//                     <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">LTP</th>
//                     <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
//                   </tr>
//                 </thead>
//               </table>
              
//               {/* Scrollable Body */}
//               <div className="overflow-y-auto max-h-96">
//                 <table className="min-w-full divide-y divide-gray-700">
//                   <tbody className="bg-gray-800 divide-y divide-gray-700">
//                     {watchlist.length > 0 ? (
//                       watchlist.map((item) => (
//                         <React.Fragment key={item.id}>
//                           <tr className="hover:bg-gray-700">
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               <div className="flex items-center">
//                                 <div className="text-sm font-medium text-white">{item.symbol}</div>
//                               </div>
//                               <div className="text-sm text-gray-400">{item.exchange_segment}</div>
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                                 positions[item.symbol] === 1 ? 'bg-green-900 text-green-200' : 'bg-gray-600 text-gray-200'
//                               }`}>
//                                 {getPositionStatus(item.symbol)}
//                               </span>
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
//                               {item.quantity}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-white">
//                               {ltpData[item.symbol] || 'Loading...'}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                               <div className="flex justify-end space-x-2">
//                                 <button
//                                   onClick={() => toggleSymbolDetails(item.symbol)}
//                                   className={`text-indigo-400 hover:text-indigo-300 ${expandedSymbols[item.symbol] ? 'text-indigo-300' : ''}`}
//                                   title="View details"
//                                 >
//                                   <FaEye />
//                                 </button>
//                                 <button
//                                   onClick={() => handleManualTrade(item.symbol, 'BUY')}
//                                   disabled={positions[item.symbol] === 1}
//                                   className={`text-green-400 hover:text-green-300 ${positions[item.symbol] === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
//                                   title="Buy"
//                                 >
//                                   Buy
//                                 </button>
//                                 <button
//                                   onClick={() => handleManualTrade(item.symbol, 'SELL')}
//                                   disabled={positions[item.symbol] !== 1}
//                                   className={`text-red-400 hover:text-red-300 ${positions[item.symbol] !== 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
//                                   title="Sell"
//                                 >
//                                   Sell
//                                 </button>
//                                 <button
//                                   onClick={() => handleRemoveFromWatchlist(item.symbol)}
//                                   className="text-gray-400 hover:text-gray-300"
//                                   title="Remove"
//                                 >
//                                   <FaTrash />
//                                 </button>
//                               </div>
//                             </td>
//                           </tr>
//                           {expandedSymbols[item.symbol] && (
//                             <tr>
//                               <td colSpan="5" className="px-6 py-4 bg-gray-700">
//                                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                                   <div>
//                                     <p className="text-sm font-medium text-gray-400">Current Position</p>
//                                     <p className={`text-sm font-semibold ${
//                                       positions[item.symbol] === 1 ? 'text-green-400' : 'text-gray-400'
//                                     }`}>
//                                       {getPositionStatus(item.symbol)}
//                                     </p>
//                                   </div>
//                                   <div>
//                                     <p className="text-sm font-medium text-gray-400">Quantity</p>
//                                     <p className="text-sm font-semibold text-white">{item.quantity}</p>
//                                   </div>
//                                   <div>
//                                     <p className="text-sm font-medium text-gray-400">RSI Settings</p>
//                                     <p className="text-sm font-semibold text-white">
//                                       {item.rsi_oversold} / {item.rsi_overbought}
//                                     </p>
//                                   </div>
//                                   <div>
//                                     <p className="text-sm font-medium text-gray-400">Supertrend</p>
//                                     <p className="text-sm font-semibold text-white">
//                                       {item.supertrend_period} / {item.supertrend_multiplier}
//                                     </p>
//                                   </div>
//                                 </div>
//                                 <div className="mt-4 flex space-x-2">
//                                   <button
//                                     onClick={() => handleForceSignal(item.symbol, 'BUY')}
//                                     disabled={positions[item.symbol] === 1}
//                                     className={`px-3 py-1 text-sm bg-green-900 text-green-200 rounded-md ${
//                                       positions[item.symbol] === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-800'
//                                     }`}
//                                   >
//                                     Force Buy Signal
//                                   </button>
//                                   <button
//                                     onClick={() => handleForceSignal(item.symbol, 'SELL')}
//                                     disabled={positions[item.symbol] !== 1}
//                                     className={`px-3 py-1 text-sm bg-red-900 text-red-200 rounded-md ${
//                                       positions[item.symbol] !== 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-800'
//                                     }`}
//                                   >
//                                     Force Sell Signal
//                                   </button>
//                                   <button
//                                     onClick={() => handleResetPosition(item.symbol)}
//                                     className="px-3 py-1 text-sm bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500"
//                                   >
//                                     Reset Position
//                                   </button>
//                                 </div>
//                               </td>
//                             </tr>
//                           )}
//                         </React.Fragment>
//                       ))
//                     ) : (
//                       <tr>
//                         <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-400">
//                           Your watchlist is empty. Add symbols to get started.
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* Snackbar Notification */}
//       {snackbar.open && (
//         <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-md shadow-lg flex items-center justify-between min-w-[300px] ${
//           snackbar.severity === 'error' ? 'bg-red-500' : 
//           snackbar.severity === 'success' ? 'bg-green-500' : 'bg-blue-500'
//         } text-white`}>
//           <p>{snackbar.message}</p>
//           <button 
//             onClick={handleCloseSnackbar}
//             className="ml-4 text-white hover:text-gray-200"
//           >
//             <span className="text-xl">×</span>
//           </button>
//         </div>
//       )}

//       {/* Loading Overlay */}
//       {isLoading && (
//         <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
//           <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex items-center">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mr-3"></div>
//             <span className="text-white">Processing...</span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TradingBot;