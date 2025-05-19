
# from flask import Flask, jsonify, request, Blueprint
# import asyncio
# import pandas as pd
# from dhanhq import dhanhq
# import numpy as np
# import time
# import threading
# import logging
# import json
# import requests
# import datetime
# from flask_cors import CORS
# from config import client_id, access_token
# from db import save_offline_order, get_db_connection

# print("Starting script: Importing modules completed")

# # Initialize Blueprint
# trading_bot_bp = Blueprint('trading_bot', __name__)
# print("Blueprint initialized: trading_bot")

# # Set up logging
# logging.basicConfig(level=logging.INFO, filename="trade_bot.log", format="%(asctime)s %(message)s")
# logger = logging.getLogger(__name__)
# print("Logging configured: trade_bot.log")

# # Flask app
# app = Flask(__name__)
# CORS(app)
# print("Flask app initialized")

# # Initialize Dhan API client
# dhan = dhanhq(client_id, access_token)
# print("Dhan API client initialized")

# # Trading parameters (defaults)
# SHORT_MA_PERIOD = 5
# LONG_MA_PERIOD = 20
# RSI_PERIOD = 14
# RSI_OVERSOLD = 30
# RSI_OVERBOUGHT = 70
# SUPERTREND_PERIOD = 10
# SUPERTREND_MULTIPLIER = 4
# INTERVAL = 20
# MIN_MA_PERIOD = 10  # Minimum period for dynamic adjustment
# print(f"Default trading parameters set: INTERVAL={INTERVAL}s, RSI_PERIOD={RSI_PERIOD}, SUPERTREND_PERIOD={SUPERTREND_PERIOD}, SUPERTREND_MULTIPLIER={SUPERTREND_MULTIPLIER}")

# # Global state
# bot_running = False
# positions = {}  # Dictionary to track position per symbol
# loop = None
# task = None
# print("Global state initialized: bot_running=False, positions={}")

# # Placeholder for market status check (replace with actual logic)
# def is_market_open():
#     now = datetime.datetime.now()
#     is_weekday = now.weekday() < 5  # Monday to Friday
#     market_open = datetime.time(9, 15) <= now.time() <= datetime.time(15, 30)
#     return is_weekday and market_open

# def get_security_id(symbol, exchange_segment='NSE_FNO', instrument_type="OPTIDX"):
#     print(f"get_security_id: Fetching security_id for {symbol}")
#     logger.info(f"Fetching security_id for {symbol}")
#     try:
#         logger.warning(f"get_security_id: Using placeholder logic for {symbol}. Replace with actual API call.")
#         return None  # Replace with actual logic
#     except Exception as e:
#         print(f"get_security_id: Error fetching security_id: {e}")
#         logger.error(f"Error fetching security_id: {e}")
#         return None

# def get_expiry_code(symbol, exchange_segment='NSE_FNO', instrument_type="OPTIDX"):
#     print(f"get_expiry_code: Fetching expiry_code for {symbol}")
#     logger.info(f"Fetching expiry_code for {symbol}")
#     try:
#         parts = symbol.split('-')
#         if len(parts) >= 4:
#             expiry_date = parts[1]  # e.g., MAY2025
#             logger.warning(f"get_expiry_code: Parsed expiry_date={expiry_date} for {symbol}, defaulting to expiry_code=1. Verify with Dhan API.")
#             return 1  # Replace with actual expiry_code mapping
#         logger.warning(f"get_expiry_code: Could not parse expiry from {symbol}, defaulting to 1. Verify with Dhan API.")
#         return 1
#     except Exception as e:
#         print(f"get_expiry_code: Error fetching expiry_code: {e}")
#         logger.error(f"Error fetching expiry_code: {e}")
#         return 1

# def fetch_historical_data(security_id, exchange_segment, from_date, to_date, instrument_type, expiry_code=1, days=60, max_retries=3):
#     print(f"fetch_historical_data: Starting for security_id={security_id}, from={from_date}, to={to_date}, instrument_type={instrument_type}")
#     logger.info(f"Fetching data for security_id={security_id}")
#     for attempt in range(1, max_retries + 1):
#         try:
#             if isinstance(from_date, datetime.datetime):
#                 from_date = from_date.strftime('%Y-%m-%d')
#             if isinstance(to_date, datetime.datetime):
#                 to_date = to_date.strftime('%Y-%m-%d')
            
#             to_date_dt = datetime.datetime.now()
#             from_date_dt = to_date_dt - datetime.timedelta(days=days * 2)
#             from_date = from_date_dt.strftime('%Y-%m-%d')
#             to_date = to_date_dt.strftime('%Y-%m-%d')
#             print(f"fetch_historical_data: Date range from={from_date}, to={to_date}")

#             data = dhan.historical_daily_data(
#                 security_id=security_id,
#                 exchange_segment=exchange_segment,
#                 instrument_type=instrument_type,
#                 from_date=from_date,
#                 to_date=to_date,
#                 expiry_code=expiry_code
#             )
#             # print(f"===========================fetch_historical_data: {security_id} Raw API response={data}===========================")

#             if data and 'status' in data and data['status'] == 'success' and 'data' in data:
#                 data_inner = data['data']
#                 if isinstance(data_inner, dict) and all(key in data_inner for key in ['open', 'high', 'low', 'close', 'volume', 'timestamp']):
#                     if len(data_inner['close']) > 0:
#                         df = pd.DataFrame({
#                             "date": pd.to_datetime(data_inner["timestamp"], unit="s").tz_localize("UTC").tz_convert("Asia/Kolkata"),
#                             'timestamp': data_inner['timestamp'],
#                             'open': data_inner['open'],
#                             'high': data_inner['high'],
#                             'low': data_inner['low'],
#                             'close': data_inner['close'],
#                             'volume': data_inner['volume']
#                         })
#                         df = df.dropna(subset=['close'])
#                         if df['close'].isnull().any():
#                             print("fetch_historical_data: NaN values in 'close' column")
#                             logger.warning("NaN values in 'close' column")
#                             return None
#                         df['close'] = df['close'].astype(float)
#                         df['high'] = df['high'].astype(float)
#                         df['low'] = df['low'].astype(float)
#                         print(f"fetch_historical_data: DataFrame created with {len(df)} rows")
#                         logger.info(f"DataFrame created with {len(df)} rows")
                        
#                         # Human-readable console output
#                         print("\nfetch_historical_data: Historical Data Summary========================")
#                         print(f"Security ID: {security_id}, Instrument: {instrument_type}")
#                         print(f"Date Range: {df['date'].min().strftime('%Y-%m-%d')} to {df['date'].max().strftime('%Y-%m-%d')}")
#                         print(f"Total Rows: {len(df)}")
#                         print(f"Latest Close Price: {df['close'].iloc[-1]:.2f}")
#                         print("\nRecent Data (last 20 rows):")
#                         # Format date and volume for readability
#                         display_df = df[['date', 'open', 'high', 'low', 'close', 'volume']].tail(20).copy()
#                         display_df['date'] = display_df['date'].dt.strftime('%Y-%m-%d')
#                         display_df['volume'] = display_df['volume'].astype(int)
#                         print(display_df.to_string(index=False, float_format='%.2f'))
#                         print("\n")
                        
#                         return df
#                     else:
#                         print(f"fetch_historical_data: Empty data lists, attempt {attempt}/{max_retries}")
#                         logger.warning(f"Empty data lists: {data.get('remarks', 'No remarks')}")
#                 elif isinstance(data_inner, list) and all(isinstance(item, dict) for item in data_inner):
#                     df = pd.DataFrame(data_inner)
#                     if all(key in df.columns for key in ['timestamp', 'open', 'high', 'low', 'close', 'volume']):
#                         df['date'] = pd.to_datetime(df['timestamp'], unit='s').tz_localize('UTC').tz_convert('Asia/Kolkata')
#                         df = df[['date', 'timestamp', 'open', 'high', 'low', 'close', 'volume']]
#                         df = df.dropna(subset=['close'])
#                         df['close'] = df['close'].astype(float)
#                         df['high'] = df['high'].astype(float)
#                         df['low'] = df['low'].astype(float)
#                         print(f"fetch_historical_data: DataFrame created with {len(df)} rows (list format)")
#                         logger.info(f"DataFrame created with {len(df)} rows (list format)")
                        
#                         # Human-readable console output for list format
#                         print("\nfetch_historical_data: Historical Data Summary=========================")
#                         print(f"Security ID: {security_id}, Instrument: {instrument_type}")
#                         print(f"Date Range: {df['date'].min().strftime('%Y-%m-%d')} to {df['date'].max().strftime('%Y-%m-%d')}")
#                         print(f"Total Rows: {len(df)}")
#                         print(f"Latest Close Price: {df['close'].iloc[-1]:.2f}")
#                         print("\nRecent Data (last 20 rows):")
#                         display_df = df[['date', 'open', 'high', 'low', 'close', 'volume']].tail(20).copy()
#                         display_df['date'] = display_df['date'].dt.strftime('%Y-%m-%d')
#                         display_df['volume'] = display_df['volume'].astype(int)
#                         print(display_df.to_string(index=False, float_format='%.2f'))
#                         print("\n")
                        
#                         return df
#                     else:
#                         print(f"fetch_historical_data: Invalid list data format, attempt {attempt}/{max_retries}")
#                         logger.warning(f"Invalid list data format: {data.get('remarks', 'No remarks')}")
#                 else:
#                     print(f"fetch_historical_data: Invalid data format, attempt {attempt}/{max_retries}")
#                     logger.warning(f"Invalid data format: {data.get('remarks', 'No remarks')}")
#             else:
#                 print(f"fetch_historical_data: Invalid response format, attempt {attempt}/{max_retries}, response={data}")
#                 logger.warning(f"Invalid response format: {data.get('remarks', 'No remarks')}")
#         except Exception as e:
#             print(f"fetch_historical_data: Error on attempt {attempt}/{max_retries}: {e}")
#             logger.error(f"Error on attempt {attempt}/{max_retries}: {e}")
#         if attempt < max_retries:
#             sleep_time = 5 * (2 ** (attempt - 1))
#             print(f"fetch_historical_data: Retrying in {sleep_time} seconds...")
#             time.sleep(sleep_time)
#     print("fetch_historical_data: Failed after all retries")
#     logger.error("Failed to fetch data after all retries")
#     return None

# def calculate_atr(df, period=10):
#     if df.empty or len(df) < period:
#         print(f"calculate_atr: Insufficient data, {len(df)} rows")
#         logger.warning(f"Insufficient data for ATR, {len(df)} rows")
#         return df
#     print(f"calculate_atr: Starting with {len(df)} rows, period={period}")
#     high_low = df['high'] - df['low']
#     high_close = np.abs(df['high'] - df['close'].shift())
#     low_close = np.abs(df['low'] - df['close'].shift())
#     true_range = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)
#     atr = true_range.rolling(window=period).mean()
#     df['atr'] = atr
#     print(f"calculate_atr: ATR calculated, last value={df['atr'].iloc[-1] if not df['atr'].empty else 'NaN'}")
#     logger.info(f"ATR calculated, last value={df['atr'].iloc[-1] if not df['atr'].empty else 'NaN'}")
#     return df

# def calculate_supertrend(df, period=10, multiplier=4):
#     if df.empty or len(df) < period:
#         print(f"calculate_supertrend: Insufficient data, {len(df)} rows")
#         logger.warning(f"Insufficient data for Supertrend, {len(df)} rows")
#         return df
#     print(f"calculate_supertrend: Starting with {len(df)} rows, period={period}, multiplier={multiplier}")
#     df = calculate_atr(df, period)
    
#     hl2 = (df['high'] + df['low']) / 2
#     df['basic_upper'] = hl2 + (multiplier * df['atr'])
#     df['basic_lower'] = hl2 - (multiplier * df['atr'])
    
#     df['supertrend'] = 0.0
#     df['supertrend_direction'] = 0
#     df.loc[period, 'supertrend'] = df.loc[period, 'basic_lower']
#     df.loc[period, 'supertrend_direction'] = 1
    
#     for i in range(period + 1, len(df)):
#         if df['close'].iloc[i-1] > df['supertrend'].iloc[i-1]:
#             supertrend_val = min(df['basic_lower'].iloc[i], df['supertrend'].iloc[i-1])
#             df.loc[i, 'supertrend'] = supertrend_val
#             df.loc[i, 'supertrend_direction'] = 1
#         else:
#             supertrend_val = max(df['basic_upper'].iloc[i], df['supertrend'].iloc[i-1])
#             df.loc[i, 'supertrend'] = supertrend_val
#             df.loc[i, 'supertrend_direction'] = -1
    
#     print(f"calculate_supertrend: Supertrend calculated, last value={df['supertrend'].iloc[-1]}, direction={df['supertrend_direction'].iloc[-1]}")
#     logger.info(f"Supertrend calculated: close={df['close'].iloc[-1]}, supertrend={df['supertrend'].iloc[-1]}, direction={df['supertrend_direction'].iloc[-1]}")
#     return df

# def calculate_rsi(df, period=14):
#     if df.empty or len(df) < period:
#         print(f"calculate_rsi: Insufficient data, {len(df)} rows")
#         logger.warning(f"Insufficient data for RSI, {len(df)} rows")
#         return df
#     print(f"calculate_rsi: Starting with {len(df)} rows, period={period}")
#     delta = df['close'].diff()
#     gain = delta.where(delta > 0, 0)
#     loss = -delta.where(delta < 0, 0)
    
#     avg_gain = gain.rolling(window=period).mean()
#     avg_loss = loss.rolling(window=period).mean()
    
#     rs = avg_gain / avg_loss.where(avg_loss != 0, 1e-10)
#     rsi = 100 - (100 / (1 + rs))
#     df['rsi'] = rsi
#     print(f"calculate_rsi: RSI calculated, last value={df['rsi'].iloc[-1] if not df['rsi'].empty else 'NaN'}")
#     logger.info(f"RSI calculated, last value={df['rsi'].iloc[-1] if not df['rsi'].empty else 'NaN'}")
#     return df

# def calculate_moving_averages(df, short_period, long_period):
#     if df.empty or len(df) < long_period:
#         print(f"calculate_moving_averages: Insufficient data, {len(df)} rows, required={long_period}")
#         logger.warning(f"Insufficient data for moving averages, {len(df)} rows, required={long_period}")
#         return df
#     print(f"calculate_moving_averages: Starting with {len(df)} rows, short_period={short_period}, long_period={long_period}")
#     df['short_ma'] = df['close'].rolling(window=short_period).mean()
#     df['long_ma'] = df['close'].rolling(window=long_period).mean()
#     print(f"calculate_moving_averages: Short MA calculated, last value={df['short_ma'].iloc[-1] if not df['short_ma'].empty else 'NaN'}")
#     print(f"calculate_moving_averages: Long MA calculated, last value={df['long_ma'].iloc[-1] if not df['long_ma'].empty else 'NaN'}")
#     logger.info(f"Short MA last value={df['short_ma'].iloc[-1] if not df['short_ma'].empty else 'NaN'}, Long MA last value={df['long_ma'].iloc[-1] if not df['long_ma'].empty else 'NaN'}")
#     return df

# def generate_signals(df, rsi_oversold=30, rsi_overbought=70):
#     print("generate_signals: Starting signal generation")
#     df['ma_signal'] = 0
#     df['rsi_signal'] = 0
#     df['supertrend_signal'] = 0
    
#     df.loc[df['short_ma'] > df['long_ma'], 'ma_signal'] = 1
#     df.loc[df['short_ma'] < df['long_ma'], 'ma_signal'] = -1
#     df.loc[df['rsi'] < rsi_oversold, 'rsi_signal'] = 1
#     df.loc[df['rsi'] > rsi_overbought, 'rsi_signal'] = -1
#     df.loc[df['supertrend_direction'] == 1, 'supertrend_signal'] = 1
#     df.loc[df['supertrend_direction'] == -1, 'supertrend_signal'] = -1
    
#     df['signal'] = 0
#     df.loc[(df['supertrend_signal'] == 1) & (df['rsi_signal'] != -1), 'signal'] = 1
#     df.loc[(df['supertrend_signal'] == -1) & (df['rsi_signal'] != 1), 'signal'] = -1
    
#     if df[['short_ma', 'long_ma', 'rsi', 'supertrend']].iloc[-1].isna().any():
#         print("generate_signals: NaN values in indicators, setting signal to 0")
#         logger.warning("NaN values in indicators, setting signal to 0")
#         df['signal'] = 0
    
#     print(f"generate_signals: Last signal={df['signal'].iloc[-1]}, ma_signal={df['ma_signal'].iloc[-1]}, rsi_signal={df['rsi_signal'].iloc[-1]}, supertrend_signal={df['supertrend_signal'].iloc[-1]}")
#     logger.info(f"Signal details: signal={df['signal'].iloc[-1]}, ma_signal={df['ma_signal'].iloc[-1]}, rsi_signal={df['rsi_signal'].iloc[-1]}, supertrend_signal={df['supertrend_signal'].iloc[-1]}")
#     return df

# def place_order(transaction_type, security_id, exchange_segment, quantity, symbol):
#     print(f"===========================place_order: Starting for {transaction_type}, security_id={security_id}, quantity={quantity}, symbol={symbol}")
#     logger.info(f"Placing {transaction_type} order for security_id={security_id}, symbol={symbol}, quantity={quantity}")
#     try:
#         # Required fields
#         order_type = "MARKET"
#         product_type = "MARGIN" if exchange_segment in ["NSE_FNO", "BSE_FNO"] else "CNC"
#         validity = "DAY"
#         price = 0.0
#         trigger_price = 0.0

#         # Validate values
#         valid_segments = ["NSE_EQ", "BSE_EQ", "NSE_FNO", "BSE_FNO"]
#         valid_products = ["CNC", "INTRADAY", "MARGIN"]
#         valid_transactions = ["BUY", "SELL"]
#         valid_orders = ["MARKET", "LIMIT", "STOP_LOSS", "STOP_LOSS_MARKET"]
        
#         if exchange_segment not in valid_segments:
#             raise ValueError(f"Invalid exchange_segment: {exchange_segment}. Valid: {valid_segments}")
#         if product_type not in valid_products:
#             raise ValueError(f"Invalid product_type: {product_type}. Valid: {valid_products}")
#         if transaction_type not in valid_transactions:
#             raise ValueError(f"Invalid transaction_type: {transaction_type}. Valid: {valid_transactions}")
#         if order_type not in valid_orders:
#             raise ValueError(f"Invalid order_type: {order_type}. Valid: {valid_orders}")
#         if quantity <= 0:
#             raise ValueError(f"Invalid quantity: {quantity}. Must be greater than 0")
#         if not security_id:
#             raise ValueError("security_id cannot be empty")

#         # Construct order payload with only supported fields
#         order_payload = {
#             "transaction_type": transaction_type,
#             "exchange_segment": exchange_segment,
#             "product_type": product_type,
#             "order_type": order_type,
#             "validity": validity,
#             "security_id": str(security_id),
#             "quantity": int(quantity),
#             "disclosed_quantity": 0,
#             "price": price,
#             "trigger_price": trigger_price,
#             "after_market_order": False,
#             "amo_time": "",
#             "bo_profit_value": 0.0
#         }

#         print(f"place_order: Order payload={order_payload}")
#         logger.info(f"Order payload={order_payload}")

#         if is_market_open():
#             try:
#                 order_response = dhan.place_order(**order_payload)
#                 print(f"place_order: Live Order Response={order_response}")
#                 logger.info(f"Live Order Response={order_response}")
#             except Exception as e:
#                 print(f"place_order: Dhan API error: {e}")
#                 logger.error(f"Dhan API error: {e}")
#                 return None

#             if not isinstance(order_response, dict) or "order_id" not in order_response:
#                 print(f"place_order: Invalid API response: {order_response}")
#                 logger.error(f"Invalid API response: {order_response}")
#                 return None

#             if order_response.get("orderStatus") == "PLACED":
#                 order_id = order_response.get("order_id")
#                 order_symbol = symbol  # Use input symbol as fallback
#                 order_status = order_response.get("orderStatus", "PENDING")
#                 status = "EXECUTED" if order_status in ["FILLED", "EXECUTED", "COMPLETED","TRANSIT"] else "PENDING"

#                 # Save order to database
#                 try:
#                     save_offline_order(
#                         order_id=order_id,
#                         security_id=security_id,
#                         exchange_segment=exchange_segment,
#                         transaction_type=transaction_type,
#                         quantity=quantity,
#                         order_type=order_type,
#                         product_type=product_type,
#                         price=price,
#                         trigger_price=trigger_price,
#                         order_symbol=order_symbol,
#                         status=status
#                     )
#                     print(f"place_order: Order saved to database, order_id={order_id}")
#                     logger.info(f"Order saved to database, order_id={order_id}")
#                 except Exception as e:
#                     print(f"place_order: Database save error: {e}")
#                     logger.error(f"Database save error: {e}")

#                 print(f"===========================place_order: Order placed successfully, order_id={order_id}===========================")
#                 logger.info(f"===========================Order placed: order_id={order_id}===========================")
#                 return order_response
#             else:
#                 print(f"place_order: Order failed, response={order_response}")
#                 logger.error(f"Order failed: response={order_response}")
#                 return None
#         else:
#             test_order_id = f"TEST_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"
#             print(f"place_order: Market closed, saving offline order with test_order_id={test_order_id}")
#             logger.info(f"Market closed, saving offline order with test_order_id={test_order_id}")
#             try:
#                 save_offline_order(
#                     order_id=test_order_id,
#                     security_id=security_id,
#                     exchange_segment=exchange_segment,
#                     transaction_type=transaction_type,
#                     quantity=quantity,
#                     order_type=order_type,
#                     product_type=product_type,
#                     price=price,
#                     trigger_price=trigger_price,
#                     order_symbol=symbol,
#                     status="PENDING"
#                 )
#                 print(f"place_order: Offline order saved, test_order_id={test_order_id}")
#                 logger.info(f"Offline order saved, test_order_id={test_order_id}")
#                 return {"order_id": test_order_id, "status": "offline", "message": "Market closed, order saved"}
#             except Exception as e:
#                 print(f"place_order: Database save error for offline order: {e}")
#                 logger.error(f"Database save error for offline order: {e}")
#                 return None
#     except Exception as e:
#         print(f"place_order: Error placing order: {e}")
#         logger.error(f"Order error: {e}")
#         return None

# async def trading_bot():
#     print("trading_bot: Starting")
#     logger.info("Trading bot started")
#     while bot_running:
#         print("=============================trading_bot: New iteration===========================")
#         try:
#             conn = get_db_connection()
#             cursor = conn.cursor(dictionary=True)
#             cursor.execute("SELECT symbol, security_id, exchange_segment, instrument_type, quantity, rsi_oversold, rsi_overbought, supertrend_period, supertrend_multiplier FROM watchlist")
#             watchlist_data = cursor.fetchall()
#             conn.close()
#             print(f"===========================trading_bot: Watchlist data={watchlist_data}===========================")

#             for item in watchlist_data:
#                 symbol = item['symbol']
#                 security_id = item['security_id']
#                 exchange_segment = item.get('exchange_segment', 'NSE_FNO')
#                 instrument_type = item.get('instrument_type', 'OPTIDX')
#                 quantity = item['quantity']
#                 rsi_oversold = item.get('rsi_oversold', RSI_OVERSOLD)
#                 rsi_overbought = item.get('rsi_overbought', RSI_OVERBOUGHT)
#                 supertrend_period = item.get('supertrend_period', SUPERTREND_PERIOD)
#                 supertrend_multiplier = item.get('supertrend_multiplier', SUPERTREND_MULTIPLIER)
#                 position = positions.get(symbol, 0)

#                 print(f"===========================trading_bot: Processing {symbol}, position={position}")
#                 try:
#                     from_date = (pd.Timestamp.now() - pd.Timedelta(days=60)).strftime('%Y-%m-%d')
#                     to_date = pd.Timestamp.now().strftime('%Y-%m-%d')
#                     expiry_code = get_expiry_code(symbol, exchange_segment, instrument_type)
#                     df = fetch_historical_data(security_id, exchange_segment, from_date, to_date, instrument_type, expiry_code)
#                     print(f"trading_bot: Fetched data for {symbol}, rows={len(df) if df is not None else 0}")

#                     if df is None or len(df) < MIN_MA_PERIOD:
#                         print(f"trading_bot: Insufficient data for {symbol}, rows={len(df) if df is not None else 0}, minimum required={MIN_MA_PERIOD}")
#                         logger.warning(f"Insufficient data for {symbol}, rows={len(df) if df is not None else 0}, minimum required={MIN_MA_PERIOD}. Check security_id, expiry_code, or data availability.")
#                         continue

#                     adjusted_long_ma_period = min(LONG_MA_PERIOD, max(MIN_MA_PERIOD, len(df)))
#                     if adjusted_long_ma_period < LONG_MA_PERIOD:
#                         print(f"trading_bot: Adjusting LONG_MA_PERIOD from {LONG_MA_PERIOD} to {adjusted_long_ma_period} for {symbol} due to insufficient data")
#                         logger.info(f"Adjusting LONG_MA_PERIOD from {LONG_MA_PERIOD} to {adjusted_long_ma_period} for {symbol}")

#                     df = calculate_moving_averages(df, SHORT_MA_PERIOD, adjusted_long_ma_period)
#                     df = calculate_rsi(df, RSI_PERIOD)
#                     df = calculate_supertrend(df, supertrend_period, supertrend_multiplier)

#                     if df[['short_ma', 'long_ma', 'rsi', 'supertrend']].iloc[-1].isna().any():
#                         print(f"trading_bot: NaN values in indicators for {symbol}, skipping")
#                         logger.warning(f"NaN values in indicators for {symbol}")
#                         continue

#                     df = generate_signals(df, rsi_oversold, rsi_overbought)
#                     latest_signal = df['signal'].iloc[-1]
#                     print(f"trading_bot: {symbol} - signal={latest_signal}, ma_signal={df['ma_signal'].iloc[-1]}, rsi_signal={df['rsi_signal'].iloc[-1]}, supertrend_signal={df['supertrend_signal'].iloc[-1]}")
#                     logger.info(f"{symbol} - signal={latest_signal}")

#                     if latest_signal == 1 and position == 0:
#                         order = place_order(dhan.BUY, security_id, exchange_segment, quantity, symbol)
#                         if order and order.get("orderStatus") == "PLACED":
#                             positions[symbol] = 1
#                             print(f"trading_bot: {symbol} - Long position opened")
#                             logger.info(f"{symbol} - Long position opened")
#                         elif order and order.get("status") == "offline":
#                             print(f"trading_bot: {symbol} - Offline order saved")
#                             logger.info(f"{symbol} - Offline order saved")
#                         else:
#                             print(f"trading_bot: {symbol} - Order failed")
#                             logger.error(f"{symbol} - Order failed")
#                     elif latest_signal == -1 and position == 1:
#                         order = place_order(dhan.SELL, security_id, exchange_segment, quantity, symbol)
#                         if order and order.get("orderStatus") == "PLACED":
#                             positions[symbol] = 0
#                             print(f"trading_bot: {symbol} - Position closed")
#                             logger.info(f"{symbol} - Position closed")
#                         elif order and order.get("status") == "offline":
#                             print(f"trading_bot: {symbol} - Offline order saved")
#                             logger.info(f"{symbol} - Offline order saved")
#                         else:
#                             print(f"trading_bot: {symbol} - Order failed")
#                             logger.error(f"{symbol} - Order failed")
#                     else:
#                         print(f"trading_bot: {symbol} - No action")
#                         logger.info(f"{symbol} - No action")
#                 except Exception as e:
#                     print(f"trading_bot: Error for {symbol}: {e}")
#                     logger.error(f"Error for {symbol}: {e}")
#         except Exception as e:
#             print(f"trading_bot: Error fetching watchlist: {e}")
#             logger.error(f"Error fetching watchlist: {e}")
        
#         print(f"===========================trading_bot: Waiting {INTERVAL} seconds===========================")
#         await asyncio.sleep(INTERVAL)

# @trading_bot_bp.route('/trading_bot/watchlist/add', methods=['POST'])
# def add_to_watchlist():
#     print("API /watchlist/add: Request received")
#     data = request.get_json(silent=True)
#     if not data or 'symbol' not in data or 'security_id' not in data or 'quantity' not in data:
#         print("API /watchlist/add: Missing required fields")
#         logger.warning("Missing required fields in /watchlist/add")
#         return jsonify({"status": "error", "message": "Symbol, security_id, and quantity required"}), 400
    
#     symbol = data['symbol'].upper()
#     quantity = int(data['quantity'])
#     if quantity <= 0:
#         print("API /watchlist/add: Quantity must be positive")
#         logger.warning("Quantity must be positive in /watchlist/add")
#         return jsonify({"status": "error", "message": "Quantity must be positive"}), 400
    
#     conn = get_db_connection()
#     cursor = conn.cursor()
#     try:
#         cursor.execute("SELECT 1 FROM watchlist WHERE symbol = %s", (symbol,))
#         if cursor.fetchone():
#             print(f"API /watchlist/add: {symbol} already in watchlist")
#             logger.warning(f"{symbol} already in watchlist")
#             return jsonify({"status": "error", "message": f"{symbol} already in watchlist"}), 400
        
#         security_id = data['security_id']
#         exchange_segment = data.get('exchange_segment', 'NSE_FNO')

#         if 'instrument_type' in data:
#             instrument_type = data['instrument_type']
#         else:
#             if exchange_segment == 'NSE_EQ':
#                 instrument_type = 'EQUITY'
#             else:
#                 instrument_type = 'OPTIDX'

#         rsi_oversold = data.get('rsi_oversold', RSI_OVERSOLD)
#         rsi_overbought = data.get('rsi_overbought', RSI_OVERBOUGHT)
#         supertrend_period = data.get('supertrend_period', SUPERTREND_PERIOD)
#         supertrend_multiplier = data.get('supertrend_multiplier', SUPERTREND_MULTIPLIER)

#         logger.warning(f"API /watchlist/add: Skipping security_id validation for {security_id}. Replace with actual validation.")

#         cursor.execute(
#             """INSERT INTO watchlist (symbol, security_id, quantity, exchange_segment, instrument_type, rsi_oversold, rsi_overbought, supertrend_period, supertrend_multiplier)
#                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
#             (symbol, security_id, quantity, exchange_segment, instrument_type, rsi_oversold, rsi_overbought, supertrend_period, supertrend_multiplier)
#         )
#         conn.commit()
#         print(f"API /watchlist/add: Added {symbol}")
#         logger.info(f"Added to watchlist: {symbol}")
#         return jsonify({"status": "success", "message": f"{symbol} added to watchlist"})
#     except Exception as e:
#         conn.rollback()
#         print(f"API /watchlist/add: Error: {e}")
#         logger.error(f"Error adding to watchlist: {e}")
#         return jsonify({"status": "error", "message": "Failed to add to watchlist"}), 500
#     finally:
#         conn.close()

# @trading_bot_bp.route('/trading_bot/watchlist/remove', methods=['POST'])
# def remove_from_watchlist():
#     print("API /watchlist/remove: Request received")
#     data = request.get_json(silent=True)
#     if not data or 'symbol' not in data:
#         print("API /watchlist/remove: Missing symbol")
#         logger.warning("Missing symbol in /watchlist/remove")
#         return jsonify({"status": "error", "message": "Symbol required"}), 400
    
#     symbol = data['symbol'].upper()
#     conn = get_db_connection()
#     cursor = conn.cursor()
#     try:
#         cursor.execute("DELETE FROM watchlist WHERE symbol = %s", (symbol,))
#         if cursor.rowcount > 0:
#             conn.commit()
#             positions.pop(symbol, None)
#             print(f"API /watchlist/remove: Removed {symbol}")
#             logger.info(f"Removed from watchlist: {symbol}")
#             return jsonify({"status": "success", "message": f"{symbol} removed from watchlist"})
#         print(f"API /watchlist/remove: {symbol} not found")
#         logger.warning(f"{symbol} not found in watchlist")
#         return jsonify({"status": "error", "message": f"{symbol} not in watchlist"}), 400
#     except Exception as e:
#         conn.rollback()
#         print(f"API /watchlist/remove: Error: {e}")
#         logger.error(f"Error removing from watchlist: {e}")
#         return jsonify({"status": "error", "message": "Failed to remove from watchlist"}), 500
#     finally:
#         conn.close()

# @trading_bot_bp.route('/trading_bot/watchlist', methods=['GET'])
# def get_watchlist():
#     print("API /watchlist: Request received")
#     conn = get_db_connection()
#     cursor = conn.cursor(dictionary=True)
#     try:
#         cursor.execute("SELECT * FROM watchlist")
#         watchlist_data = cursor.fetchall()
#         print("API /watchlist: Fetched watchlist data")
#         logger.info("Fetched watchlist data")
#         return jsonify({"status": "success", "data": watchlist_data})
#     except Exception as e:
#         print(f"API /watchlist: Error: {e}")
#         logger.error(f"Error fetching watchlist: {e}")
#         return jsonify({"status": "error", "message": "Failed to fetch watchlist"}), 500
#     finally:
#         conn.close()

# @trading_bot_bp.route('/trading_bot/start', methods=['POST'])
# def start_bot():
#     global bot_running, loop, task
#     print("API /start: Request received")
#     if bot_running:
#         print("API /start: Bot already running")
#         logger.warning("Bot already running")
#         return jsonify({"status": "error", "message": "Bot is already running"}), 400
    
#     conn = get_db_connection()
#     cursor = conn.cursor()
#     cursor.execute("SELECT COUNT(*) as count FROM watchlist")
#     count = cursor.fetchone()[0]
#     conn.close()
#     if count == 0:
#         print("API /start: Watchlist is empty")
#         logger.warning("Watchlist is empty")
#         return jsonify({"status": "error", "message": "Watchlist is empty"}), 400
    
#     try:
#         data = request.get_json(silent=True) or {}
#         print("API /start: Using per-symbol settings from watchlist")
#         logger.info("Starting bot with per-symbol settings")
#     except Exception as e:
#         print(f"API /start: Invalid JSON or content type, using defaults. Error: {e}")
#         logger.warning(f"Invalid JSON or content type in /start: {e}")
    
#     bot_running = True
#     loop = asyncio.new_event_loop()
#     asyncio.set_event_loop(loop)
#     task = loop.create_task(trading_bot())
#     threading.Thread(target=loop.run_forever, daemon=True).start()
#     print("API /start: Bot started")
#     logger.info("Bot started")
#     return jsonify({"status": "success", "message": "Bot started"})

# @trading_bot_bp.route('/trading_bot/stop', methods=['POST'])
# def stop_bot():
#     global bot_running, loop, task
#     print("API /stop: Request received")
#     if not bot_running:
#         print("API /stop: Bot not running")
#         logger.warning("Bot not running")
#         return jsonify({"status": "error", "message": "Bot not running"}), 400
#     bot_running = False
#     if task:
#         task.cancel()
#     if loop:
#         loop.call_soon_threadsafe(loop.stop)
#         loop.run_until_complete(loop.shutdown_asyncgens())
#         loop.close()
#     print("API /stop: Bot stopped")
#     logger.info("Bot stopped")
#     return jsonify({"status": "success", "message": "Bot stopped"})

# @trading_bot_bp.route('/trading_bot/status', methods=['GET'])
# def get_status():
#     print("API /status: Request received")
#     conn = get_db_connection()
#     cursor = conn.cursor(dictionary=True)
#     try:
#         cursor.execute("SELECT symbol FROM watchlist")
#         watchlist_symbols = [row['symbol'] for row in cursor.fetchall()]
#         status = {
#             "bot_running": bot_running,
#             "positions": {symbol: "long" if pos == 1 else "none" for symbol, pos in positions.items()},
#             "watchlist": watchlist_symbols,
#             "parameters": {
#                 "rsi_oversold": RSI_OVERSOLD,
#                 "rsi_overbought": RSI_OVERBOUGHT,
#                 "supertrend_period": SUPERTREND_PERIOD,
#                 "supertrend_multiplier": SUPERTREND_MULTIPLIER
#             }
#         }
#         print(f"API /status: Returning status")
#         logger.info(f"Status: {status}")
#         return jsonify({"status": "success", "data": status})
#     except Exception as e:
#         print(f"API /status: Error: {e}")
#         logger.error(f"Error fetching status: {e}")
#         return jsonify({"status": "error", "message": "Failed to fetch status"}), 500
#     finally:
#         conn.close()

# @trading_bot_bp.route('/trading_bot/trade', methods=['POST'])
# def manual_trade():
#     print("API /trade: Request received")
#     data = request.get_json()
#     if not data or 'action' not in data or 'symbol' not in data:
#         print("API /trade: Missing action or symbol")
#         logger.warning("Missing action or symbol in /trade")
#         return jsonify({"status": "error", "message": "Action and symbol required"}), 400
#     action = data['action'].upper()
#     symbol = data['symbol'].upper()
#     if action not in ['BUY', 'SELL']:
#         print(f"API /trade: Invalid action={action}")
#         logger.warning(f"Invalid action={action} in /trade")
#         return jsonify({"status": "error", "message": "Action must be 'buy' or 'sell'"}), 400
    
#     conn = get_db_connection()
#     cursor = conn.cursor(dictionary=True)
#     try:
#         cursor.execute("SELECT security_id, exchange_segment, quantity, instrument_type FROM watchlist WHERE symbol = %s", (symbol,))
#         watchlist_item = cursor.fetchone()
#         if not watchlist_item:
#             print(f"API /trade: {symbol} not in watchlist")
#             logger.warning(f"{symbol} not in watchlist")
#             return jsonify({"status": "error", "message": f"{symbol} not in watchlist"}), 400
        
#         order = place_order(
#             dhan.BUY if action == 'BUY' else dhan.SELL,
#             watchlist_item['security_id'],
#             watchlist_item['exchange_segment'] or 'NSE_FNO',
#             watchlist_item['quantity'],
#             symbol
#         )
#         if order and order.get("orderStatus") == "PLACED":
#             print("API /trade: Order placed")
#             logger.info(f"Order placed for {symbol}: {action}")
#             return jsonify({"status": "success", "order_id": order.get("order_id"), "order_status": order.get("orderStatus")})
#         elif order and order.get("status") == "offline":
#             print("API /trade: Offline order saved")
#             logger.info(f"Offline order saved for {symbol}: {action}")
#             return jsonify({"status": "offline", "order_id": order.get("order_id"), "message": "Market closed, order saved"})
#         print("API /trade: Order failed")
#         logger.error(f"Order failed for {symbol}: {action}")
#         return jsonify({"status": "error", "message": "Failed to place order"}), 500
#     except Exception as e:
#         print(f"API /trade: Error: {e}")
#         logger.error(f"Error placing trade: {e}")
#         return jsonify({"status": "error", "message": "Failed to place trade"}), 500
#     finally:
#         conn.close()

# @trading_bot_bp.route('/force_signal', methods=['POST'])
# def force_signal():
#     print("API /force_signal: Request received")
#     data = request.get_json(silent=True) or {}
#     signal_type = data.get('signal', '').upper()
#     symbol = data.get('symbol', '').upper()
#     if signal_type not in ['BUY', 'SELL'] or not symbol:
#         print("API /force_signal: Invalid signal or symbol")
#         logger.warning("Invalid signal or symbol in /force_signal")
#         return jsonify({"status": "error", "message": "Signal (buy/sell) and symbol required"}), 400
    
#     conn = get_db_connection()
#     cursor = conn.cursor(dictionary=True)
#     try:
#         cursor.execute("SELECT security_id, exchange_segment, quantity, instrument_type FROM watchlist WHERE symbol = %s", (symbol,))
#         watchlist_item = cursor.fetchone()
#         if not watchlist_item:
#             print(f"API /force_signal: {symbol} not in watchlist")
#             logger.warning(f"{symbol} not in watchlist")
#             return jsonify({"status": "error", "message": f"{symbol} not in watchlist"}), 400
        
#         position = positions.get(symbol, 0)
#         if signal_type == 'BUY' and position == 0:
#             order = place_order(dhan.BUY, watchlist_item['security_id'], watchlist_item['exchange_segment'] or 'NSE_FNO', watchlist_item['quantity'], symbol)
#             if order and order.get("orderStatus") == "PLACED":
#                 positions[symbol] = 1
#                 print(f"API /force_signal: Forced BUY for {symbol}")
#                 logger.info(f"Forced BUY for {symbol}")
#                 return jsonify({"status": "success", "order_id": order.get("order_id"), "order_status": order.get("orderStatus")})
#             elif order and order.get("status") == "offline":
#                 print(f"API /force_signal: Offline BUY order saved for {symbol}")
#                 logger.info(f"Offline BUY order saved for {symbol}")
#                 return jsonify({"status": "offline", "order_id": order.get("order_id"), "message": "Market closed, order saved"})
#         elif signal_type == 'SELL' and position == 1:
#             order = place_order(dhan.SELL, watchlist_item['security_id'], watchlist_item['exchange_segment'] or 'NSE_FNO', watchlist_item['quantity'], symbol)
#             if order and order.get("orderStatus") == "PLACED":
#                 positions[symbol] = 0
#                 print(f"API /force_signal: Forced SELL for {symbol}")
#                 logger.info(f"Forced SELL for {symbol}")
#                 return jsonify({"status": "success", "order_id": order.get("order_id"), "order_status": order.get("orderStatus")})
#             elif order and order.get("status") == "offline":
#                 print(f"API /force_signal: Offline SELL order saved for {symbol}")
#                 logger.info(f"Offline SELL order saved for {symbol}")
#                 return jsonify({"status": "offline", "order_id": order.get("order_id"), "message": "Market closed, order saved"})
#         print(f"API /force_signal: Invalid position for {symbol}")
#         logger.warning(f"Invalid position for {symbol} in /force_signal")
#         return jsonify({"status": "error", "message": "Invalid position for signal"}), 400
#     except Exception as e:
#         print(f"API /force_signal: Error: {e}")
#         logger.error(f"Error forcing signal: {e}")
#         return jsonify({"status": "error", "message": "Failed to force signal"}), 500
#     finally:
#         conn.close()

# @trading_bot_bp.route('/trading_bot/reset_position', methods=['POST'])
# def reset_position():
#     print("API /reset_position: Request received")
#     data = request.get_json(silent=True) or {}
#     symbol = data.get('symbol', '').upper()
#     if symbol:
#         conn = get_db_connection()
#         cursor = conn.cursor()
#         try:
#             cursor.execute("SELECT 1 FROM watchlist WHERE symbol = %s", (symbol,))
#             if cursor.fetchone():
#                 positions[symbol] = 0
#                 print(f"API /reset_position: Position reset for {symbol}")
#                 logger.info(f"Position reset for {symbol}")
#                 return jsonify({"status": "success", "message": f"Position reset for {symbol}"})
#             print(f"API /reset_position: {symbol} not found")
#             logger.warning(f"{symbol} not found in watchlist")
#             return jsonify({"status": "error", "message": f"{symbol} not found"}), 400
#         except Exception as e:
#             print(f"API /reset_position: Error: {e}")
#             logger.error(f"Error resetting position: {e}")
#             return jsonify({"status": "error", "message": "Failed to reset position"}), 500
#         finally:
#             conn.close()
#     positions.clear()
#     print("API /reset_position: All positions reset")
#     logger.info("All positions reset")
#     return jsonify({"status": "success", "message": "All positions reset"})










# from flask import Flask, jsonify, request, Blueprint
# import asyncio
# import pandas as pd
# from dhanhq import dhanhq
# import numpy as np
# import time
# import threading
# import logging
# import json
# import requests
# import datetime
# from flask_cors import CORS
# from config import client_id, access_token
# from db import save_offline_order, get_db_connection

# print("Starting script: Importing modules completed")

# # Initialize Blueprint
# trading_bot_bp = Blueprint('trading_bot', __name__)
# print("Blueprint initialized: trading_bot")

# # Set up logging
# logging.basicConfig(level=logging.INFO, filename="trade_bot.log", format="%(asctime)s %(message)s")
# logger = logging.getLogger(__name__)
# print("Logging configured: trade_bot.log")

# # Flask app
# app = Flask(__name__)
# CORS(app)
# print("Flask app initialized")

# # Initialize Dhan API client
# dhan = dhanhq(client_id, access_token)
# print("Dhan API client initialized")

# # Trading parameters (defaults)
# SHORT_MA_PERIOD = 5
# LONG_MA_PERIOD = 20
# RSI_PERIOD = 14
# RSI_OVERSOLD = 40
# RSI_OVERBOUGHT = 60
# SUPERTREND_PERIOD = 10
# SUPERTREND_MULTIPLIER = 4
# INTERVAL = 60
# MIN_MA_PERIOD = 10
# print(f"Default trading parameters set: INTERVAL={INTERVAL}s, RSI_PERIOD={RSI_PERIOD}, SUPERTREND_PERIOD={SUPERTREND_PERIOD}, SUPERTREND_MULTIPLIER={SUPERTREND_MULTIPLIER}")

# # Global state
# bot_running = False
# positions = {}  # {symbol: {"order_id": str, "status": str, "transaction_type": str}}
# loop = None
# task = None
# print("Global state initialized: bot_running=False, positions={}")

# def is_market_open():
#     now = datetime.datetime.now()
#     is_weekday = now.weekday() < 5
#     market_open = datetime.time(9, 15) <= now.time() <= datetime.time(15, 30)
#     return is_weekday and market_open

# def get_security_id(symbol, exchange_segment='NSE_FNO', instrument_type="OPTIDX"):
#     print(f"get_security_id: Fetching security_id for {symbol}")
#     logger.info(f"Fetching security_id for {symbol}")
#     try:
#         logger.warning(f"get_security_id: Using placeholder logic for {symbol}. Replace with actual API call.")
#         return None
#     except Exception as e:
#         print(f"get_security_id: Error fetching security_id: {e}")
#         logger.error(f"Error fetching security_id: {e}")
#         return None

# def get_expiry_code(symbol, exchange_segment='NSE_FNO', instrument_type="OPTIDX"):
#     print(f"get_expiry_code: Fetching expiry_code for {symbol}")
#     logger.info(f"Fetching expiry_code for {symbol}")
#     try:
#         if instrument_type == 'EQUITY':
#             logger.info(f"No expiry code required for EQUITY: {symbol}")
#             return None
#         parts = symbol.split('-')
#         if len(parts) >= 4:
#             expiry_date = parts[1]
#             logger.warning(f"get_expiry_code: Parsed expiry_date={expiry_date} for {symbol}, defaulting to expiry_code=1. Verify with Dhan API.")
#             return 1
#         logger.warning(f"get_expiry_code: Could not parse expiry from {symbol}, defaulting to 1. Verify with Dhan API.")
#         return 1
#     except Exception as e:
#         print(f"get_expiry_code: Error fetching expiry_code: {e}")
#         logger.error(f"Error fetching expiry_code: {e}")
#         return 1

# def has_active_order(symbol, transaction_type="BUY"):
#     print(f"has_active_order: Checking for active {transaction_type} order for {symbol}")
#     logger.info(f"Checking for active {transaction_type} order for {symbol}")
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
#         cursor.execute(
#             "SELECT order_id, status FROM offline_order WHERE order_symbol = %s AND transaction_type = %s AND status IN ('PENDING', 'TRANSIT', 'EXECUTED')",
#             (symbol, transaction_type)
#         )
#         result = cursor.fetchone()
#         conn.close()
#         if result:
#             print(f"has_active_order: Found active order for {symbol}, order_id={result[0]}, status={result[1]}")
#             logger.info(f"Found active {transaction_type} order for {symbol}, order_id={result[0]}, status={result[1]}")
#             return {"order_id": result[0], "status": result[1]}
#         print(f"has_active_order: No active {transaction_type} order for {symbol}")
#         logger.info(f"No active {transaction_type} order for {symbol}")
#         return None
#     except Exception as e:
#         print(f"has_active_order: Error checking active order: {e}")
#         logger.error(f"Error checking active order for {symbol}: {e}")
#         return None

# def check_order_status(order_id):
#     print(f"check_order_status: Checking status for order_id={order_id}")
#     logger.info(f"Checking status for order_id={order_id}")
#     try:
#         headers = {"Authorization": f"Bearer {dhan.access_token}"}
#         response = requests.get(f"https://api.dhan.co/v2/orders/{order_id}", headers=headers).json()
#         print(f"check_order_status: Response={response}")
#         logger.info(f"Order status response: {response}")
#         if not isinstance(response, dict) or "data" not in response or not isinstance(response["data"], list) or not response["data"]:
#             print(f"check_order_status: Invalid response: {response}")
#             logger.error(f"Invalid order status response: {response}")
#             return "UNKNOWN"
#         status_data = response["data"][0]
#         status = status_data.get("orderStatus", "UNKNOWN")
#         return status
#     except Exception as e:
#         print(f"check_order_status: Error checking status: {e}")
#         logger.error(f"Error checking order status: {e}")
#         return "UNKNOWN"

# def fetch_historical_data(security_id, exchange_segment, from_date, to_date, instrument_type, expiry_code=1, days=60, max_retries=3):
#     print(f"fetch_historical_data: Starting for security_id={security_id}, from={from_date}, to={to_date}, instrument_type={instrument_type}")
#     logger.info(f"Fetching data for security_id={security_id}")
    
#     for attempt in range(1, max_retries + 1):
#         try:
#             if isinstance(from_date, datetime.datetime):
#                 from_date = from_date.strftime('%Y-%m-%d')
#             if isinstance(to_date, datetime.datetime):
#                 to_date = to_date.strftime('%Y-%m-%d')
            
#             to_date_dt = datetime.datetime.now()
#             from_date_dt = to_date_dt - datetime.timedelta(days=days * 2)
#             from_date = from_date_dt.strftime('%Y-%m-%d')
#             to_date = to_date_dt.strftime('%Y-%m-%d')
#             print(f"fetch_historical_data: Date range from={from_date}, to={to_date}")

#             # Conditionally set parameters based on instrument_type
#             params = {
#                 'security_id': security_id,
#                 'exchange_segment': exchange_segment,
#                 'instrument_type': instrument_type,
#                 'from_date': from_date,
#                 'to_date': to_date
#             }
#             if instrument_type != 'EQUITY':  # Only include expiry_code for non-equity (e.g., FNO)
#                 params['expiry_code'] = expiry_code

#             data = dhan.historical_daily_data(**params)

#             if data and 'status' in data and data['status'] == 'success' and 'data' in data:
#                 data_inner = data['data']
#                 if isinstance(data_inner, dict) and all(key in data_inner for key in ['open', 'high', 'low', 'close', 'volume', 'timestamp']):
#                     if len(data_inner['close']) > 0:
#                         df = pd.DataFrame({
#                             "date": pd.to_datetime(data_inner["timestamp"], unit="s").tz_localize("UTC").tz_convert("Asia/Kolkata"),
#                             'timestamp': data_inner['timestamp'],
#                             'open': data_inner['open'],
#                             'high': data_inner['high'],
#                             'low': data_inner['low'],
#                             'close': data_inner['close'],
#                             'volume': data_inner['volume']
#                         })
#                         df = df.dropna(subset=['close'])
#                         if df['close'].isnull().any():
#                             print("fetch_historical_data: NaN values in 'close' column")
#                             logger.warning("NaN values in 'close' column")
#                             return None
#                         df['close'] = df['close'].astype(float)
#                         df['high'] = df['high'].astype(float)
#                         df['low'] = df['low'].astype(float)
#                         print(f"fetch_historical_data: DataFrame created with {len(df)} rows")
#                         logger.info(f"DataFrame created with {len(df)} rows")
                        
#                         print("\nfetch_historical_data: Historical Data Summary========================")
#                         print(f"Security ID: {security_id}, Order Instrument: {instrument_type}")
#                         print(f"Date Range: {df['date'].min().strftime('%Y-%m-%d')} to {df['date'].max().strftime('%Y-%m-%d')}")
#                         print(f"Total Rows: {len(df)}")
#                         print(f"Latest Close Price: {df['close'].iloc[-1]:.2f}")
#                         print("\nRecent Data (last 20 rows):")
#                         display_df = df[['date', 'open', 'high', 'low', 'close', 'volume']].tail(20).copy()
#                         display_df['date'] = display_df['date'].dt.strftime('%Y-%m-%d')
#                         display_df['volume'] = display_df['volume'].astype(int)
#                         print(display_df.to_string(index=False, float_format='%.2f'))
#                         print("\n")
                        
#                         return df
#                     else:
#                         print(f"fetch_historical_data: Empty data lists, attempt {attempt}/{max_retries}")
#                         logger.warning(f"Empty data lists: {data.get('remarks', 'No remarks')}")
#                 elif isinstance(data_inner, list) and all(isinstance(item, dict) for item in data_inner):
#                     df = pd.DataFrame(data_inner)
#                     if all(key in df.columns for key in ['timestamp', 'open', 'high', 'low', 'close', 'volume']):
#                         df['date'] = pd.to_datetime(df['timestamp'], unit='s').tz_localize('UTC').tz_convert('Asia/Kolkata')
#                         df = df[['date', 'timestamp', 'open', 'high', 'low', 'close', 'volume']]
#                         df = df.dropna(subset=['close'])
#                         df['close'] = df['close'].astype(float)
#                         df['high'] = df['high'].astype(float)
#                         df['low'] = df['low'].astype(float)
#                         print(f"fetch_historical_data: DataFrame created with {len(df)} rows (list format)")
#                         logger.info(f"DataFrame created with {len(df)} rows (list format)")
                        
#                         print("\nfetch_historical_data: Historical Data Summary=========================")
#                         print(f"Security ID: {security_id}, Instrument: {instrument_type}")
#                         print(f"Date Range: {df['date'].min().strftime('%Y-%m-%d')} to {df['date'].max().strftime('%Y-%m-%d')}")
#                         print(f"Total Rows: {len(df)}")
#                         print(f"Latest Close Price: {df['close'].iloc[-1]:.2f}")
#                         print("\nRecent Data (last 20 rows):")
#                         display_df = df[['date', 'open', 'high', 'low', 'close', 'volume']].tail(20).copy()
#                         display_df['date'] = display_df['date'].dt.strftime('%Y-%m-%d')
#                         display_df['volume'] = display_df['volume'].astype(int)
#                         print(display_df.to_string(index=False, float_format='%.2f'))
#                         print("\n")
                        
#                         return df
#                     else:
#                         print(f"fetch_historical_data: Invalid list data format, attempt {attempt}/{max_retries}")
#                         logger.warning(f"Invalid list data format: {data.get('remarks', 'No remarks')}")
#                 else:
#                     print(f"fetch_historical_data: Invalid data format, attempt {attempt}/{max_retries}")
#                     logger.warning(f"Invalid data format: {data.get('remarks', 'No remarks')}")
#             else:
#                 print(f"fetch_historical_data: Invalid response format, attempt {attempt}/{max_retries}, response={data}")
#                 logger.warning(f"Invalid response format: {data.get('remarks', 'No remarks')}")
#         except Exception as e:
#             print(f"fetch_historical_data: Error on attempt {attempt}/{max_retries}: {e}")
#             logger.error(f"Error on attempt {attempt}/{max_retries}: {e}")
#         if attempt < max_retries:
#             sleep_time = 5 * (2 ** (attempt - 1))
#             print(f"fetch_historical_data: Retrying in {sleep_time} seconds...")
#             time.sleep(sleep_time)
#     print("fetch_historical_data: Failed after all retries")
#     logger.error("Failed to fetch data after all retries")
#     return None


# def calculate_atr(df, period=10):
#     if df.empty or len(df) < period:
#         print(f"calculate_atr: Insufficient data, {len(df)} rows")
#         logger.warning(f"Insufficient data for ATR, {len(df)} rows")
#         return df
#     print(f"calculate_atr: Starting with {len(df)} rows, period={period}")
#     high_low = df['high'] - df['low']
#     high_close = np.abs(df['high'] - df['close'].shift())
#     low_close = np.abs(df['low'] - df['close'].shift())
#     true_range = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)
#     atr = true_range.rolling(window=period).mean()
#     df['atr'] = atr
#     print(f"calculate_atr: ATR calculated, last value={df['atr'].iloc[-1] if not df['atr'].empty else 'NaN'}")
#     logger.info(f"ATR calculated, last value={df['atr'].iloc[-1] if not df['atr'].empty else 'NaN'}")
#     return df

# def calculate_supertrend(df, period=10, multiplier=4):
#     if df.empty or len(df) < period:
#         print(f"calculate_supertrend: Insufficient data, {len(df)} rows")
#         logger.warning(f"Insufficient data for Supertrend, {len(df)} rows")
#         return df
#     print(f"calculate_supertrend: Starting with {len(df)} rows, period={period}, multiplier={multiplier}")
#     df = calculate_atr(df, period)
    
#     hl2 = (df['high'] + df['low']) / 2
#     df['basic_upper'] = hl2 + (multiplier * df['atr'])
#     df['basic_lower'] = hl2 - (multiplier * df['atr'])
    
#     df['supertrend'] = 0.0
#     df['supertrend_direction'] = 0
#     df.loc[period, 'supertrend'] = df.loc[period, 'basic_lower']
#     df.loc[period, 'supertrend_direction'] = 1
    
#     for i in range(period + 1, len(df)):
#         if df['close'].iloc[i-1] > df['supertrend'].iloc[i-1]:
#             supertrend_val = min(df['basic_lower'].iloc[i], df['supertrend'].iloc[i-1])
#             df.loc[i, 'supertrend'] = supertrend_val
#             df.loc[i, 'supertrend_direction'] = 1
#         else:
#             supertrend_val = max(df['basic_upper'].iloc[i], df['supertrend'].iloc[i-1])
#             df.loc[i, 'supertrend'] = supertrend_val
#             df.loc[i, 'supertrend_direction'] = -1
    
#     print(f"calculate_supertrend: Supertrend calculated, last value={df['supertrend'].iloc[-1]}, direction={df['supertrend_direction'].iloc[-1]}")
#     logger.info(f"Supertrend calculated: close={df['close'].iloc[-1]}, supertrend={df['supertrend'].iloc[-1]}, direction={df['supertrend_direction'].iloc[-1]}")
#     return df

# def calculate_rsi(df, period=5):
#     if df.empty or len(df) < period:
#         print(f"calculate_rsi: Insufficient data, {len(df)} rows")
#         logger.warning(f"Insufficient data for RSI, {len(df)} rows")
#         return df
#     print(f"calculate_rsi: Starting with {len(df)} rows, period={period}")
#     delta = df['close'].diff()
#     gain = delta.where(delta > 0, 0)
#     loss = -delta.where(delta < 0, 0)
    
#     avg_gain = gain.rolling(window=period).mean()
#     avg_loss = loss.rolling(window=period).mean()
    
#     rs = avg_gain / avg_loss.where(avg_loss != 0, 1e-10)
#     rsi = 100 - (100 / (1 + rs))
#     df['rsi'] = rsi
#     print(f"calculate_rsi: RSI calculated, last value={df['rsi'].iloc[-1] if not df['rsi'].empty else 'NaN'}")
#     logger.info(f"RSI calculated, last value={df['rsi'].iloc[-1] if not df['rsi'].empty else 'NaN'}")
#     return df

# def calculate_moving_averages(df, short_period, long_period):
#     if df.empty or len(df) < long_period:
#         print(f"calculate_moving_averages: Insufficient data, {len(df)} rows, required={long_period}")
#         logger.warning(f"Insufficient data for moving averages, {len(df)} rows, required={long_period}")
#         return df
#     print(f"calculate_moving_averages: Starting with {len(df)} rows, short_period={short_period}, long_period={long_period}")
#     df['short_ma'] = df['close'].rolling(window=short_period).mean()
#     df['long_ma'] = df['close'].rolling(window=long_period).mean()
#     print(f"calculate_moving_averages: Short MA calculated, last value={df['short_ma'].iloc[-1] if not df['short_ma'].empty else 'NaN'}")
#     print(f"calculate_moving_averages: Long MA calculated, last value={df['long_ma'].iloc[-1] if not df['long_ma'].empty else 'NaN'}")
#     logger.info(f"Short MA last value={df['short_ma'].iloc[-1] if not df['short_ma'].empty else 'NaN'}, Long MA last value={df['long_ma'].iloc[-1] if not df['long_ma'].empty else 'NaN'}")
#     return df

# # def generate_signals(df, rsi_oversold=30, rsi_overbought=70):
# #     print("generate_signals: Starting signal generation")
# #     df['ma_signal'] = 0
# #     df['rsi_signal'] = 0
# #     df['supertrend_signal'] = 0
    
# #     df.loc[df['short_ma'] > df['long_ma'], 'ma_signal'] = 1
# #     df.loc[df['short_ma'] < df['long_ma'], 'ma_signal'] = -1
# #     df.loc[df['rsi'] < rsi_oversold, 'rsi_signal'] = 1
# #     df.loc[df['rsi'] > rsi_overbought, 'rsi_signal'] = -1
# #     df.loc[df['supertrend_direction'] == 1, 'supertrend_signal'] = 1
# #     df.loc[df['supertrend_direction'] == -1, 'supertrend_signal'] = -1
    
# #     df['signal'] = 0
# #     df.loc[(df['supertrend_signal'] == 1) & (df['rsi_signal'] != -1), 'signal'] = 1
# #     df.loc[(df['supertrend_signal'] == -1) & (df['rsi_signal'] != 1), 'signal'] = -1
    
# #     if df[['short_ma', 'long_ma', 'rsi', 'supertrend']].iloc[-1].isna().any():
# #         print("generate_signals: NaN values in indicators, setting signal to 0")
# #         logger.warning("NaN values in indicators, setting signal to 0")
# #         df['signal'] = 0
    
# #     print(f"generate_signals: Last signal={df['signal'].iloc[-1]}, ma_signal={df['ma_signal'].iloc[-1]}, rsi_signal={df['rsi_signal'].iloc[-1]}, supertrend_signal={df['supertrend_signal'].iloc[-1]}")
# #     logger.info(f"Signal details: signal={df['signal'].iloc[-1]}, ma_signal={df['ma_signal'].iloc[-1]}, rsi_signal={df['rsi_signal'].iloc[-1]}, supertrend_signal={df['supertrend_signal'].iloc[-1]}")
# #     return df


# def generate_signals(df, rsi_oversold=30, rsi_overbought=70, rsi_period=14, require_ma_confirmation=False):
#     print("generate_signals: Starting signal generation")
#     df['ma_signal'] = 0
#     df['rsi_signal'] = 0
#     df['supertrend_signal'] = 0
    
#     # Moving Average Signal
#     df['ma_signal'] = np.where(df['short_ma'] > df['long_ma'], 1, np.where(df['short_ma'] < df['long_ma'], -1, 0))
    
#     # RSI Signal
#     df['rsi_signal'] = np.where(df['rsi'] < rsi_oversold, 1, np.where(df['rsi'] > rsi_overbought, -1, 0))
    
#     # Supertrend Signal
#     # Only check the latest supertrend_direction for validity
#     latest_direction = df['supertrend_direction'].iloc[-1]
#     if pd.isna(latest_direction) or latest_direction not in [1, -1]:
#         logger.warning(f"Invalid supertrend_direction for latest row: {latest_direction}")
#         df['supertrend_signal'] = 0
#     else:
#         df['supertrend_signal'] = np.where(df['supertrend_direction'] == 1, 1, np.where(df['supertrend_direction'] == -1, -1, 0))
    
#     # Final Signal
#     df['signal'] = 0
#     if require_ma_confirmation:
#         df.loc[(df['supertrend_signal'] == 1) & (df['rsi_signal'] != -1) & (df['ma_signal'] >= 0), 'signal'] = 1
#         df.loc[(df['supertrend_signal'] == -1) & (df['rsi_signal'] != 1) & (df['ma_signal'] <= 0), 'signal'] = -1
#     else:
#         df.loc[(df['supertrend_signal'] == 1) & (df['rsi_signal'] != -1), 'signal'] = 1
#         df.loc[(df['supertrend_signal'] == -1) & (df['rsi_signal'] != 1), 'signal'] = -1
    
#     # NaN Check for Latest Row
#     if df[['short_ma', 'long_ma', 'rsi', 'supertrend']].iloc[-1].isna().any():
#         print("generate_signals: NaN values in indicators, setting latest signal to 0")
#         logger.warning("NaN values in indicators, setting latest signal to 0")
#         df.loc[df.index[-1], 'signal'] = 0
    
#     # Detailed Logging
#     last_row = df.iloc[-1]
#     print(f"generate_signals: Last signal={last_row['signal']}, ma_signal={last_row['ma_signal']}, rsi_signal={last_row['rsi_signal']}, supertrend_signal={last_row['supertrend_signal']}, short_ma={last_row['short_ma']:.2f}, long_ma={last_row['long_ma']:.2f}, rsi={last_row['rsi']:.2f}, supertrend={last_row['supertrend']:.2f}")
#     logger.info(f"Signal details: signal={last_row['signal']}, ma_signal={last_row['ma_signal']}, rsi_signal={last_row['rsi_signal']}, supertrend_signal={last_row['supertrend_signal']}, short_ma={last_row['short_ma']:.2f}, long_ma={last_row['long_ma']:.2f}, rsi={last_row['rsi']:.2f}, supertrend={last_row['supertrend']:.2f}")
    
#     return df
# def place_order(transaction_type, security_id, exchange_segment, quantity, symbol):
#     print(f"===========================place_order: Starting for {transaction_type}, security_id={security_id}, quantity={quantity}, symbol={symbol}")
#     logger.info(f"Placing {transaction_type} order for security_id={security_id}, symbol={symbol}, quantity={quantity}")
#     try:
#         order_type = "MARKET"
#         product_type = "MARGIN" if exchange_segment in ["NSE_FNO", "BSE_FNO"] else "CNC"
#         validity = "DAY"
#         price = 0.0
#         trigger_price = 0.0

#         valid_segments = ["NSE_EQ", "BSE_EQ", "NSE_FNO", "BSE_FNO"]
#         valid_products = ["CNC", "INTRADAY", "MARGIN"]
#         valid_transactions = ["BUY", "SELL"]
#         valid_orders = ["MARKET", "LIMIT", "STOP_LOSS", "STOP_LOSS_MARKET"]
        
#         if exchange_segment not in valid_segments:
#             raise ValueError(f"Invalid exchange_segment: {exchange_segment}. Valid: {valid_segments}")
#         if product_type not in valid_products:
#             raise ValueError(f"Invalid product_type: {product_type}. Valid: {valid_products}")
#         if transaction_type not in valid_transactions:
#             raise ValueError(f"Invalid transaction_type: {transaction_type}. Valid: {valid_transactions}")
#         if order_type not in valid_orders:
#             raise ValueError(f"Invalid order_type: {order_type}. Valid: {valid_orders}")
#         if quantity <= 0:
#             raise ValueError(f"Invalid quantity: {quantity}. Must be greater than 0")
#         if not security_id:
#             raise ValueError("security_id cannot be empty")

#         order_payload = {
#             "transaction_type": transaction_type,
#             "exchange_segment": exchange_segment,
#             "product_type": product_type,
#             "order_type": order_type,
#             "validity": validity,
#             "security_id": str(security_id),
#             "quantity": int(quantity),
#             "disclosed_quantity": 0,
#             "price": price,
#             "trigger_price": trigger_price,
#             "after_market_order": False,
#             "amo_time": "",
#             "bo_profit_value": 0.0
#         }

#         print(f"place_order: Order payload={order_payload}")
#         logger.info(f"Order payload={order_payload}")

#         if is_market_open():
#             try:
#                 order_response = dhan.place_order(**order_payload)
#                 print(f"place_order: Live Order Response={order_response}")
#                 logger.info(f"Live Order Response={order_response}")
#             except Exception as e:
#                 print(f"place_order: Dhan API error: {e}")
#                 logger.error(f"Dhan API error: {e}")
#                 return None

#             if not isinstance(order_response, dict) or "data" not in order_response or "orderId" not in order_response["data"]:
#                 print(f"place_order: Invalid API response: {order_response}")
#                 logger.error(f"Invalid API response: {order_response}")
#                 return None

#             data = order_response.get("data", {})
#             order_id = data.get("orderId")
#             order_status = data.get("orderStatus", "UNKNOWN")
#             order_symbol = symbol

#             if order_status == "TRANSIT":
#                 for attempt in range(3):
#                     print(f"place_order: Polling order status for order_id={order_id}, attempt={attempt+1}")
#                     logger.info(f"Polling order status for order_id={order_id}, attempt={attempt+1}")
#                     status = check_order_status(order_id)
#                     if status in ["EXECUTED", "CONFIRMED", "FILLED", "COMPLETED"]:
#                         try:
#                             save_offline_order(
#                                 order_id=order_id,
#                                 security_id=security_id,
#                                 exchange_segment=exchange_segment,
#                                 transaction_type=transaction_type,
#                                 quantity=quantity,
#                                 order_type=order_type,
#                                 product_type=product_type,
#                                 price=price,
#                                 trigger_price=trigger_price,
#                                 order_symbol=order_symbol,
#                                 status="EXECUTED"
#                             )
#                             print(f"place_order: Order executed and saved, order_id={order_id}")
#                             logger.info(f"Order executed and saved, order_id={order_id}")
#                             return {"orderId": order_id, "orderStatus": "EXECUTED"}
#                         except Exception as e:
#                             print(f"place_order: Database save error: {e}")
#                             logger.error(f"Database save error: {e}")
#                             return None
#                     elif status in ["REJECTED", "CANCELLED"]:
#                         error_desc =order_response.get("data", [{}])[0].get("omsErrorDescription", "No error description")
#                         print(f"place_order: Order {status.lower()}, order_id={order_id}, reason={error_desc}")
#                         logger.error(f"Order {status.lower()}, order_id={order_id}, reason={error_desc}")
#                         return None
#                     time.sleep(2)
#                 print(f"place_order: Order still in TRANSIT after 5 attempts, order_id={order_id}")
#                 logger.error(f"Order still in TRANSIT after 5 attempts, order_id={order_id}")
#                 try:
#                     save_offline_order(
#                         order_id=order_id,
#                         security_id=security_id,
#                         exchange_segment=exchange_segment,
#                         transaction_type=transaction_type,
#                         quantity=quantity,
#                         order_type=order_type,
#                         product_type=product_type,
#                         price=price,
#                         trigger_price=trigger_price,
#                         order_symbol=order_symbol,
#                         status="TRANSIT"
#                     )
#                     print(f"place_order: TRANSIT order saved, order_id={order_id}")
#                     logger.info(f"TRANSIT order saved, order_id={order_id}")
#                     return {"orderId": order_id, "orderStatus": "TRANSIT"}
#                 except Exception as e:
#                     print(f"place_order: Database save error: {e}")
#                     logger.error(f"Database save error: {e}")
#                     return None
#             elif order_status in ["PLACED", "EXECUTED", "CONFIRMED", "FILLED", "COMPLETED"]:
#                 try:
#                     save_offline_order(
#                         order_id=order_id,
#                         security_id=security_id,
#                         exchange_segment=exchange_segment,
#                         transaction_type=transaction_type,
#                         quantity=quantity,
#                         order_type=order_type,
#                         product_type=product_type,
#                         price=price,
#                         trigger_price=trigger_price,
#                         order_symbol=order_symbol,
#                         status="EXECUTED" if order_status in ["EXECUTED", "CONFIRMED", "FILLED", "COMPLETED"] else "PENDING"
#                     )
#                     print(f"place_order: Order saved to database, order_id={order_id}")
#                     logger.info(f"Order saved to database, order_id={order_id}")
#                     return {"orderId": order_id, "orderStatus": order_status}
#                 except Exception as e:
#                     print(f"place_order: Database save error: {e}")
#                     logger.error(f"Database save error: {e}")
#                     return None
#             else:
#                 print(f"place_order: Order failed, response={order_response}")
#                 logger.error(f"Order failed: response={order_response}")
#                 return None
#         else:
#             test_order_id = f"TEST_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"
#             print(f"place_order: Market closed, saving offline order with test_order_id={test_order_id}")
#             logger.info(f"Market closed, saving offline order with test_order_id={test_order_id}")
#             try:
#                 save_offline_order(
#                     order_id=test_order_id,
#                     security_id=security_id,
#                     exchange_segment=exchange_segment,
#                     transaction_type=transaction_type,      
#                     quantity=quantity,
#                     order_type=order_type,
#                     product_type=product_type,
#                     price=price,
#                     trigger_price=trigger_price,
#                     order_symbol=symbol,
#                     status="PENDING"
#                 )
#                 print(f"place_order: Offline order saved, test_order_id={test_order_id}")
#                 logger.info(f"Offline order saved, test_order_id={test_order_id}")
#                 return {"orderId": test_order_id, "orderStatus": "offline"}
#             except Exception as e:
#                 print(f"place_order: Database save error for offline order: {e}")
#                 logger.error(f"Database save error for offline order: {e}")
#                 return None
#     except Exception as e:
#         print(f"place_order: Error placing order: {e}")
#         logger.error(f"Order error: {e}")
#         return None

# async def trading_bot():
#     print("trading_bot: Starting")
#     logger.info("Trading bot started")
#     while bot_running:
#         print("=============================trading_bot: New iteration===========================")
#         try:
#             conn = get_db_connection()
#             cursor = conn.cursor(dictionary=True)
#             cursor.execute("SELECT symbol, security_id, exchange_segment, instrument_type, quantity, rsi_oversold, rsi_overbought, supertrend_period, supertrend_multiplier FROM watchlist")
#             watchlist_data = cursor.fetchall()
#             conn.close()
#             print(f"===========================trading_bot: Watchlist data={watchlist_data}===========================")

#             for item in watchlist_data:
#                 symbol = item['symbol']
#                 security_id = item['security_id']
#                 exchange_segment = item.get('exchange_segment', 'NSE_FNO')
#                 instrument_type = item.get('instrument_type', 'OPTIDX')
#                 quantity = item['quantity']
#                 rsi_oversold = item.get('rsi_oversold', RSI_OVERSOLD)
#                 rsi_overbought = item.get('rsi_overbought', RSI_OVERBOUGHT)
#                 supertrend_period = item.get('supertrend_period', SUPERTREND_PERIOD)
#                 supertrend_multiplier = item.get('supertrend_multiplier', SUPERTREND_MULTIPLIER)
#                 position = positions.get(symbol, {})

#                 print(f"===========================trading_bot: Processing {symbol}, position={position}")
#                 try:
#                     # Check for active BUY order in database
#                     active_order = has_active_order(symbol, "BUY")
#                     if active_order:
#                         if not position or position.get("order_id") != active_order["order_id"]:
#                             positions[symbol] = {
#                                 "order_id": active_order["order_id"],
#                                 "status": active_order["status"],
#                                 "transaction_type": "BUY"
#                             }
#                             print(f"trading_bot: {symbol} - Updated position from database, order_id={active_order['order_id']}, status={active_order['status']}")
#                             logger.info(f"{symbol} - Updated position from database, order_id={active_order['order_id']}, status={active_order['status']}")
#                         if active_order["status"] in ["PENDING", "TRANSIT", "EXECUTED"]:
#                             print(f"trading_bot: {symbol} - Active BUY order exists, order_id={active_order['order_id']}, status={active_order['status']}, skipping BUY")
#                             logger.info(f"{symbol} - Active BUY order exists, order_id={active_order['order_id']}, status={active_order['status']}, skipping BUY")
#                         else:
#                             positions[symbol] = {}
#                             print(f"trading_bot: {symbol} - Cleared position due to non-active status: {active_order['status']}")
#                             logger.info(f"{symbol} - Cleared position due to non-active status: {active_order['status']}")
#                             continue

#                     # Check order status via API if position exists
#                     if position and position.get("order_id") and position.get("status") in ["PENDING", "TRANSIT"]:
#                         current_status = check_order_status(position["order_id"])
#                         if current_status in ["EXECUTED", "CONFIRMED", "FILLED", "COMPLETED"]:
#                             positions[symbol]["status"] = "EXECUTED"
#                             print(f"trading_bot: {symbol} - Order status updated to EXECUTED, order_id={position['order_id']}")
#                             logger.info(f"{symbol} - Order status updated to EXECUTED, order_id={position['order_id']}")
#                         elif current_status in ["REJECTED", "CANCELLED"]:
#                             positions[symbol] = {}
#                             print(f"trading_bot: {symbol} - Order {current_status.lower()}, cleared position, order_id={position['order_id']}")
#                             logger.info(f"{symbol} - Order {current_status.lower()}, cleared position, order_id={position['order_id']}")
#                         else:
#                             print(f"trading_bot: {symbol} - Order in {current_status}, skipping")
#                             logger.info(f"{symbol} - Order in {current_status}, skipping")
#                             continue

#                     from_date = (pd.Timestamp.now() - pd.Timedelta(days=60)).strftime('%Y-%m-%d')
#                     to_date = pd.Timestamp.now().strftime('%Y-%m-%d')
#                     expiry_code = get_expiry_code(symbol, exchange_segment, instrument_type)
#                     df = fetch_historical_data(security_id, exchange_segment, from_date, to_date, instrument_type, expiry_code)
#                     print(f"trading_bot: Fetched data for {symbol}, rows={len(df) if df is not None else 0}")

#                     if df is None or len(df) < MIN_MA_PERIOD:
#                         print(f"trading_bot: Insufficient data for {symbol}, rows={len(df) if df is not None else 0}, minimum required={MIN_MA_PERIOD}")
#                         logger.warning(f"Insufficient data for {symbol}, rows={len(df) if df is not None else 0}, minimum required={MIN_MA_PERIOD}")
#                         continue

#                     adjusted_long_ma_period = min(LONG_MA_PERIOD, max(MIN_MA_PERIOD, len(df)))
#                     if adjusted_long_ma_period < LONG_MA_PERIOD:
#                         print(f"trading_bot: Adjusting LONG_MA_PERIOD from {LONG_MA_PERIOD} to {adjusted_long_ma_period} for {symbol} due to insufficient data")
#                         logger.info(f"Adjusting LONG_MA_PERIOD from {LONG_MA_PERIOD} to {adjusted_long_ma_period} for {symbol}")

#                     df = calculate_moving_averages(df, SHORT_MA_PERIOD, adjusted_long_ma_period)
#                     df = calculate_rsi(df, RSI_PERIOD)
#                     df = calculate_supertrend(df, supertrend_period, supertrend_multiplier)

#                     if df[['short_ma', 'long_ma', 'rsi', 'supertrend']].iloc[-1].isna().any():
#                         print(f"trading_bot: NaN values in indicators for {symbol}, skipping")
#                         logger.warning(f"NaN values in indicators for {symbol}")
#                         continue

#                     df = generate_signals(df, rsi_oversold, rsi_overbought)
#                     latest_signal = df['signal'].iloc[-1]
#                     print(f"trading_bot: {symbol} - signal={latest_signal}, ma_signal={df['ma_signal'].iloc[-1]}, rsi_signal={df['rsi_signal'].iloc[-1]}, supertrend_signal={df['supertrend_signal'].iloc[-1]}")
#                     logger.info(f"{symbol} - signal={latest_signal}")

#                     # Handle BUY order
#                     if latest_signal == 1 and not active_order and not position:
#                         order = place_order(dhan.BUY, security_id, exchange_segment, quantity, symbol)
#                         if order and order.get("orderStatus") in ["PLACED", "EXECUTED", "TRANSIT"]:
#                             positions[symbol] = {
#                                 "order_id": order["orderId"],
#                                 "status": order["orderStatus"],
#                                 "transaction_type": "BUY"
#                             }
#                             print(f"trading_bot: {symbol} - Long position opened, order_id={order['orderId']}")
#                             logger.info(f"{symbol} - Long position opened, order_id={order['orderId']}")
#                         elif order and order.get("orderStatus") == "offline":
#                             print(f"trading_bot: {symbol} - Offline order saved")
#                             logger.info(f"{symbol} - Offline order saved")
#                         else:
#                             print(f"trading_bot: {symbol} - BUY order failed")
#                             logger.error(f"{symbol} - BUY order failed")

#                     # Handle SELL order
#                     elif latest_signal == -1 and position and position.get("status") == "EXECUTED" and position.get("transaction_type") == "BUY":
#                         order = place_order(dhan.SELL, security_id, exchange_segment, quantity, symbol)
#                         if order and order.get("orderStatus") in ["PLACED", "EXECUTED", "TRANSIT"]:
#                             positions[symbol] = {}
#                             print(f"trading_bot: {symbol} - Position closed, order_id={order['orderId']}")
#                             logger.info(f"{symbol} - Position closed, order_id={order['orderId']}")
#                         elif order and order.get("orderStatus") == "offline":
#                             print(f"trading_bot: {symbol} - Offline SELL order saved")
#                             logger.info(f"{symbol} - Offline SELL order saved")
#                         else:
#                             print(f"trading_bot: {symbol} - SELL order failed")
#                             logger.error(f"{symbol} - SELL order failed")
#                     else:
#                         print(f"trading_bot: {symbol} - No action")
#                         logger.info(f"{symbol} - No action")
#                 except Exception as e:
#                     print(f"trading_bot: Error for {symbol}: {e}")
#                     logger.error(f"Error for {symbol}: {e}")
#         except Exception as e:
#             print(f"trading_bot: Error fetching watchlist: {e}")
#             logger.error(f"Error fetching watchlist: {e}")
        
#         print(f"===========================trading_bot: Waiting {INTERVAL} seconds===========================")
#         await asyncio.sleep(INTERVAL)

# @trading_bot_bp.route('/trading_bot/watchlist/add', methods=['POST'])
# def add_to_watchlist():
#     print("API /watchlist/add: Request received")
#     data = request.get_json(silent=True)
#     if not data or 'symbol' not in data or 'security_id' not in data or 'quantity' not in data:
#         print("API /watchlist/add: Missing required fields")
#         logger.warning("Missing required fields in /watchlist/add")
#         return jsonify({"status": "error", "message": "Symbol, security_id, and quantity required"}), 400
    
#     symbol = data['symbol'].upper()
#     quantity = int(data['quantity'])
#     if quantity <= 0:
#         print("API /watchlist/add: Quantity must be positive")
#         logger.warning("Quantity must be positive in /watchlist/add")
#         return jsonify({" status": "error", "message": "Quantity must be positive"}), 400
    
#     conn = get_db_connection()
#     cursor = conn.cursor()
#     try:
#         cursor.execute("SELECT 1 FROM watchlist WHERE symbol = %s", (symbol,))
#         if cursor.fetchone():
#             print(f"API /watchlist/add: {symbol} already in watchlist")
#             logger.warning(f"{symbol} already in watchlist")
#             return jsonify({"status": "error", "message": f"{symbol} already in watchlist"}), 400
        
#         security_id = data['security_id']
#         exchange_segment = data.get('exchange_segment', 'NSE_FNO')

#         if 'instrument_type' in data:
#             instrument_type = data['instrument_type']
#         else:
#             if exchange_segment == 'NSE_EQ':
#                 instrument_type = 'EQUITY'
#             else:
#                 instrument_type = 'OPTIDX'

#         rsi_oversold = data.get('rsi_oversold', RSI_OVERSOLD)
#         rsi_overbought = data.get('rsi_overbought', RSI_OVERBOUGHT)
#         supertrend_period = data.get('supertrend_period', SUPERTREND_PERIOD)
#         supertrend_multiplier = data.get('supertrend_multiplier', SUPERTREND_MULTIPLIER)

#         logger.warning(f"API /watchlist/add: Skipping security_id validation for {security_id}. Replace with actual validation.")

#         cursor.execute(
#             """INSERT INTO watchlist (symbol, security_id, quantity, exchange_segment, instrument_type, rsi_oversold, rsi_overbought, supertrend_period, supertrend_multiplier)
#                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
#             (symbol, security_id, quantity, exchange_segment, instrument_type, rsi_oversold, rsi_overbought, supertrend_period, supertrend_multiplier)
#         )
#         conn.commit()
#         print(f"API /watchlist/add: Added {symbol}")
#         logger.info(f"Added to watchlist: {symbol}")
#         return jsonify({"status": "success", "message": f"{symbol} added to watchlist"})
#     except Exception as e:
#         conn.rollback()
#         print(f"API /watchlist/add: Error: {e}")
#         logger.error(f"Error adding to watchlist: {e}")
#         return jsonify({"status": "error", "message": "Failed to add to watchlist"}), 500
#     finally:
#         conn.close()

# @trading_bot_bp.route('/trading_bot/watchlist/remove', methods=['POST'])
# def remove_from_watchlist():
#     print("API /watchlist/remove: Request received")
#     data = request.get_json(silent=True)
#     if not data or 'symbol' not in data:
#         print("API /watchlist/remove: Missing symbol")
#         logger.warning("Missing symbol in /watchlist/remove")
#         return jsonify({"status": "error", "message": "Symbol required"}), 400
    
#     symbol = data['symbol'].upper()
#     conn = get_db_connection()
#     cursor = conn.cursor()
#     try:
#         cursor.execute("DELETE FROM watchlist WHERE symbol = %s", (symbol,))
#         if cursor.rowcount > 0:
#             conn.commit()
#             positions.pop(symbol, None)
#             print(f"API /watchlist/remove: Removed {symbol}")
#             logger.info(f"Removed from watchlist: {symbol}")
#             return jsonify({"status": "success", "message": f"{symbol} removed from watchlist"})
#         print(f"API /watchlist/remove: {symbol} not found")
#         logger.warning(f"{symbol} not found in watchlist")
#         return jsonify({"status": "error", "message": f"{symbol} not in watchlist"}), 400
#     except Exception as e:
#         conn.rollback()
#         print(f"API /watchlist/remove: Error: {e}")
#         logger.error(f"Error removing from watchlist: {e}")
#         return jsonify({"status": "error", "message": "Failed to remove from watchlist"}), 500
#     finally:
#         conn.close()

# @trading_bot_bp.route('/trading_bot/watchlist', methods=['GET'])
# def get_watchlist():
#     print("API /watchlist: Request received")
#     conn = get_db_connection()
#     cursor = conn.cursor(dictionary=True)
#     try:
#         cursor.execute("SELECT * FROM watchlist")
#         watchlist_data = cursor.fetchall()
#         print("API /watchlist: Fetched watchlist data")
#         logger.info("Fetched watchlist data")
#         return jsonify({"status": "success", "data": watchlist_data})
#     except Exception as e:
#         print(f"API /watchlist: Error: {e}")
#         logger.error(f"Error fetching watchlist: {e}")
#         return jsonify({"status": "error", "message": "Failed to fetch watchlist"}), 500
#     finally:
#         conn.close()

# @trading_bot_bp.route('/trading_bot/start', methods=['POST'])
# def start_bot():
#     global bot_running, loop, task
#     print("API /start: Request received")
#     if bot_running:
#         print("API /start: Bot already running")
#         logger.warning("Bot already running")
#         return jsonify({"status": "error", "message": "Bot is already running"}), 400
    
#     conn = get_db_connection()
#     cursor = conn.cursor()
#     cursor.execute("SELECT COUNT(*) as count FROM watchlist")
#     count = cursor.fetchone()[0]
#     conn.close()
#     if count == 0:
#         print("API /start: Watchlist is empty")
#         logger.warning("Watchlist is empty")
#         return jsonify({"status": "error", "message": "Watchlist is empty"}), 400
    
#     try:
#         data = request.get_json(silent=True) or {}
#         print("API /start: Using per-symbol settings from watchlist")
#         logger.info("Starting bot with per-symbol settings")
#     except Exception as e:
#         print(f"API /start: Invalid JSON or content type, using defaults. Error: {e}")
#         logger.warning(f"Invalid JSON or content type in /start: {e}")
    
#     bot_running = True
#     loop = asyncio.new_event_loop()
#     asyncio.set_event_loop(loop)
#     task = loop.create_task(trading_bot())
#     threading.Thread(target=loop.run_forever, daemon=True).start()
#     print("API /start: Bot started")
#     logger.info("Bot started")
#     return jsonify({"status": "success", "message": "Bot started"})

# @trading_bot_bp.route('/trading_bot/stop', methods=['POST'])
# def stop_bot():
#     global bot_running, loop, task
#     print("API /stop: Request received")
#     if not bot_running:
#         print("API /stop: Bot not running")
#         logger.warning("Bot not running")
#         return jsonify({"status": "error", "message": "Bot not running"}), 400
#     bot_running = False
#     if task:
#         task.cancel()
#     if loop:
#         loop.call_soon_threadsafe(loop.stop)
#         loop.run_until_complete(loop.shutdown_asyncgens())
#         loop.close()
#     print("API /stop: Bot stopped")
#     logger.info("Bot stopped")
#     return jsonify({"status": "success", "message": "Bot stopped"})

# @trading_bot_bp.route('/trading_bot/status', methods=['GET'])
# def get_status():
#     print("API /status: Request received")
#     conn = get_db_connection()
#     cursor = conn.cursor(dictionary=True)
#     try:
#         cursor.execute("SELECT symbol FROM watchlist")
#         watchlist_symbols = [row['symbol'] for row in cursor.fetchall()]
#         status = {
#             "bot_running": bot_running,
#             "positions": {symbol: pos if pos else "none" for symbol, pos in positions.items()},
#             "watchlist": watchlist_symbols,
#             "parameters": {
#                 "rsi_oversold": RSI_OVERSOLD,
#                 "rsi_overbought": RSI_OVERBOUGHT,
#                 "supertrend_period": SUPERTREND_PERIOD,
#                 "supertrend_multiplier": SUPERTREND_MULTIPLIER
#             }
#         }
#         print(f"API /status: Returning status")
#         logger.info(f"Status: {status}")
#         return jsonify({"status": "success", "data": status})
#     except Exception as e:
#         print(f"API /status: Error: {e}")
#         logger.error(f"Error fetching status: {e}")
#         return jsonify({"status": "error", "message": "Failed to fetch status"}), 500
#     finally:
#         conn.close()

# @trading_bot_bp.route('/trading_bot/trade', methods=['POST'])
# def manual_trade():
#     print("API /trade: Request received")
#     data = request.get_json()
#     if not data or 'action' not in data or 'symbol' not in data:
#         print("API /trade: Missing action or symbol")
#         logger.warning("Missing action or symbol in /trade")
#         return jsonify({"status": "error", "message": "Action and symbol required"}), 400
#     action = data['action'].upper()
#     symbol = data['symbol'].upper()
#     if action not in ['BUY', 'SELL']:
#         print(f"API /trade: Invalid action={action}")
#         logger.warning(f"Invalid action={action} in /trade")
#         return jsonify({"status": "error", "message": "Action must be 'buy' or 'sell'"}), 400
    
#     conn = get_db_connection()
#     cursor = conn.cursor(dictionary=True)
#     try:
#         cursor.execute("SELECT security_id, exchange_segment, quantity, instrument_type FROM watchlist WHERE symbol = %s", (symbol,))
#         watchlist_item = cursor.fetchone()
#         if not watchlist_item:
#             print(f"API /trade: {symbol} not in watchlist")
#             logger.warning(f"{symbol} not in watchlist")
#             return jsonify({"status": "error", "message": f"{symbol} not in watchlist"}), 400
        
#         active_order = has_active_order(symbol, "BUY")
#         position = positions.get(symbol, {})
#         if action == "BUY" and (active_order or position):
#             print(f"API /trade: Active BUY order or position exists for {symbol}")
#             logger.warning(f"Active BUY order or position exists for {symbol} in /trade")
#             return jsonify({"status": "error", "message": f"Active BUY order or position exists for {symbol}"}), 400
#         if action == "SELL" and not (active_order or position):
#             print(f"API /trade: No position to sell for {symbol}")
#             logger.warning(f"No position to sell for {symbol} in /trade")
#             return jsonify({"status": "error", "message": f"No position to sell for {symbol}"}), 400

#         order = place_order(
#             dhan.BUY if action == 'BUY' else dhan.SELL,
#             watchlist_item['security_id'],
#             watchlist_item['exchange_segment'] or 'NSE_FNO',
#             watchlist_item['quantity'],
#             symbol
#         )
#         if order and order.get("orderStatus") in ["PLACED", "EXECUTED", "TRANSIT"]:
#             if action == "BUY":
#                 positions[symbol] = {
#                     "order_id": order["orderId"],
#                     "status": order["orderStatus"],
#                     "transaction_type": "BUY"
#                 }
#             else:
#                 positions[symbol] = {}
#             print(f"API /trade: Order placed, order_id={order['orderId']}")
#             logger.info(f"Order placed for {symbol}: {action}, order_id={order['orderId']}")
#             return jsonify({"status": "success", "order_id": order["orderId"], "order_status": order["orderStatus"]})
#         elif order and order.get("orderStatus") == "offline":
#             print("API /trade: Offline order saved")
#             logger.info(f"Offline order saved for {symbol}: {action}")
#             return jsonify({"status": "offline", "order_id": order["orderId"], "message": "Market closed, order saved"})
#         print("API /trade: Order failed")
#         logger.error(f"Order failed for {symbol}: {action}")
#         return jsonify({"status": "error", "message": "Failed to place order"}), 500
#     except Exception as e:
#         print(f"API /trade: Error: {e}")
#         logger.error(f"Error placing trade: {e}")
#         return jsonify({"status": "error", "message": "Failed to place trade"}), 500
#     finally:
#         conn.close()

# @trading_bot_bp.route('/trading_bot/force_signal', methods=['POST'])
# def force_signal():
#     print("API /force_signal: Request received")
#     data = request.get_json(silent=True) or {}
#     signal_type = data.get('signal', '').upper()
#     symbol = data.get('symbol', '').upper()
#     if signal_type not in ['BUY', 'SELL'] or not symbol:
#         print("API /force_signal: Invalid signal or symbol")
#         logger.warning("Invalid signal or symbol in /force_signal")
#         return jsonify({"status": "error", "message": "Signal (buy/sell) and symbol required"}), 400
    
#     conn = get_db_connection()
#     cursor = conn.cursor(dictionary=True)
#     try:
#         cursor.execute("SELECT security_id, exchange_segment, quantity, instrument_type FROM watchlist WHERE symbol = %s", (symbol,))
#         watchlist_item = cursor.fetchone()
#         if not watchlist_item:
#             print(f"API /force_signal: {symbol} not in watchlist")
#             logger.warning(f"{symbol} not in watchlist")
#             return jsonify({"status": "error", "message": f"{symbol} not in watchlist"}), 400
        
#         active_order = has_active_order(symbol, "BUY")
#         position = positions.get(symbol, {})
#         if signal_type == 'BUY' and (active_order or position):
#             print(f"API /force_signal: Active BUY order or position exists for {symbol}")
#             logger.warning(f"Active BUY order or position exists for {symbol} in /force_signal")
#             return jsonify({"status": "error", "message": f"Active BUY order or position exists for {symbol}"}), 400
#         if signal_type == 'SELL' and not (active_order or position):
#             print(f"API /force_signal: No position to sell for {symbol}")
#             logger.warning(f"No position to sell for {symbol} in /force_signal")
#             return jsonify({"status": "error", "message": f"No position to sell for {symbol}"}), 400

#         order = place_order(
#             dhan.BUY if signal_type == 'BUY' else dhan.SELL,
#             watchlist_item['security_id'],
#             watchlist_item['exchange_segment'] or 'NSE_FNO',
#             watchlist_item['quantity'],
#             symbol
#         )
#         if order and order.get("orderStatus") in ["PLACED", "EXECUTED", "TRANSIT"]:
#             if signal_type == "BUY":
#                 positions[symbol] = {
#                     "order_id": order["orderId"],
#                     "status": order["orderStatus"],
#                     "transaction_type": "BUY"
#                 }
#             else:
#                 positions[symbol] = {}
#             print(f"API /force_signal: Forced {signal_type} for {symbol}, order_id={order['orderId']}")
#             logger.info(f"Forced {signal_type} for {symbol}, order_id={order['orderId']}")
#             return jsonify({"status": "success", "order_id": order["orderId"], "order_status": order["orderStatus"]})
#         elif order and order.get("orderStatus") == "offline":
#             print(f"API /force_signal: Offline {signal_type} order saved for {symbol}")
#             logger.info(f"Offline {signal_type} order saved for {symbol}")
#             return jsonify({"status": "offline", "order_id": order["orderId"], "message": "Market closed, order saved"})
#         print(f"API /force_signal: Failed to place {signal_type} order for {symbol}")
#         logger.error(f"Failed to place {signal_type} order for {symbol}")
#         return jsonify({"status": "error", "message": "Failed to force signal"}), 500
#     except Exception as e:
#         print(f"API /force_signal: Error: {e}")
#         logger.error(f"Error forcing signal: {e}")
#         return jsonify({"status": "error", "message": "Failed to force signal"}), 500
#     finally:
#         conn.close()

# @trading_bot_bp.route('/trading_bot/reset_position', methods=['POST'])
# def reset_position():
#     print("API /reset_position: Request received")
#     data = request.get_json(silent=True) or {}
#     symbol = data.get('symbol', '').upper()
#     if symbol:
#         conn = get_db_connection()
#         cursor = conn.cursor()
#         try:
#             cursor.execute("SELECT 1 FROM watchlist WHERE symbol = %s", (symbol,))
#             if cursor.fetchone():
#                 positions[symbol] = {}
#                 print(f"API /reset_position: Position reset for {symbol}")
#                 logger.info(f"Position reset for {symbol}")
#                 return jsonify({"status": "success", "message": f"Position reset for {symbol}"})
#             print(f"API /reset_position: {symbol} not found")
#             logger.warning(f"{symbol} not found in watchlist")
#             return jsonify({"status": "error", "message": f"{symbol} not found"}), 400
#         except Exception as e:
#             print(f"API /reset_position: Error: {e}")
#             logger.error(f"Error resetting position: {e}")
#             return jsonify({"status": "error", "message": "Failed to reset position"}), 500
#         finally:
#             conn.close()
#     positions.clear()
#     print("API /reset_position: All positions reset")
#     logger.info("All positions reset")
#     return jsonify({"status": "success", "message": "All positions reset"})


















from flask import Flask, jsonify, request, Blueprint
import asyncio
import pandas as pd
from dhanhq import dhanhq
import numpy as np
import talib  
import time
import threading
import logging
import json
import requests
import datetime
from flask_cors import CORS
from config import client_id, access_token
from db import save_offline_order, get_db_connection

print("Starting script: Importing modules completed")

# Initialize Blueprint
trading_bot_bp = Blueprint('trading_bot', __name__)
print("Blueprint initialized: trading_bot")

# Set up logging
logging.basicConfig(level=logging.INFO, filename="trade_bot.log", format="%(asctime)s %(message)s")
logger = logging.getLogger(__name__)
print("Logging configured: trade_bot.log")

# Flask app
app = Flask(__name__)
CORS(app)
print("Flask app initialized")

# Initialize Dhan API client
dhan = dhanhq(client_id, access_token)
print("Dhan API client initialized")

# Trading parameters (defaults)
SHORT_MA_PERIOD = 20  # Updated for ADX strategy
LONG_MA_PERIOD = 50   # Updated for ADX strategy
ADX_PERIOD = 14
ADX_THRESHOLD = 25
ATR_PERIOD = 14
INTERVAL = 60
MIN_MA_PERIOD = 50  # Updated to match 50 MA requirement
print(f"Default trading parameters set: INTERVAL={INTERVAL}s, ADX_PERIOD={ADX_PERIOD}, ADX_THRESHOLD={ADX_THRESHOLD}, ATR_PERIOD={ATR_PERIOD}")

# Global state
bot_running = False
positions = {}  # {symbol: {"order_id": str, "status": str, "transaction_type": str}}
loop = None
task = None
print("Global state initialized: bot_running=False, positions={}")

def is_market_open():
    now = datetime.datetime.now()
    is_weekday = now.weekday() < 5
    market_open = datetime.time(9, 15) <= now.time() <= datetime.time(15, 30)
    return is_weekday and market_open

def get_security_id(symbol, exchange_segment='NSE_FNO', instrument_type="OPTIDX"):
    print(f"get_security_id: Fetching security_id for {symbol}")
    logger.info(f"Fetching security_id for {symbol}")
    try:
        logger.warning(f"get_security_id: Using placeholder logic for {symbol}. Replace with actual API call.")
        return None
    except Exception as e:
        print(f"get_security_id: Error fetching security_id: {e}")
        logger.error(f"Error fetching security_id: {e}")
        return None

def get_expiry_code(symbol, exchange_segment='NSE_FNO', instrument_type="OPTIDX"):
    print(f"get_expiry_code: Fetching expiry_code for {symbol}")
    logger.info(f"Fetching expiry_code for {symbol}")
    try:
        if instrument_type == 'EQUITY':
            logger.info(f"No expiry code required for EQUITY: {symbol}")
            return None
        parts = symbol.split('-')
        if len(parts) >= 4:
            expiry_date = parts[1]
            logger.warning(f"get_expiry_code: Parsed expiry_date={expiry_date} for {symbol}, defaulting to expiry_code=1. Verify with Dhan API.")
            return 1
        logger.warning(f"get_expiry_code: Could not parse expiry from {symbol}, defaulting to 1. Verify with Dhan API.")
        return 1
    except Exception as e:
        print(f"get_expiry_code: Error fetching expiry_code: {e}")
        logger.error(f"Error fetching expiry_code: {e}")
        return 1

def has_active_order(symbol, transaction_type="BUY"):
    print(f"has_active_order: Checking for active {transaction_type} order for {symbol}")
    logger.info(f"Checking for active {transaction_type} order for {symbol}")
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT order_id, status FROM offline_order WHERE order_symbol = %s AND transaction_type = %s AND status IN ('PENDING', 'TRANSIT', 'EXECUTED')",
            (symbol, transaction_type)
        )
        result = cursor.fetchone()
        conn.close()
        if result:
            print(f"has_active_order: Found active order for {symbol}, order_id={result[0]}, status={result[1]}")
            logger.info(f"Found active {transaction_type} order for {symbol}, order_id={result[0]}, status={result[1]}")
            return {"order_id": result[0], "status": result[1]}
        print(f"has_active_order: No active {transaction_type} order for {symbol}")
        logger.info(f"No active {transaction_type} order for {symbol}")
        return None
    except Exception as e:
        print(f"has_active_order: Error checking active order: {e}")
        logger.error(f"Error checking active order for {symbol}: {e}")
        return None

def check_order_status(order_id):
    print(f"check_order_status: Checking status for order_id={order_id}")
    logger.info(f"Checking status for order_id={order_id}")
    try:
        headers = {"Authorization": f"Bearer {dhan.access_token}"}
        response = requests.get(f"https://api.dhan.co/v2/orders/{order_id}", headers=headers).json()
        print(f"check_order_status: Response={response}")
        logger.info(f"Order status response: {response}")
        if not isinstance(response, dict) or "data" not in response or not isinstance(response["data"], list) or not response["data"]:
            print(f"check_order_status: Invalid response: {response}")
            logger.error(f"Invalid order status response: {response}")
            return "UNKNOWN"
        status_data = response["data"][0]
        status = status_data.get("orderStatus", "UNKNOWN")
        return status
    except Exception as e:
        print(f"check_order_status: Error checking status: {e}")
        logger.error(f"Error checking order status: {e}")
        return "UNKNOWN"

def fetch_historical_data(security_id, exchange_segment, from_date, to_date, instrument_type, symbol, expiry_code=0, interval=5, days=90, max_retries=3):
 
    print(f"fetch_historical_data: Starting for security_id={security_id}, symbol={symbol}, from={from_date}, to={to_date}, instrument_type={instrument_type}, interval={interval}")
    logger.info(f"Fetching intraday data for security_id={security_id}, symbol={symbol}, interval={interval}")
    
    for attempt in range(1, max_retries + 1):
        try:
            # Convert dates to string format if datetime
            if isinstance(from_date, datetime.datetime):
                from_date = from_date.strftime('%Y-%m-%d')
            if isinstance(to_date, datetime.datetime):
                to_date = to_date.strftime('%Y-%m-%d')
            
            # Set date range (intraday typically limited to recent days)
            to_date_dt = datetime.datetime.now()
            from_date_dt = to_date_dt - datetime.timedelta(days=days)
            from_date = from_date_dt.strftime('%Y-%m-%d')
            to_date = to_date_dt.strftime('%Y-%m-%d')
            print(f"fetch_historical_data: Date range from={from_date}, to={to_date}")

            # API parameters
            params = {
                'security_id': security_id,
                'exchange_segment': exchange_segment,
                'instrument_type': instrument_type,
                'from_date': from_date,
                'to_date': to_date,
                'interval': interval
            }
            # if instrument_type != 'EQUITY':
            #     params['expiry_code'] = expiry_code

            # Fetch intraday minute data
            data = dhan.intraday_minute_data(**params)

            if data and 'status' in data and data['status'] == 'success' and 'data' in data:
                data_inner = data['data']
                if isinstance(data_inner, dict) and all(key in data_inner for key in ['open', 'high', 'low', 'close', 'volume', 'timestamp']):
                    if len(data_inner['close']) > 0:
                        df = pd.DataFrame({
                            "date": pd.to_datetime(data_inner["timestamp"], unit="s").tz_localize("UTC").tz_convert("Asia/Kolkata"),
                            'timestamp': data_inner['timestamp'],
                            'open': data_inner['open'],
                            'high': data_inner['high'],
                            'low': data_inner['low'],
                            'close': data_inner['close'],
                            'volume': data_inner['volume'],
                            'symbol': symbol
                        })
                        df = df.dropna(subset=['close'])
                        if df['close'].isnull().any():
                            print("fetch_historical_data: NaN values in 'close' column")
                            logger.warning("NaN values in 'close' column")
                            return None
                        df['close'] = df['close'].astype(float)
                        df['high'] = df['high'].astype(float)
                        df['low'] = df['low'].astype(float)
                        df['volume'] = df['volume'].astype(int)
                        print(f"fetch_historical_data: DataFrame created with {len(df)} rows")
                        logger.info(f"DataFrame created with {len(df)} rows")
                        
                        print("\nfetch_historical_data: Intraday Data Summary========================")
                        print(f"Security ID: {security_id}, Symbol: {symbol}, Instrument: {instrument_type}")
                        print(f"Date Range: {df['date'].min().strftime('%Y-%m-%d %H:%M')} to {df['date'].max().strftime('%Y-%m-%d %H:%M')}")
                        print(f"Total Rows: {len(df)}")
                        print(f"Latest Close Price: {df['close'].iloc[-1]:.2f}")
                        print("\nRecent Data (last 20 rows):")
                        display_df = df[['date', 'open', 'high', 'low', 'close', 'volume']].tail(20).copy()
                        display_df['date'] = display_df['date'].dt.strftime('%Y-%m-%d %H:%M')
                        print(display_df.to_string(index=False, float_format='%.2f'))
                        print("\n")
                        
                        return df
                    else:
                        print(f"fetch_historical_data: Empty data lists, attempt {attempt}/{max_retries}")
                        logger.warning(f"Empty data lists: {data.get('remarks', 'No remarks')}")
                elif isinstance(data_inner, list) and all(isinstance(item, dict) for item in data_inner):
                    df = pd.DataFrame(data_inner)
                    if all(key in df.columns for key in ['timestamp', 'open', 'high', 'low', 'close', 'volume']):
                        df['date'] = pd.to_datetime(df['timestamp'], unit='s').tz_localize('UTC').tz_convert('Asia/Kolkata')
                        df['symbol'] = symbol
                        df = df[['date', 'timestamp', 'open', 'high', 'low', 'close', 'volume', 'symbol']]
                        df = df.dropna(subset=['close'])
                        df['close'] = df['close'].astype(float)
                        df['high'] = df['high'].astype(float)
                        df['low'] = df['low'].astype(float)
                        df['volume'] = df['volume'].astype(int)
                        print(f"fetch_historical_data: DataFrame created with {len(df)} rows (list format)")
                        logger.info(f"DataFrame created with {len(df)} rows (list format)")
                        
                        print("\nfetch_historical_data: Intraday Data Summary=========================")
                        print(f"Security ID: {security_id}, Symbol: {symbol}, Instrument: {instrument_type}")
                        print(f"Date Range: {df['date'].min().strftime('%Y-%m-%d %H:%M')} to {df['date'].max().strftime('%Y-%m-%d %H:%M')}")
                        print(f"Total Rows: {len(df)}")
                        print(f"Latest Close Price: {df['close'].iloc[-1]:.2f}")
                        print("\nRecent Data (last 20 rows):")
                        display_df = df[['date', 'open', 'high', 'low', 'close', 'volume']].tail(20).copy()
                        display_df['date'] = display_df['date'].dt.strftime('%Y-%m-%d %H:%M')
                        print(display_df.to_string(index=False, float_format='%.2f'))
                        print("\n")
                        
                        return df
                    else:
                        print(f"fetch_historical_data: Invalid list data format, attempt {attempt}/{max_retries}")
                        logger.warning(f"Invalid list data format: {data.get('remarks', 'No remarks')}")
                else:
                    print(f"fetch_historical_data: Invalid data format, attempt {attempt}/{max_retries}")
                    logger.warning(f"Invalid data format: {data.get('remarks', 'No remarks')}")
            else:
                print(f"fetch_historical_data: Invalid response format, attempt {attempt}/{max_retries}, response={data}")
                logger.warning(f"Invalid response format: {data.get('remarks', 'No remarks')}")
        except Exception as e:
            print(f"fetch_historical_data: Error on attempt {attempt}/{max_retries}: {e}")
            logger.error(f"Error on attempt {attempt}/{max_retries}: {e}")
        if attempt < max_retries:
            sleep_time = 5 * (2 ** (attempt - 1))
            print(f"fetch_historical_data: Retrying in {sleep_time} seconds...")
            time.sleep(sleep_time)
    print("fetch_historical_data: Failed after all retries")
    logger.error("Failed to fetch intraday data after all retries")
    return None

def calculate_atr(df, period=6):  # Updated period to 6 for ADX strategy
    if df.empty or len(df) < period:
        print(f"calculate_atr: Insufficient data, {len(df)} rows")
        logger.warning(f"Insufficient data for ATR, {len(df)} rows")
        return df
    print(f"calculate_atr: Starting with {len(df)} rows, period={period}")
    high_low = df['high'] - df['low']
    high_close = np.abs(df['high'] - df['close'].shift())
    low_close = np.abs(df['low'] - df['close'].shift())
    true_range = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)
    atr = true_range.rolling(window=period).mean()
    df['atr'] = atr
    df['hatr'] = atr / 2  # Add hATR calculation
    print(f"calculate_atr: ATR calculated, last value={df['atr'].iloc[-1] if not df['atr'].empty else 'NaN'}, hATR={df['hatr'].iloc[-1] if not df['hatr'].empty else 'NaN'}")
    logger.info(f"ATR calculated, last value={df['atr'].iloc[-1] if not df['atr'].empty else 'NaN'}, hATR={df['hatr'].iloc[-1] if not df['hatr'].empty else 'NaN'}")
    return df

def calculate_moving_averages(df, short_period, long_period):
    if df.empty or len(df) < long_period:
        print(f"calculate_moving_averages: Insufficient data, {len(df)} rows, required={long_period}")
        logger.warning(f"Insufficient data for moving averages, {len(df)} rows, required={long_period}")
        return df
    print(f"calculate_moving_averages: Starting with {len(df)} rows, short_period={short_period}, long_period={long_period}")
    df['short_ma'] = df['close'].rolling(window=short_period).mean()
    df['long_ma'] = df['close'].rolling(window=long_period).mean()
    print(f"calculate_moving_averages: Short MA calculated, last value={df['short_ma'].iloc[-1] if not df['short_ma'].empty else 'NaN'}")
    print(f"calculate_moving_averages: Long MA calculated, last value={df['long_ma'].iloc[-1] if not df['long_ma'].empty else 'NaN'}")
    logger.info(f"Short MA last value={df['short_ma'].iloc[-1] if not df['short_ma'].empty else 'NaN'}, Long MA last value={df['long_ma'].iloc[-1] if not df['long_ma'].empty else 'NaN'}")
    return df

def calculate_adx(df, period=14):
    if df.empty or len(df) < period:
        print(f"calculate_adx: Insufficient data, {len(df)} rows")
        logger.warning(f"Insufficient data for ADX, {len(df)} rows")
        return df
    print(f"calculate_adx: Starting with {len(df)} rows, period={period}")
    df['adx'] = talib.ADX(df['high'], df['low'], df['close'], timeperiod=period)
    df['plus_di'] = talib.PLUS_DI(df['high'], df['low'], df['close'], timeperiod=period)
    df['minus_di'] = talib.MINUS_DI(df['high'], df['low'], df['close'], timeperiod=period)
    print(f"calculate_adx: ADX calculated, last value={df['adx'].iloc[-1] if not df['adx'].empty else 'NaN'}")
    logger.info(f"ADX calculated, last value={df['adx'].iloc[-1] if not df['adx'].empty else 'NaN'}")
    return df

def generate_signals(df, adx_threshold=25):
    print("generate_signals: Starting ADX signal generation")
    logger.info("Starting ADX signal generation")
    
    df['adx_signal'] = 0
    df['unit'] = 0
    df['sl'] = np.nan
    df['signal'] = 0
    
    position = None
    first_unit_price = None
    sl = None
    
    for i in range(1, len(df)):
        curr = df.iloc[i]
        prev = df.iloc[i-1]
        
        if any(pd.isna(x) for x in [curr['adx'], curr['short_ma'], curr['long_ma'], curr['atr'], curr['plus_di'], curr['minus_di']]):
            continue
        
        # Golden Cross
        if curr['adx'] > adx_threshold and prev['short_ma'] <= prev['long_ma'] and curr['short_ma'] > curr['long_ma'] and curr['plus_di'] > curr['minus_di']:
            if position != 'long':
                position = 'long'
                sl = curr['long_ma'] - curr['hatr']
                df.loc[df.index[i], 'adx_signal'] = 1
                df.loc[df.index[i], 'sl'] = sl
                print(f"generate_signals: Golden Cross at {curr['date']}, ADX={curr['adx']:.2f}, SL={sl:.2f}")
                logger.info(f"Golden Cross at {curr['date']}, ADX={curr['adx']:.2f}, SL={sl:.2f}")
        
        # Death Cross
        elif curr['adx'] > adx_threshold and prev['short_ma'] >= prev['long_ma'] and curr['short_ma'] < curr['long_ma'] and curr['minus_di'] > curr['plus_di']:
            if position != 'short':
                position = 'short'
                sl = curr['long_ma'] + curr['hatr']
                df.loc[df.index[i], 'adx_signal'] = -1
                df.loc[df.index[i], 'sl'] = sl
                print(f"generate_signals: Death Cross at {curr['date']}, ADX={curr['adx']:.2f}, SL={sl:.2f}")
                logger.info(f"Death Cross at {curr['date']}, ADX={curr['adx']:.2f}, SL={sl:.2f}")
        
        # Entry logic for long positions
        if position == 'long':
            # 1st Unit: Price within 5% of 20 MA
            if not first_unit_price and abs(curr['close'] - curr['short_ma']) <= curr['short_ma'] * 0.05:
                first_unit_price = curr['close']
                df.loc[df.index[i], 'unit'] = 1
                df.loc[df.index[i], 'signal'] = 1
                df.loc[df.index[i], 'sl'] = sl
                print(f"generate_signals: Buy 1st unit at {curr['date']}, price={curr['close']:.2f}, SL={sl:.2f}")
                logger.info(f"Buy 1st unit at {curr['date']}, price={curr['close']:.2f}, SL={sl:.2f}")
            # 2nd Unit: Price within 5% of 50 MA
            elif first_unit_price and abs(curr['close'] - curr['long_ma']) <= curr['long_ma'] * 0.05:
                df.loc[df.index[i], 'unit'] = 2
                df.loc[df.index[i], 'signal'] = 2
                df.loc[df.index[i], 'sl'] = sl
                print(f"generate_signals: Buy 2nd unit at {curr['date']}, price={curr['close']:.2f}, SL={sl:.2f}")
                logger.info(f"Buy 2nd unit at {curr['date']}, price={curr['close']:.2f}, SL={sl:.2f}")
        
        # Exit conditions for long positions
        if position == 'long':
            if curr['close'] <= sl:
                df.loc[df.index[i], 'signal'] = -1
                df.loc[df.index[i], 'adx_signal'] = 0
                print(f"generate_signals: Exit long at {curr['date']}, price={curr['close']:.2f}, reason=sl_hit")
                logger.info(f"Exit long at {curr['date']}, price={curr['close']:.2f}, reason=sl_hit")
                position = None
                first_unit_price = None
                sl = None
        
        # Exit for short positions
        elif position == 'short':
            if curr['close'] >= sl:
                df.loc[df.index[i], 'signal'] = 0
                df.loc[df.index[i], 'adx_signal'] = 0
                print(f"generate_signals: Exit short at {curr['date']}, price={curr['close']:.2f}, reason=sl_hit")
                logger.info(f"Exit short at {curr['date']}, price={curr['close']:.2f}, reason=sl_hit")
                position = None
                first_unit_price = None
                sl = None
    
    last_row = df.iloc[-1]
    sl_value = f"{last_row['sl']:.4f}" if not pd.isna(last_row['sl']) else 'NaN'
    print(f"generate_signals: Last signal={last_row['signal']}, adx_signal={last_row['adx_signal']}, unit={last_row['unit']}, adx={last_row['adx']:.2f}, short_ma={last_row['short_ma']:.2f}, long_ma={last_row['long_ma']:.2f}, sl={sl_value}")
    logger.info(f"Last signal={last_row['signal']}, adx_signal={last_row['adx_signal']}, unit={last_row['unit']}, adx={last_row['adx']:.2f}, short_ma={last_row['short_ma']:.2f}, long_ma={last_row['long_ma']:.2f}, sl={sl_value}")
    return df

def place_order(transaction_type, security_id, exchange_segment, quantity, symbol):
    print(f"===========================place_order: Starting for {transaction_type}, security_id={security_id}, quantity={quantity}, symbol={symbol}")
    logger.info(f"Placing {transaction_type} order for security_id={security_id}, symbol={symbol}, quantity={quantity}")
    try:
        order_type = "MARKET"
        product_type = "MARGIN" if exchange_segment in ["NSE_FNO", "BSE_FNO"] else "CNC"
        validity = "DAY"
        price = 0.0
        trigger_price = 0.0

        valid_segments = ["NSE_EQ", "BSE_EQ", "NSE_FNO", "BSE_FNO"]
        valid_products = ["CNC", "INTRADAY", "MARGIN"]
        valid_transactions = ["BUY", "SELL"]
        valid_orders = ["MARKET", "LIMIT", "STOP_LOSS", "STOP_LOSS_MARKET"]
        
        if exchange_segment not in valid_segments:
            raise ValueError(f"Invalid exchange_segment: {exchange_segment}. Valid: {valid_segments}")
        if product_type not in valid_products:
            raise ValueError(f"Invalid product_type: {product_type}. Valid: {valid_products}")
        if transaction_type not in valid_transactions:
            raise ValueError(f"Invalid transaction_type: {transaction_type}. Valid: {valid_transactions}")
        if order_type not in valid_orders:
            raise ValueError(f"Invalid order_type: {order_type}. Valid: {valid_orders}")
        if quantity <= 0:
            raise ValueError(f"Invalid quantity: {quantity}. Must be greater than 0")
        if not security_id:
            raise ValueError("security_id cannot be empty")

        order_payload = {
            "transaction_type": transaction_type,
            "exchange_segment": exchange_segment,
            "product_type": product_type,
            "order_type": order_type,
            "validity": validity,
            "security_id": str(security_id),
            "quantity": int(quantity),
            "disclosed_quantity": 0,
            "price": price,
            "trigger_price": trigger_price,
            "after_market_order": False,
            "amo_time": "",
            "bo_profit_value": 0.0
        }

        print(f"place_order: Order payload={order_payload}")
        logger.info(f"Order payload={order_payload}")

        if is_market_open():
            try:
                order_response = dhan.place_order(**order_payload)
                print(f"place_order: Live Order Response={order_response}")
                logger.info(f"Live Order Response={order_response}")
            except Exception as e:
                print(f"place_order: Dhan API error: {e}")
                logger.error(f"Dhan API error: {e}")
                return None

            if not isinstance(order_response, dict) or "data" not in order_response or "orderId" not in order_response["data"]:
                print(f"place_order: Invalid API response: {order_response}")
                logger.error(f"Invalid API response: {order_response}")
                return None

            data = order_response.get("data", {})
            order_id = data.get("orderId")
            order_status = data.get("orderStatus", "UNKNOWN")
            order_symbol = symbol

            if order_status == "TRANSIT":
                for attempt in range(3):
                    print(f"place_order: Polling order status for order_id={order_id}, attempt={attempt+1}")
                    logger.info(f"Polling order status for order_id={order_id}, attempt={attempt+1}")
                    status = check_order_status(order_id)
                    if status in ["EXECUTED", "CONFIRMED", "FILLED", "COMPLETED"]:
                        try:
                            save_offline_order(
                                order_id=order_id,
                                security_id=security_id,
                                exchange_segment=exchange_segment,
                                transaction_type=transaction_type,
                                quantity=quantity,
                                order_type=order_type,
                                product_type=product_type,
                                price=price,
                                trigger_price=trigger_price,
                                order_symbol=order_symbol,
                                status="EXECUTED"
                            )
                            print(f"place_order: Order executed and saved, order_id={order_id}")
                            logger.info(f"Order executed and saved, order_id={order_id}")
                            return {"orderId": order_id, "orderStatus": "EXECUTED"}
                        except Exception as e:
                            print(f"place_order: Database save error: {e}")
                            logger.error(f"Database save error: {e}")
                            return None
                    elif status in ["REJECTED", "CANCELLED"]:
                        error_desc = order_response.get("data", [{}])[0].get("omsErrorDescription", "No error description")
                        print(f"place_order: Order {status.lower()}, order_id={order_id}, reason={error_desc}")
                        logger.error(f"Order {status.lower()}, order_id={order_id}, reason={error_desc}")
                        return None
                    time.sleep(2)
                print(f"place_order: Order still in TRANSIT after 5 attempts, order_id={order_id}")
                logger.error(f"Order still in TRANSIT after 5 attempts, order_id={order_id}")
                try:
                    save_offline_order(
                        order_id=order_id,
                        security_id=security_id,
                        exchange_segment=exchange_segment,
                        transaction_type=transaction_type,
                        quantity=quantity,
                        order_type=order_type,
                        product_type=product_type,
                        price=price,
                        trigger_price=trigger_price,
                        order_symbol=order_symbol,
                        status="TRANSIT"
                    )
                    print(f"place_order: TRANSIT order saved, order_id={order_id}")
                    logger.info(f"TRANSIT order saved, order_id={order_id}")
                    return {"orderId": order_id, "orderStatus": "TRANSIT"}
                except Exception as e:
                    print(f"place_order: Database save error: {e}")
                    logger.error(f"Database save error: {e}")
                    return None
            elif order_status in ["PLACED", "EXECUTED", "CONFIRMED", "FILLED", "COMPLETED"]:
                try:
                    save_offline_order(
                        order_id=order_id,
                        security_id=security_id,
                        exchange_segment=exchange_segment,
                        transaction_type=transaction_type,
                        quantity=quantity,
                        order_type=order_type,
                        product_type=product_type,
                        price=price,
                        trigger_price=trigger_price,
                        order_symbol=order_symbol,
                        status="EXECUTED" if order_status in ["EXECUTED", "CONFIRMED", "FILLED", "COMPLETED"] else "PENDING"
                    )
                    print(f"place_order: Order saved to database, order_id={order_id}")
                    logger.info(f"Order saved to database, order_id={order_id}")
                    return {"orderId": order_id, "orderStatus": order_status}
                except Exception as e:
                    print(f"place_order: Database save error: {e}")
                    logger.error(f"Database save error: {e}")
                    return None
            else:
                print(f"place_order: Order failed, response={order_response}")
                logger.error(f"Order failed: response={order_response}")
                return None
        else:
            test_order_id = f"TEST_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"
            print(f"place_order: Market closed, saving offline order with test_order_id={test_order_id}")
            logger.info(f"Market AscendantInfo Market closed, saving offline order with test_order_id={test_order_id}")
            try:
                save_offline_order(
                    order_id=test_order_id,
                    security_id=security_id,
                    exchange_segment=exchange_segment,
                    transaction_type=transaction_type,
                    quantity=quantity,
                    order_type=order_type,
                    product_type=product_type,
                    price=price,
                    trigger_price=trigger_price,
                    order_symbol=symbol,
                    status="PENDING"
                )
                print(f"place_order: Offline order saved, test_order_id={test_order_id}")
                logger.info(f"Offline order saved, test_order_id={test_order_id}")
                return {"orderId": test_order_id, "orderStatus": "offline"}
            except Exception as e:
                print(f"place_order: Database save error for offline order: {e}")
                logger.error(f"Database save error for offline order: {e}")
                return None
    except Exception as e:
        print(f"place_order: Error placing order: {e}")
        logger.error(f"Order error: {e}")
        return None

async def trading_bot():
    print("trading_bot: Starting")
    logger.info("Trading bot started")
    while bot_running:
        print("=============================trading_bot: New iteration===========================")
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT symbol, security_id, exchange_segment, instrument_type, quantity FROM watchlist")
            watchlist_data = cursor.fetchall()
            conn.close()
            print(f"===========================trading_bot: Watchlist data={watchlist_data}===========================")

            for item in watchlist_data:
                symbol = item['symbol']
                security_id = item['security_id']
                exchange_segment = item.get('exchange_segment', 'NSE_FNO')
                instrument_type = item.get('instrument_type', 'OPTIDX')
                quantity = item['quantity']
                position = positions.get(symbol, {})

                print(f"===========================trading_bot: Processing {symbol}, position={position}")
                try:
                    active_order = has_active_order(symbol, "BUY")
                    if active_order:
                        if not position or position.get("order_id") != active_order["order_id"]:
                            positions[symbol] = {
                                "order_id": active_order["order_id"],
                                "status": active_order["status"],
                                "transaction_type": "BUY",
                                "unit": 1
                            }
                            print(f"trading_bot: {symbol} - Updated position from database, order_id={active_order['order_id']}, status={active_order['status']}")
                            logger.info(f"{symbol} - Updated position from database, order_id={active_order['order_id']}, status={active_order['status']}")
                        if active_order["status"] in ["PENDING", "TRANSIT", "EXECUTED"]:
                            print(f"trading_bot: {symbol} - Active BUY order exists, order_id={active_order['order_id']}, status={active_order['status']}, skipping BUY")
                            logger.info(f"{symbol} - Active BUY order exists, order_id={active_order['order_id']}, status={active_order['status']}, skipping BUY")
                            continue

                    if position and position.get("order_id") and position.get("status") in ["PENDING", "TRANSIT"]:
                        current_status = check_order_status(position["order_id"])
                        if current_status in ["EXECUTED", "CONFIRMED", "FILLED", "COMPLETED"]:
                            positions[symbol]["status"] = "EXECUTED"
                            print(f"trading_bot: {symbol} - Order status updated to EXECUTED, order_id={position['order_id']}")
                            logger.info(f"{symbol} - Order status updated to EXECUTED, order_id={position['order_id']}")
                        elif current_status in ["REJECTED", "CANCELLED"]:
                            positions[symbol] = {}
                            print(f"trading_bot: {symbol} - Order {current_status.lower()}, cleared position, order_id={position['order_id']}")
                            logger.info(f"{symbol} - Order {current_status.lower()}, cleared position, order_id={position['order_id']}")
                            continue
                        else:
                            print(f"trading_bot: {symbol} - Order in {current_status}, skipping")
                            logger.info(f"{symbol} - Order in {current_status}, skipping")
                            continue

                    from_date = (pd.Timestamp.now() - pd.Timedelta(days=60)).strftime('%Y-%m-%d')
                    to_date = pd.Timestamp.now().strftime('%Y-%m-%d')
                    expiry_code = get_expiry_code(symbol, exchange_segment, instrument_type)
                    df = fetch_historical_data(security_id, exchange_segment, from_date, to_date, instrument_type, expiry_code)
                    print(f"trading_bot: Fetched data for {symbol}, rows={len(df) if df is not None else 0}")

                    if df is None or len(df) < MIN_MA_PERIOD:
                        print(f"trading_bot: Insufficient data for {symbol}, rows={len(df) if df is not None else 0}, minimum required={MIN_MA_PERIOD}")
                        logger.warning(f"Insufficient data for {symbol}, rows={len(df) if df is not None else 0}, minimum required={MIN_MA_PERIOD}")
                        continue

                    adjusted_long_ma_period = min(LONG_MA_PERIOD, max(MIN_MA_PERIOD, len(df)))
                    if adjusted_long_ma_period < LONG_MA_PERIOD:
                        print(f"trading_bot: Adjusting LONG_MA_PERIOD from {LONG_MA_PERIOD} to {adjusted_long_ma_period} for {symbol} due to insufficient data")
                        logger.info(f"Adjusting LONG_MA_PERIOD from {LONG_MA_PERIOD} to {adjusted_long_ma_period} for {symbol}")

                    df = calculate_moving_averages(df, SHORT_MA_PERIOD, adjusted_long_ma_period)
                    df = calculate_atr(df, ATR_PERIOD)
                    df = calculate_adx(df, ADX_PERIOD)

                    if df[['short_ma', 'long_ma', 'adx', 'atr', 'plus_di', 'minus_di']].iloc[-1].isna().any():
                        print(f"trading_bot: NaN values in indicators for {symbol}, skipping")
                        logger.warning(f"NaN values in indicators for {symbol}")
                        continue

                    df = generate_signals(df, ADX_THRESHOLD)
                    latest_signal = df['signal'].iloc[-1]
                    latest_unit = df['unit'].iloc[-1]
                    latest_sl = df['sl'].iloc[-1]
                    sl_value = f"{latest_sl:.4f}" if not pd.isna(latest_sl) else 'NaN'  # Fixed formatting
                    print(f"trading_bot: {symbol} - signal={latest_signal}, unit={latest_unit}, adx={df['adx'].iloc[-1]:.2f}, short_ma={df['short_ma'].iloc[-1]:.2f}, long_ma={df['long_ma'].iloc[-1]:.2f}, sl={sl_value}")
                    logger.info(f"{symbol} - signal={latest_signal}, unit={latest_unit}, adx={df['adx'].iloc[-1]:.2f}, short_ma={df['short_ma'].iloc[-1]:.2f}, long_ma={df['long_ma'].iloc[-1]:.2f}, sl={sl_value}")

                    # Handle BUY order (1st or 2nd unit)
                    if latest_signal in [1, 2] and not active_order and not position:
                        order = place_order(dhan.BUY, security_id, exchange_segment, quantity, symbol)
                        if order and order.get("orderStatus") in ["PLACED", "EXECUTED", "TRANSIT"]:
                            positions[symbol] = {
                                "order_id": order["orderId"],
                                "status": order["orderStatus"],
                                "transaction_type": "BUY",
                                "unit": latest_signal
                            }
                            print(f"trading_bot: {symbol} - Long position opened, unit={latest_signal}, order_id={order['orderId']}")
                            logger.info(f"{symbol} - Long position opened, unit={latest_signal}, order_id={order['orderId']}")
                        elif order and order.get("orderStatus") == "offline":
                            print(f"trading_bot: {symbol} - Offline order saved")
                            logger.info(f"{symbol} - Offline order saved")
                        else:
                            print(f"trading_bot: {symbol} - BUY order failed")
                            logger.error(f"{symbol} - BUY order failed")

                    # Handle additional BUY for 2nd unit if 1st unit exists
                    elif latest_signal == 2 and position and position.get("status") == "EXECUTED" and position.get("unit") == 1:
                        order = place_order(dhan.BUY, security_id, exchange_segment, quantity, symbol)
                        if order and order.get("orderStatus") in ["PLACED", "EXECUTED", "TRANSIT"]:
                            positions[symbol]["unit"] = 2
                            positions[symbol]["order_id"] = order["orderId"]
                            positions[symbol]["status"] = order["orderStatus"]
                            print(f"trading_bot: {symbol} - 2nd unit added, order_id={order['orderId']}")
                            logger.info(f"{symbol} - 2nd unit added, order_id={order['orderId']}")
                        elif order and order.get("orderStatus") == "offline":
                            print(f"trading_bot: {symbol} - Offline 2nd unit order saved")
                            logger.info(f"{symbol} - Offline 2nd unit order saved")
                        else:
                            print(f"trading_bot: {symbol} - 2nd unit BUY order failed")
                            logger.error(f"{symbol} - 2nd unit BUY order failed")

                    # Handle SELL order (exit position)
                    elif latest_signal == -1 and position and position.get("status") == "EXECUTED" and position.get("transaction_type") == "BUY":
                        order = place_order(dhan.SELL, security_id, exchange_segment, quantity * position.get("unit", 1), symbol)
                        if order and order.get("orderStatus") in ["PLACED", "EXECUTED", "TRANSIT"]:
                            positions[symbol] = {}
                            print(f"trading_bot: {symbol} - Position closed, order_id={order['orderId']}")
                            logger.info(f"{symbol} - Position closed, order_id={order['orderId']}")
                        elif order and order.get("orderStatus") == "offline":
                            print(f"trading_bot: {symbol} - Offline SELL order saved")
                            logger.info(f"{symbol} - Offline SELL order saved")
                        else:
                            print(f"trading_bot: {symbol} - SELL order failed")
                            logger.error(f"{symbol} - SELL order failed")
                    else:
                        print(f"trading_bot: {symbol} - No action")
                        logger.info(f"{symbol} - No action")
                except Exception as e:
                    print(f"trading_bot: Error for {symbol}: {e}")
                    logger.error(f"Error for {symbol}: {e}")
        except Exception as e:
            print(f"trading_bot: Error fetching watchlist: {e}")
            logger.error(f"Error fetching watchlist: {e}")
        
        print(f"===========================trading_bot: Waiting {INTERVAL} seconds===========================")
        await asyncio.sleep(INTERVAL)


@trading_bot_bp.route('/trading_bot/watchlist/add', methods=['POST'])
def add_to_watchlist():
    print("API /watchlist/add: Request received")
    data = request.get_json(silent=True)
    if not data or 'symbol' not in data or 'security_id' not in data or 'quantity' not in data:
        print("API /watchlist/add: Missing required fields")
        logger.warning("Missing required fields in /watchlist/add")
        return jsonify({"status": "error", "message": "Symbol, security_id, and quantity required"}), 400
    
    symbol = data['symbol'].upper()
    quantity = int(data['quantity'])
    if quantity <= 0:
        print("API /watchlist/add: Quantity must be positive")
        logger.warning("Quantity must be positive in /watchlist/add")
        return jsonify({"status": "error", "message": "Quantity must be positive"}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT 1 FROM watchlist WHERE symbol = %s", (symbol,))
        if cursor.fetchone():
            print(f"API /watchlist/add: {symbol} already in watchlist")
            logger.warning(f"{symbol} already in watchlist")
            return jsonify({"status": "error", "message": f"{symbol} already in watchlist"}), 400
        
        security_id = data['security_id']
        exchange_segment = data.get('exchange_segment', 'NSE_FNO')

        if 'instrument_type' in data:
            instrument_type = data['instrument_type']
        else:
            if exchange_segment == 'NSE_EQ':
                instrument_type = 'EQUITY'
            else:
                instrument_type = 'OPTIDX'

        cursor.execute(
            """INSERT INTO watchlist (symbol, security_id, quantity, exchange_segment, instrument_type)
               VALUES (%s, %s, %s, %s, %s)""",
            (symbol, security_id, quantity, exchange_segment, instrument_type)
        )
        conn.commit()
        print(f"API /watchlist/add: Added {symbol}")
        logger.info(f"Added to watchlist: {symbol}")
        return jsonify({"status": "success", "message": f"{symbol} added to watchlist"})
    except Exception as e:
        conn.rollback()
        print(f"API /watchlist/add: Error: {e}")
        logger.error(f"Error adding to watchlist: {e}")
        return jsonify({"status": "error", "message": "Failed to add to watchlist"}), 500
    finally:
        conn.close()

@trading_bot_bp.route('/trading_bot/watchlist/remove', methods=['POST'])
def remove_from_watchlist():
    print("API /watchlist/remove: Request received")
    data = request.get_json(silent=True)
    if not data or 'symbol' not in data:
        print("API /watchlist/remove: Missing symbol")
        logger.warning("Missing symbol in /watchlist/remove")
        return jsonify({"status": "error", "message": "Symbol required"}), 400
    
    symbol = data['symbol'].upper()
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM watchlist WHERE symbol = %s", (symbol,))
        if cursor.rowcount > 0:
            conn.commit()
            positions.pop(symbol, None)
            print(f"API /watchlist/remove: Removed {symbol}")
            logger.info(f"Removed from watchlist: {symbol}")
            return jsonify({"status": "success", "message": f"{symbol} removed from watchlist"})
        print(f"API /watchlist/remove: {symbol} not found")
        logger.warning(f"{symbol} not found in watchlist")
        return jsonify({"status": "error", "message": f"{symbol} not in watchlist"}), 400
    except Exception as e:
        conn.rollback()
        print(f"API /watchlist/remove: Error: {e}")
        logger.error(f"Error removing from watchlist: {e}")
        return jsonify({"status": "error", "message": "Failed to remove from watchlist"}), 500
    finally:
        conn.close()

@trading_bot_bp.route('/trading_bot/watchlist', methods=['GET'])
def get_watchlist():
    print("API /watchlist: Request received")
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM watchlist")
        watchlist_data = cursor.fetchall()
        print("API /watchlist: Fetched watchlist data")
        logger.info("Fetched watchlist data")
        return jsonify({"status": "success", "data": watchlist_data})
    except Exception as e:
        print(f"API /watchlist: Error: {e}")
        logger.error(f"Error fetching watchlist: {e}")
        return jsonify({"status": "error", "message": "Failed to fetch watchlist"}), 500
    finally:
        conn.close()

@trading_bot_bp.route('/trading_bot/start', methods=['POST'])
def start_bot():
    global bot_running, loop, task
    print("API /start: Request received")
    if bot_running:
        print("API /start: Bot already running")
        logger.warning("Bot already running")
        return jsonify({"status": "error", "message": "Bot is already running"}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as count FROM watchlist")
    count = cursor.fetchone()[0]
    conn.close()
    if count == 0:
        print("API /start: Watchlist is empty")
        logger.warning("Watchlist is empty")
        return jsonify({"status": "error", "message": "Watchlist is empty"}), 400
    
    try:
        data = request.get_json(silent=True) or {}
        print("API /start: Starting bot with ADX strategy")
        logger.info("Starting bot with ADX strategy")
    except Exception as e:
        print(f"API /start: Invalid JSON or content type, using defaults. Error: {e}")
        logger.warning(f"Invalid JSON or content type in /start: {e}")
    
    bot_running = True
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    task = loop.create_task(trading_bot())
    threading.Thread(target=loop.run_forever, daemon=True).start()
    print("API /start: Bot started")
    logger.info("Bot started")
    return jsonify({"status": "success", "message": "Bot started"})

@trading_bot_bp.route('/trading_bot/stop', methods=['POST'])
def stop_bot():
    global bot_running, loop, task
    print("API /stop: Request received")
    if not bot_running:
        print("API /stop: Bot not running")
        logger.warning("Bot not running")
        return jsonify({"status": "error", "message": "Bot not running"}), 400
    bot_running = False
    if task:
        task.cancel()
    if loop:
        loop.call_soon_threadsafe(loop.stop)
        loop.run_until_complete(loop.shutdown_asyncgens())
        loop.close()
    print("API /stop: Bot stopped")
    logger.info("Bot stopped")
    return jsonify({"status": "success", "message": "Bot stopped"})

@trading_bot_bp.route('/trading_bot/status', methods=['GET'])
def get_status():
    print("API /status: Request received")
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT symbol FROM watchlist")
        watchlist_symbols = [row['symbol'] for row in cursor.fetchall()]
        status = {
            "bot_running": bot_running,
            "positions": {symbol: pos if pos else "none" for symbol, pos in positions.items()},
            "watchlist": watchlist_symbols,
            "parameters": {
                "short_ma_period": SHORT_MA_PERIOD,
                "long_ma_period": LONG_MA_PERIOD,
                "adx_period": ADX_PERIOD,
                "adx_threshold": ADX_THRESHOLD,
                "atr_period": ATR_PERIOD
            }
        }
        print(f"API /status: Returning status")
        logger.info(f"Status: {status}")
        return jsonify({"status": "success", "data": status})
    except Exception as e:
        print(f"API /status: Error: {e}")
        logger.error(f"Error fetching status: {e}")
        return jsonify({"status": "error", "message": "Failed to fetch status"}), 500
    finally:
        conn.close()

@trading_bot_bp.route('/trading_bot/trade', methods=['POST'])
def manual_trade():
    print("API /trade: Request received")
    data = request.get_json()
    if not data or 'action' not in data or 'symbol' not in data:
        print("API /trade: Missing action or symbol")
        logger.warning("Missing action or symbol in /trade")
        return jsonify({"status": "error", "message": "Action and symbol required"}), 400
    action = data['action'].upper()
    symbol = data['symbol'].upper()
    if action not in ['BUY', 'SELL']:
        print(f"API /trade: Invalid action={action}")
        logger.warning(f"Invalid action={action} in /trade")
        return jsonify({"status": "error", "message": "Action must be 'buy' or 'sell'"}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT security_id, exchange_segment, quantity, instrument_type FROM watchlist WHERE symbol = %s", (symbol,))
        watchlist_item = cursor.fetchone()
        if not watchlist_item:
            print(f"API /trade: {symbol} not in watchlist")
            logger.warning(f"{symbol} not in watchlist")
            return jsonify({"status": "error", "message": f"{symbol} not in watchlist"}), 400
        
        active_order = has_active_order(symbol, "BUY")
        position = positions.get(symbol, {})
        if action == "BUY" and (active_order or position):
            print(f"API /trade: Active BUY order or position exists for {symbol}")
            logger.warning(f"Active BUY order or position exists for {symbol} in /trade")
            return jsonify({"status": "error", "message": f"Active BUY order or position exists for {symbol}"}), 400
        if action == "SELL" and not (active_order or position):
            print(f"API /trade: No position to sell for {symbol}")
            logger.warning(f"No position to sell for {symbol} in /trade")
            return jsonify({"status": "error", "message": f"No position to sell for {symbol}"}), 400

        order = place_order(
            dhan.BUY if action == 'BUY' else dhan.SELL,
            watchlist_item['security_id'],
            watchlist_item['exchange_segment'] or 'NSE_FNO',
            watchlist_item['quantity'],
            symbol
        )
        if order and order.get("orderStatus") in ["PLACED", "EXECUTED", "TRANSIT"]:
            if action == "BUY":
                positions[symbol] = {
                    "order_id": order["orderId"],
                    "status": order["orderStatus"],
                    "transaction_type": "BUY",
                    "unit": 1  # Manual BUY starts with 1st unit
                }
            else:
                positions[symbol] = {}
            print(f"API /trade: Order placed, order_id={order['orderId']}")
            logger.info(f"Order placed for {symbol}: {action}, order_id={order['orderId']}")
            return jsonify({"status": "success", "order_id": order["orderId"], "order_status": order["orderStatus"]})
        elif order and order.get("orderStatus") == "offline":
            print("API /trade: Offline order saved")
            logger.info(f"Offline order saved for {symbol}: {action}")
            return jsonify({"status": "offline", "order_id": order["orderId"], "message": "Market closed, order saved"})
        print("API /trade: Order failed")
        logger.error(f"Order failed for {symbol}: {action}")
        return jsonify({"status": "error", "message": "Failed to place order"}), 500
    except Exception as e:
        print(f"API /trade: Error: {e}")
        logger.error(f"Error placing trade: {e}")
        return jsonify({"status": "error", "message": "Failed to place trade"}), 500
    finally:
        conn.close()

@trading_bot_bp.route('/trading_bot/force_signal', methods=['POST'])
def force_signal():
    print("API /force_signal: Request received")
    data = request.get_json(silent=True) or {}
    signal_type = data.get('signal', '').upper()
    symbol = data.get('symbol', '').upper()
    if signal_type not in ['BUY', 'SELL'] or not symbol:
        print("API /force_signal: Invalid signal or symbol")
        logger.warning("Invalid signal or symbol in /force_signal")
        return jsonify({"status": "error", "message": "Signal (buy/sell) and symbol required"}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT security_id, exchange_segment, quantity, instrument_type FROM watchlist WHERE symbol = %s", (symbol,))
        watchlist_item = cursor.fetchone()
        if not watchlist_item:
            print(f"API /force_signal: {symbol} not in watchlist")
            logger.warning(f"{symbol} not in watchlist")
            return jsonify({"status": "error", "message": f"{symbol} not in watchlist"}), 400
        
        active_order = has_active_order(symbol, "BUY")
        position = positions.get(symbol, {})
        if signal_type == 'BUY' and (active_order or position):
            print(f"API /force_signal: Active BUY order or position exists for {symbol}")
            logger.warning(f"Active BUY order or position exists for {symbol} in /force_signal")
            return jsonify({"status": "error", "message": f"Active BUY order or position exists for {symbol}"}), 400
        if signal_type == 'SELL' and not (active_order or position):
            print(f"API /force_signal: No position to sell for {symbol}")
            logger.warning(f"No position to sell for {symbol} in /force_signal")
            return jsonify({"status": "error", "message": f"No position to sell for {symbol}"}), 400

        order = place_order(
            dhan.BUY if signal_type == 'BUY' else dhan.SELL,
            watchlist_item['security_id'],
            watchlist_item['exchange_segment'] or 'NSE_FNO',
            watchlist_item['quantity'],
            symbol
        )
        if order and order.get("orderStatus") in ["PLACED", "EXECUTED", "TRANSIT"]:
            if signal_type == "BUY":
                positions[symbol] = {
                    "order_id": order["orderId"],
                    "status": order["orderStatus"],
                    "transaction_type": "BUY",
                    "unit": 1  # Forced BUY starts with 1st unit
                }
            else:
                positions[symbol] = {}
            print(f"API /force_signal: Forced {signal_type} for {symbol}, order_id={order['orderId']}")
            logger.info(f"Forced {signal_type} for {symbol}, order_id={order['orderId']}")
            return jsonify({"status": "success", "order_id": order["orderId"], "order_status": order["orderStatus"]})
        elif order and order.get("orderStatus") == "offline":
            print(f"API /force_signal: Offline {signal_type} order saved for {symbol}")
            logger.info(f"Offline {signal_type} order saved for {symbol}")
            return jsonify({"status": "offline", "order_id": order["orderId"], "message": "Market closed, order saved"})
        print(f"API /force_signal: Failed to place {signal_type} order for {symbol}")
        logger.error(f"Failed to place {signal_type} order for {symbol}")
        return jsonify({"status": "error", "message": "Failed to force signal"}), 500
    except Exception as e:
        print(f"API /force_signal: Error: {e}")
        logger.error(f"Error forcing signal: {e}")
        return jsonify({"status": "error", "message": "Failed to force signal"}), 500
    finally:
        conn.close()

@trading_bot_bp.route('/trading_bot/reset_position', methods=['POST'])
def reset_position():
    print("API /reset_position: Request received")
    data = request.get_json(silent=True) or {}
    symbol = data.get('symbol', '').upper()
    if symbol:
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT 1 FROM watchlist WHERE symbol = %s", (symbol,))
            if cursor.fetchone():
                positions[symbol] = {}
                print(f"API /reset_position: Position reset for {symbol}")
                logger.info(f"Position reset for {symbol}")
                return jsonify({"status": "success", "message": f"Position reset for {symbol}"})
            print(f"API /reset_position: {symbol} not found")
            logger.warning(f"{symbol} not found in watchlist")
            return jsonify({"status": "error", "message": f"{symbol} not found"}), 400
        except Exception as e:
            print(f"API /reset_position: Error: {e}")
            logger.error(f"Error resetting position: {e}")
            return jsonify({"status": "error", "message": "Failed to reset position"}), 500
        finally:
            conn.close()
    positions.clear()
    print("API /reset_position: All positions reset")
    logger.info("All positions reset")
    return jsonify({"status": "success", "message": "All positions reset"})