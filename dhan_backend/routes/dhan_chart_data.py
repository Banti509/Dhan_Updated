# from flask import Flask, request, jsonify, Blueprint
# from flask_cors import CORS
# from dhanhq import dhanhq
# import logging
# import datetime
# import pandas as pd
# import traceback
# from config import client_id, access_token
# from db import get_db_connection
# import json

# # Logging configuration
# logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
# logger = logging.getLogger(__name__)

# # Initialize Dhan API Client
# dhan = dhanhq(client_id, access_token)

# # Initialize Flask app
# app = Flask(__name__)
# CORS(app)  # Enable CORS for React frontend

# # Mock symbol to security_id mapping (replace with actual Dhan API lookup)
# SYMBOL_TO_SECURITY_ID = {
#     "RELIANCE": "1333",
#     "TCS": "10999",
#     "INFY": "11536"
# }

# def check_token_expiry():
#     """Check if the access token is still valid."""
#     expiry_timestamp = 1747568314  # From JWT 'exp' field
#     current_timestamp = int(datetime.datetime.now().timestamp())
#     if current_timestamp > expiry_timestamp:
#         raise ValueError("Access token has expired. Please obtain a new token.")

# def parse_date(date_str):
#     """Parse a date string to a datetime object."""
#     try:
#         return datetime.datetime.strptime(date_str, '%Y-%m-%d')
#     except ValueError:
#         raise ValueError("Date must be in YYYY-MM-DD format")

# def get_intraday_minute_data(security_id, exchange_segment, instrument_type, from_date=None, to_date=None, days=5, interval=5):
#     """Fetch intraday minute OHLC data for a given security."""
#     try:
#         check_token_expiry()
        
#         # Set date range
#         if to_date is None:
#             to_date = datetime.datetime.now()
#         elif isinstance(to_date, str):
#             to_date = parse_date(to_date)
        
#         if from_date is None:
#             from_date = to_date - datetime.timedelta(days=days * 2)
#         elif isinstance(from_date, str):
#             from_date = parse_date(from_date)

#         params = {
#             'security_id': str(security_id),
#             'exchange_segment': exchange_segment,
#             'instrument_type': instrument_type,
#             'from_date': from_date.strftime('%Y-%m-%d'),
#             'to_date': to_date.strftime('%Y-%m-%d'),
#             'interval': interval
#         }

#         logger.info(f"Fetching intraday data for security {security_id} with parameters: {params}")
#         ohlc = dhan.intraday_minute_data(**params)

#         if ohlc.get('status') == 'success' and isinstance(ohlc.get('data'), dict):
#             data = ohlc['data']
#             df = pd.DataFrame({
#                 'date': pd.to_datetime(data['timestamp'], unit='s').tz_localize('UTC').tz_convert('Asia/Kolkata'),
#                 'open': data['open'],
#                 'high': data['high'],
#                 'low': data['low'],
#                 'close': data['close'],
#                 'volume': data['volume']
#             })

#             # Filter for weekdays (Monday to Friday)
#             df = df[df['date'].dt.weekday < 5].sort_values('date')

#             # Filter for date range
#             df['date_only'] = df['date'].dt.date
#             if from_date and to_date:
#                 df = df[(df['date_only'] >= from_date.date()) & (df['date_only'] <= to_date.date())]
#             else:
#                 last_days = df['date_only'].drop_duplicates().sort_values().tail(days)
#                 df = df[df['date_only'].isin(last_days)]

#             # Format the 'date' column
#             df['date'] = df['date'].dt.strftime('%Y-%m-%d %H:%M:%S')
#             df = df.drop(columns=['date_only']).reset_index(drop=True)

#             return df[['date', 'open', 'high', 'low', 'close', 'volume']]
#         else:
#             logger.warning(f"No intraday data received for security {security_id}: {ohlc}")
#             return pd.DataFrame()

#     except Exception as e:
#         logger.error(f"Error fetching intraday data for security {security_id}: {str(e)}")
#         traceback.print_exc()
#         return pd.DataFrame()

# def get_historical_daily_data(security_id, exchange_segment, instrument_type, from_date=None, to_date=None, days=10, expiry_code=0):
#     """Fetch historical daily OHLC data for a given security."""
#     try:
#         check_token_expiry()
        
#         # Set date range
#         if to_date is None:
#             to_date = datetime.datetime.now()
#         elif isinstance(to_date, str):
#             to_date = parse_date(to_date)
        
#         if from_date is None:
#             from_date = to_date - datetime.timedelta(days=days * 2)
#         elif isinstance(from_date, str):
#             from_date = parse_date(from_date)

#         params = {
#             'security_id': str(security_id),
#             'exchange_segment': exchange_segment,
#             'instrument_type': instrument_type,
#             'from_date': from_date.strftime('%Y-%m-%d'),
#             'to_date': to_date.strftime('%Y-%m-%d'),
#             'expiry_code': expiry_code
#         }

#         logger.info(f"Fetching historical data for security {security_id} with parameters: {params}")
#         ohlc = dhan.historical_daily_data(**params)

#         if ohlc.get('status') == 'success' and isinstance(ohlc.get('data'), dict):
#             data = ohlc['data']
#             df = pd.DataFrame({
#                 'date': pd.to_datetime(data['timestamp'], unit='s').tz_localize('UTC').tz_convert('Asia/Kolkata'),
#                 'open': data['open'],
#                 'high': data['high'],
#                 'low': data['low'],
#                 'close': data['close'],
#                 'volume': data['volume']
#             })

#             # Filter for weekdays (Monday to Friday)
#             df = df[df['date'].dt.weekday < 5].sort_values('date')

#             # Filter for date range
#             df['date_only'] = df['date'].dt.date
#             if from_date and to_date:
#                 df = df[(df['date_only'] >= from_date.date()) & (df['date_only'] <= to_date.date())]
#             else:
#                 last_days = df['date_only'].drop_duplicates().sort_values().tail(days)
#                 df = df[df['date_only'].isin(last_days)]

#             # Format the 'date' column
#             df['date'] = df['date'].dt.strftime('%Y-%m-%d %H:%M:%S')
#             df = df.drop(columns=['date_only']).reset_index(drop=True)

#             return df[['date', 'open', 'high', 'low', 'close', 'volume']]
#         else:
#             logger.warning(f"No historical data received for security {security_id}: {ohlc}")
#             return pd.DataFrame()

#     except Exception as e:
#         logger.error(f"Error fetching historical data for security {security_id}: {str(e)}")
#         traceback.print_exc()
#         return pd.DataFrame()

# def validate_params(params):
#     """Validate request parameters."""
#     errors = []
#     if 'symbol' not in params or not params['symbol']:
#         if 'security_id' not in params or not params['security_id']:
#             errors.append("either symbol or security_id is required and cannot be empty")
    
#     if 'exchange_segment' not in params or params['exchange_segment'] not in ['NSE_EQ', 'BSE_EQ', 'NSE_FO', 'BSE_FO']:
#         errors.append("exchange_segment must be one of: NSE_EQ, BSE_EQ, NSE_FO, BSE_FO")
    
#     if 'instrument_type' not in params or params['instrument_type'] not in ['EQUITY', 'FUTURE', 'OPTION']:
#         errors.append("instrument_type must be one of: EQUITY, FUTURE, OPTION")
    
#     if 'interval' in params and params['interval'] not in [1, 5, 15, 30, 60]:
#         errors.append("interval must be one of: 1, 5, 15, 30, 60")
    
#     if 'from_date' in params and params['from_date']:
#         try:
#             parse_date(params['from_date'])
#         except ValueError:
#             errors.append("from_date must be in YYYY-MM-DD format")
    
#     if 'to_date' in params and params['to_date']:
#         try:
#             parse_date(params['to_date'])
#         except ValueError:
#             errors.append("to_date must be in YYYY-MM-DD format")
    
#     if 'days' in params and (not isinstance(params['days'], int) or params['days'] <= 0):
#         errors.append("days must be a positive integer")
    
#     if 'expiry_code' in params and not isinstance(params['expiry_code'], int):
#         errors.append("expiry_code must be an integer")
    
#     return errors
# # Define Blueprint for chart data
# chart_data_bp = Blueprint('chart_data', __name__)
# @chart_data_bp.route('chart_data', methods=['GET', 'POST'])
# def chart_data():
#     """Fetch both intraday and historical OHLC data for a symbol or security_id."""
#     try:
#         # Get parameters from query string (GET) or JSON body (POST)
#         if request.method == 'POST':
#             params = request.get_json() or {}
#         else:
#             params = request.args.to_dict()

#         # Convert string numbers to integers where needed
#         if 'days' in params and isinstance(params['days'], str) and params['days'].isdigit():
#             params['days'] = int(params['days'])
#         if 'interval' in params and isinstance(params['interval'], str) and params['interval'].isdigit():
#             params['interval'] = int(params['interval'])
#         if 'expiry_code' in params and isinstance(params['expiry_code'], str) and params['expiry_code'].isdigit():
#             params['expiry_code'] = int(params['expiry_code'])

#         # Set defaults
#         params.setdefault('exchange_segment', 'NSE_EQ')
#         params.setdefault('instrument_type', 'EQUITY')
#         params.setdefault('days', 5)
#         params.setdefault('interval', 5)
#         params.setdefault('expiry_code', 0)
#         params.setdefault('symbol', '')
#         params.setdefault('security_id', '')
#         params.setdefault('from_date', None)
#         params.setdefault('to_date', None)

#         # Validate parameters
#         errors = validate_params(params)
#         if errors:
#             logger.warning(f"Validation failed: {errors}")
#             return jsonify({'error': 'Validation failed', 'details': errors}), 400

#         # Determine security_id
#         security_id = params['security_id']
#         symbol = params['symbol'].upper()
        
#         if security_id:
#             symbol = security_id  # For response consistency
#         else:
#             security_id = SYMBOL_TO_SECURITY_ID.get(symbol)
#             if not security_id:
#                 logger.warning(f"Symbol {symbol} not found in mapping")
#                 return jsonify({'error': f"Symbol {symbol} not found in mapping"}), 400

#         # Fetch intraday data
#         intraday_df = get_intraday_minute_data(
#             security_id=security_id,
#             exchange_segment=params['exchange_segment'],
#             instrument_type=params['instrument_type'],
#             from_date=params['from_date'],
#             to_date=params['to_date'],
#             days=int(params['days']),
#             interval=int(params['interval'])
#         )

#         # Fetch historical data
#         historical_df = get_historical_daily_data(
#             security_id=security_id,
#             exchange_segment=params['exchange_segment'],
#             instrument_type=params['instrument_type'],
#             from_date=params['from_date'],
#             to_date=params['to_date'],
#             days=int(params['days']),
#             expiry_code=int(params['expiry_code'])
#         )

#         # Prepare response
#         results = {
#             'intraday': intraday_df.to_dict(orient='records') if not intraday_df.empty else [],
#             'historical': historical_df.to_dict(orient='records') if not historical_df.empty else []
#         }

#         logger.info(f"Successfully fetched chart data for symbol/security_id {symbol}")
#         return jsonify({'status': 'success', 'symbol': symbol, 'data': results})

#     except Exception as e:
#         logger.error(f"API Error: {str(e)}")
#         traceback.print_exc()
#         return jsonify({'error': str(e)}), 500











# from flask import Flask, request, jsonify, Blueprint
# from flask_cors import CORS
# from dhanhq import dhanhq
# import logging
# import datetime
# import pandas as pd
# import traceback
# from config import client_id, access_token
# from db import get_db_connection
# import json

# # Logging configuration
# logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
# logger = logging.getLogger(__name__)

# # Initialize Dhan API Client
# dhan = dhanhq(client_id, access_token)

# # Initialize Flask app
# app = Flask(__name__)
# CORS(app)

# SYMBOL_TO_SECURITY_ID = {
#     "RELIANCE": "1333",
#     "TCS": "10999",
#     "INFY": "11536"
# }

# def check_token_expiry():
#     expiry_timestamp = 1747568314
#     current_timestamp = int(datetime.datetime.now().timestamp())
#     if current_timestamp > expiry_timestamp:
#         raise ValueError("Access token has expired. Please obtain a new token.")

# def parse_date(date_str):
#     try:
#         return datetime.datetime.strptime(date_str, '%Y-%m-%d')
#     except ValueError:
#         raise ValueError("Date must be in YYYY-MM-DD format")

# def calculate_rsi(df, period=14):
#     delta = df['close'].diff()
#     gain = delta.where(delta > 0, 0)
#     loss = -delta.where(delta < 0, 0)
#     avg_gain = gain.rolling(window=period, min_periods=1).mean()
#     avg_loss = loss.rolling(window=period, min_periods=1).mean()
#     rs = avg_gain / avg_loss
#     df['rsi'] = 100 - (100 / (1 + rs))
#     return df

# def calculate_moving_averages(df, sma_period=20, ema_period=20):
#     df['sma'] = df['close'].rolling(window=sma_period).mean()
#     df['ema'] = df['close'].ewm(span=ema_period, adjust=False).mean()
#     return df

# def get_intraday_minute_data(security_id, exchange_segment, instrument_type, from_date=None, to_date=None, days=5, interval=5):
#     try:
#         check_token_expiry()
#         if to_date is None:
#             to_date = datetime.datetime.now()
#         elif isinstance(to_date, str):
#             to_date = parse_date(to_date)
#         if from_date is None:
#             from_date = to_date - datetime.timedelta(days=days * 2)
#         elif isinstance(from_date, str):
#             from_date = parse_date(from_date)

#         params = {
#             'security_id': str(security_id),
#             'exchange_segment': exchange_segment,
#             'instrument_type': instrument_type,
#             'from_date': from_date.strftime('%Y-%m-%d'),
#             'to_date': to_date.strftime('%Y-%m-%d'),
#             'interval': interval
#         }

#         logger.info(f"Fetching intraday data for {security_id} with: {params}")
#         ohlc = dhan.intraday_minute_data(**params)

#         if ohlc.get('status') == 'success' and isinstance(ohlc.get('data'), dict):
#             data = ohlc['data']
#             df = pd.DataFrame({
#                 'date': pd.to_datetime(data['timestamp'], unit='s').tz_localize('UTC').tz_convert('Asia/Kolkata'),
#                 'open': data['open'],
#                 'high': data['high'],
#                 'low': data['low'],
#                 'close': data['close'],
#                 'volume': data['volume']
#             })

#             # Filter for weekdays (Monday to Friday)
#             df = df[df['date'].dt.weekday < 5].sort_values('date')
#             df['date_only'] = df['date'].dt.date

#             if from_date and to_date:
#                 df = df[(df['date_only'] >= from_date.date()) & (df['date_only'] <= to_date.date())]
#             else:
#                 last_days = df['date_only'].drop_duplicates().sort_values().tail(days)
#                 df = df[df['date_only'].isin(last_days)]

#             df['rsi'] = calculate_rsi(df)['rsi']
#             df['date'] = df['date'].dt.strftime('%Y-%m-%d %H:%M:%S')
#             df = df.drop(columns=['date_only']).reset_index(drop=True)

#             return df[['date', 'open', 'high', 'low', 'close', 'volume', 'rsi']]
#         else:
#             logger.warning(f"No intraday data: {ohlc}")
#             return pd.DataFrame()

#     except Exception as e:
#         logger.error(f"Intraday error: {str(e)}")
#         traceback.print_exc()
#         return pd.DataFrame()

# def get_historical_daily_data(security_id, exchange_segment, instrument_type, from_date=None, to_date=None, days=10, expiry_code=0):
#     try:
#         check_token_expiry()
#         if to_date is None:
#             to_date = datetime.datetime.now()
#         elif isinstance(to_date, str):
#             to_date = parse_date(to_date)
#         if from_date is None:
#             from_date = to_date - datetime.timedelta(days=days * 2)
#         elif isinstance(from_date, str):
#             from_date = parse_date(from_date)

#         params = {
#             'security_id': str(security_id),
#             'exchange_segment': exchange_segment,
#             'instrument_type': instrument_type,
#             'from_date': from_date.strftime('%Y-%m-%d'),
#             'to_date': to_date.strftime('%Y-%m-%d'),
#             'expiry_code': expiry_code
#         }

#         logger.info(f"Fetching historical data for {security_id} with: {params}")
#         ohlc = dhan.historical_daily_data(**params)

#         if ohlc.get('status') == 'success' and isinstance(ohlc.get('data'), dict):
#             data = ohlc['data']
#             df = pd.DataFrame({
#                 'date': pd.to_datetime(data['timestamp'], unit='s').tz_localize('UTC').tz_convert('Asia/Kolkata'),
#                 'open': data['open'],
#                 'high': data['high'],
#                 'low': data['low'],
#                 'close': data['close'],
#                 'volume': data['volume']
#             })

#             # Filter for weekdays (Monday to Friday)
#             df = df[df['date'].dt.weekday < 5].sort_values('date')
#             df['date_only'] = df['date'].dt.date

#             if from_date and to_date:
#                 df = df[(df['date_only'] >= from_date.date()) & (df['date_only'] <= to_date.date())]
#             else:
#                 last_days = df['date_only'].drop_duplicates().sort_values().tail(days)
#                 df = df[df['date_only'].isin(last_days)]

#             df = calculate_moving_averages(df)
#             df['date'] = df['date'].dt.strftime('%Y-%m-%d')
#             df = df.drop(columns=['date_only']).reset_index(drop=True)

#             return df[['date', 'open', 'high', 'low', 'close', 'volume', 'sma', 'ema']]
#         else:
#             logger.warning(f"No historical data: {ohlc}")
#             return pd.DataFrame()

#     except Exception as e:
#         logger.error(f"Historical error: {str(e)}")
#         traceback.print_exc()
#         return pd.DataFrame()

# def validate_params(params):
#     errors = []
#     if 'symbol' not in params or not params['symbol']:
#         if 'security_id' not in params or not params['security_id']:
#             errors.append("either symbol or security_id is required")
#     if 'exchange_segment' not in params or params['exchange_segment'] not in ['NSE_EQ', 'BSE_EQ', 'NSE_FNO', 'BSE_FNO']:
#         errors.append("exchange_segment must be one of: NSE_EQ, BSE_EQ, NSE_FO, BSE_FO")
#     if 'instrument_type' not in params or params['instrument_type'] not in ['EQUITY', 'OPTFUT', 'OPTIDX']:
#         errors.append("instrument_type must be one of: EQUITY, FUTURE, OPTION")
#     if 'interval' in params and params['interval'] not in [1, 5, 15, 30, 60]:
#         errors.append("interval must be one of: 1, 5, 15, 30, 60")
#     if 'from_date' in params and params['from_date']:
#         try:
#             parse_date(params['from_date'])
#         except ValueError:
#             errors.append("from_date must be in YYYY-MM-DD format")
#     if 'to_date' in params and params['to_date']:
#         try:
#             parse_date(params['to_date'])
#         except ValueError:
#             errors.append("to_date must be in YYYY-MM-DD format")
#     if 'days' in params and (not isinstance(params['days'], int) or params['days'] <= 0):
#         errors.append("days must be a positive integer")
#     if 'expiry_code' in params and not isinstance(params['expiry_code'], int):
#         errors.append("expiry_code must be an integer")
#     return errors

# # Chart API
# chart_data_bp = Blueprint('chart_data', __name__)
# # @chart_data_bp.route('/chart_data', methods=['GET', 'POST'])
# # def chart_data():
# #     try:
# #         params = request.get_json() if request.method == 'POST' else request.args.to_dict()

# #         if 'days' in params and str(params['days']).isdigit():
# #             params['days'] = int(params['days'])
# #         if 'interval' in params and str(params['interval']).isdigit():
# #             params['interval'] = int(params['interval'])
# #         if 'expiry_code' in params and str(params['expiry_code']).isdigit():
# #             params['expiry_code'] = int(params['expiry_code'])

# #         params.setdefault('exchange_segment', 'NSE_EQ')
# #         params.setdefault('instrument_type', 'EQUITY')
# #         params.setdefault('days', 5)
# #         params.setdefault('interval', 5)
# #         params.setdefault('expiry_code', 0)
# #         params.setdefault('symbol', '')
# #         params.setdefault('security_id', '')
# #         params.setdefault('from_date', None)
# #         params.setdefault('to_date', None)

# #         errors = validate_params(params)
# #         if errors:
# #             logger.warning(f"Validation failed: {errors}")
# #             return jsonify({'error': 'Validation failed', 'details': errors}), 400

# #         symbol = params['symbol'].upper()
# #         security_id = params['security_id']
# #         if not security_id:
# #             security_id = SYMBOL_TO_SECURITY_ID.get(symbol)
# #             if not security_id:
# #                 return jsonify({'error': f"Symbol {symbol} not found in mapping"}), 400

# #         intraday_df = get_intraday_minute_data(
# #             security_id, params['exchange_segment'], params['instrument_type'],
# #             params['from_date'], params['to_date'], params['days'], params['interval']
# #         )

# #         historical_df = get_historical_daily_data(
# #             security_id, params['exchange_segment'], params['instrument_type'],
# #             params['from_date'], params['to_date'], params['days'], params['expiry_code']
# #         )

# #         results = {
# #             'intraday': intraday_df.to_dict(orient='records') if not intraday_df.empty else [],
# #             'historical': historical_df.to_dict(orient='records') if not historical_df.empty else []
# #         }

# #         logger.info(f"Data fetched for symbol/security_id {symbol}")
# #         return jsonify({'status': 'success', 'symbol': symbol, 'data': results})

# #     except Exception as e:
# #         logger.error(f"API Error: {str(e)}")
# #         traceback.print_exc()
# #         return jsonify({'error': str(e)}), 500


# @chart_data_bp.route('/chart_data', methods=['GET', 'POST'])
# def chart_data():
#     try:
#         params = request.get_json() if request.method == 'POST' else request.args.to_dict()

#         if 'days' in params and str(params['days']).isdigit():
#             params['days'] = int(params['days'])
#         if 'interval' in params and str(params['interval']).isdigit():
#             params['interval'] = int(params['interval'])
#         if 'expiry_code' in params and str(params['expiry_code']).isdigit():
#             params['expiry_code'] = int(params['expiry_code'])

#         only_indicators = str(params.get('only_indicators', False)).lower() in ['true', '1', 'yes']

#         params.setdefault('exchange_segment', 'NSE_EQ')
#         params.setdefault('instrument_type', 'EQUITY')
#         params.setdefault('days', 5)
#         params.setdefault('interval', 5)
#         params.setdefault('expiry_code', 0)
#         params.setdefault('symbol', '')
#         params.setdefault('security_id', '')
#         params.setdefault('from_date', None)
#         params.setdefault('to_date', None)

#         errors = validate_params(params)
#         if errors:
#             logger.warning(f"Validation failed: {errors}")
#             return jsonify({'error': 'Validation failed', 'details': errors}), 400

#         symbol = params['symbol'].upper()
#         security_id = params['security_id']
#         if not security_id:
#             security_id = SYMBOL_TO_SECURITY_ID.get(symbol)
#             if not security_id:
#                 return jsonify({'error': f"Symbol {symbol} not found in mapping"}), 400

#         intraday_df = get_intraday_minute_data(
#             security_id, params['exchange_segment'], params['instrument_type'],
#             params['from_date'], params['to_date'], params['days'], params['interval']
#         )

#         historical_df = get_historical_daily_data(
#             security_id, params['exchange_segment'], params['instrument_type'],
#             params['from_date'], params['to_date'], params['days'], params['expiry_code']
#         )

#         if only_indicators:
#             intraday_indicators = intraday_df[['date', 'rsi']].dropna().to_dict(orient='records') if not intraday_df.empty else []
#             historical_indicators = historical_df[['date', 'sma', 'ema']].dropna().to_dict(orient='records') if not historical_df.empty else []
#             print("intraday_indicators =====================", intraday_indicators)
#             print("historical_indicators ===================", historical_indicators)

#             return jsonify({
#                 'status': 'success',
#                 'symbol': symbol,
#                 'indicators': {
#                     'intraday': intraday_indicators,
#                     'historical': historical_indicators
#                 }
#             })

#         results = {
#             'intraday': intraday_df.to_dict(orient='records') if not intraday_df.empty else [],
#             'historical': historical_df.to_dict(orient='records') if not historical_df.empty else []
#         }

#         logger.info(f"Full data fetched for {symbol}")
#         return jsonify({'status': 'success', 'symbol': symbol, 'data': results})

#     except Exception as e:
#         logger.error(f"API Error: {str(e)}")
#         traceback.print_exc()
#         return jsonify({'error': str(e)}), 500






from flask import Flask, request, jsonify, Blueprint
from flask_cors import CORS
from dhanhq import dhanhq
import logging
import datetime
import pandas as pd
import traceback
from config import client_id, access_token
from db import get_db_connection
import json
import requests
from functools import lru_cache
from ratelimit import limits, sleep_and_retry
from werkzeug.exceptions import BadRequest

# Logging configuration
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize Dhan API Client
dhan = dhanhq(client_id, access_token)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Symbol to Security ID mapping (fallback)
SYMBOL_TO_SECURITY_ID = {
    "RELIANCE": "1333",
    "TCS": "10999",
    "INFY": "11536"
}

# Rate limiting: 60 requests per minute
CALLS = 60
RATE_LIMIT = 60

def refresh_access_token():
    # Placeholder for Dhan API token refresh
    try:
        response = requests.post(
            "https://api.dhan.co/auth/refresh",
            json={"client_id": client_id, "refresh_token": "your_refresh_token"}
        )
        if response.status_code == 200:
            new_token = response.json().get("access_token")
            logger.info("Access token refreshed successfully")
            return new_token
        else:
            logger.error(f"Failed to refresh token: {response.text}")
            raise ValueError("Token refresh failed")
    except Exception as e:
        logger.error(f"Token refresh error: {str(e)}")
        raise

def check_token_expiry():
    expiry_timestamp = 1747568314  # May 17, 2025 (fallback)
    current_timestamp = int(datetime.datetime.now().timestamp())
    if current_timestamp > expiry_timestamp:
        try:
            global access_token, dhan
            access_token = refresh_access_token()
            dhan = dhanhq(client_id, access_token)
            logger.info("Dhan client reinitialized with new token")
        except Exception as e:
            logger.error(f"Token refresh failed: {str(e)}")
            raise ValueError(f"Access token expired and refresh failed: {str(e)}")

def parse_date(date_str):
    try:
        return datetime.datetime.strptime(date_str, '%Y-%m-%d')
    except ValueError:
        raise BadRequest("Date must be in YYYY-MM-DD format")

@lru_cache(maxsize=128)
def get_security_id(symbol):
    symbol = symbol.upper()
    security_id = SYMBOL_TO_SECURITY_ID.get(symbol)
    if security_id:
        return security_id, symbol
    try:
        securities = dhan.fetch_security_list("compact")
        for s in securities:
            if s.get("symbol") == symbol:
                logger.info(f"Found security_id={s['security_id']} for symbol={symbol}")
                return s['security_id'], symbol
        logger.warning(f"No security_id found for symbol={symbol}")
        raise BadRequest(f"Symbol {symbol} not found")
    except Exception as e:
        logger.error(f"Error fetching security list: {str(e)}")
        raise BadRequest(f"Failed to fetch security_id for {symbol}: {str(e)}")

def calculate_rsi(df, period=14):
    logger.debug(f"Calculating RSI with period={period}")
    delta = df['close'].diff()
    gain = delta.where(delta > 0, 0)
    loss = -delta.where(delta < 0, 0)
    avg_gain = gain.rolling(window=period, min_periods=1).mean()
    avg_loss = loss.rolling(window=period, min_periods=1).mean()
    rs = avg_gain / avg_loss
    # Handle division by zero or infinite RS
    rs = rs.replace([float('inf'), -float('inf')], 0)
    df['rsi'] = 100 - (100 / (1 + rs))
    df['rsi'] = df['rsi'].fillna(0).replace([float('inf'), -float('inf')], 0)
    return df

def calculate_moving_averages(df, sma_period=20, ema_period=20):
    logger.debug(f"Calculating SMA={sma_period}, EMA={ema_period}")
    df['sma'] = df['close'].rolling(window=sma_period).mean()
    df['ema'] = df['close'].ewm(span=ema_period, adjust=False).mean()
    return df

@sleep_and_retry
@limits(calls=CALLS, period=RATE_LIMIT)
def get_intraday_minute_data(security_id, exchange_segment, instrument_type, from_date=None, to_date=None, days=5, interval=5, rsi_period=14):
    try:
        check_token_expiry()
        if to_date is None:
            to_date = datetime.datetime.now()
        elif isinstance(to_date, str):
            to_date = parse_date(to_date)
        if from_date is None:
            from_date = to_date - datetime.timedelta(days=days)
        elif isinstance(from_date, str):
            from_date = parse_date(from_date)

        params = {
            'security_id': str(security_id),
            'exchange_segment': exchange_segment,
            'instrument_type': instrument_type,
            'from_date': from_date.strftime('%Y-%m-%d'),
            'to_date': to_date.strftime('%Y-%m-%d'),
            'interval': interval
        }

        logger.info(f"Fetching intraday data for security_id={security_id}, params={params}")
        ohlc = dhan.intraday_minute_data(**params)

        if ohlc.get('status') == 'success' and isinstance(ohlc.get('data'), dict):
            data = ohlc['data']
            df = pd.DataFrame({
                'date': pd.to_datetime(data['timestamp'], unit='s').tz_localize('UTC').tz_convert('Asia/Kolkata'),
                'open': data['open'],
                'high': data['high'],
                'low': data['low'],
                'close': data['close'],
                'volume': data['volume']
            })

            df = df[df['date'].dt.weekday < 5]
            df = df[df['date'].dt.time.between(datetime.time(9, 15), datetime.time(15, 30))]
            df['date_only'] = df['date'].dt.date

            if from_date and to_date:
                df = df[(df['date_only'] >= from_date.date()) & (df['date_only'] <= to_date.date())]
            else:
                last_days = df['date_only'].drop_duplicates().sort_values().tail(days)
                df = df[df['date_only'].isin(last_days)]

            df = calculate_rsi(df, rsi_period)
            df['date'] = df['date'].dt.strftime('%Y-%m-%d %H:%M:%S')
            df = df.drop(columns=['date_only']).reset_index(drop=True)

            return df[['date', 'open', 'high', 'low', 'close', 'volume', 'rsi']]
        else:
            logger.warning(f"No intraday data: {ohlc}")
            return pd.DataFrame()

    except Exception as e:
        logger.error(f"Intraday error for security_id={security_id}: {str(e)}")
        traceback.print_exc()
        return pd.DataFrame()

@sleep_and_retry
@limits(calls=CALLS, period=RATE_LIMIT)
def get_historical_daily_data(security_id, exchange_segment, instrument_type, from_date=None, to_date=None, days=10, expiry_code=0, sma_period=20, ema_period=20, rsi_period=14):
    try:
        check_token_expiry()
        if to_date is None:
            to_date = datetime.datetime.now()
        elif isinstance(to_date, str):
            to_date = parse_date(to_date)
        if from_date is None:
            from_date = to_date - datetime.timedelta(days=days * 2)  # Extended to ensure enough data for RSI/SMA
        elif isinstance(from_date, str):
            from_date = parse_date(from_date)

        params = {
            'security_id': str(security_id),
            'exchange_segment': exchange_segment,
            'instrument_type': instrument_type,
            'from_date': from_date.strftime('%Y-%m-%d'),
            'to_date': to_date.strftime('%Y-%m-%d'),
            'expiry_code': expiry_code
        }

        logger.info(f"Fetching historical data for security_id={security_id}, params={params}")
        ohlc = dhan.historical_daily_data(**params)

        if ohlc.get('status') == 'success' and isinstance(ohlc.get('data'), dict):
            data = ohlc['data']
            df = pd.DataFrame({
                'date': pd.to_datetime(data['timestamp'], unit='s').tz_localize('UTC').tz_convert('Asia/Kolkata'),
                'open': data['open'],
                'high': data['high'],
                'low': data['low'],
                'close': data['close'],
                'volume': data['volume']
            })

            df = df[df['date'].dt.weekday < 5]
            df['date_only'] = df['date'].dt.date

            if from_date and to_date:
                df = df[(df['date_only'] >= from_date.date()) & (df['date_only'] <= to_date.date())]
            else:
                last_days = df['date_only'].drop_duplicates().sort_values().tail(days)
                df = df[df['date_only'].isin(last_days)]

            df = calculate_moving_averages(df, sma_period, ema_period)
            df = calculate_rsi(df, rsi_period)  # Added RSI calculation
            df['date'] = df['date'].dt.strftime('%Y-%m-%d')
            df = df.drop(columns=['date_only']).reset_index(drop=True)

            return df[['date', 'open', 'high', 'low', 'close', 'volume', 'sma', 'ema', 'rsi']]
        else:
            logger.warning(f"No historical data: {ohlc}")
            return pd.DataFrame()

    except Exception as e:
        logger.error(f"Historical error for security_id={security_id}: {str(e)}")
        traceback.print_exc()
        return pd.DataFrame()

def validate_params(params):
    errors = []
    if 'symbol' not in params or not params['symbol']:
        if 'security_id' not in params or not params['security_id']:
            errors.append("either symbol or security_id is required")
    if 'exchange_segment' not in params or params['exchange_segment'] not in ['NSE_EQ', 'BSE_EQ', 'NSE_FNO', 'BSE_FNO']:
        errors.append("exchange_segment must be one of: NSE_EQ, BSE_EQ, NSE_FO, BSE_FO")
    if 'instrument_type' not in params or params['instrument_type'] not in ['EQUITY', 'OPTFUT', 'OPTIDX']:
        errors.append("instrument_type must be one of: EQUITY, FUTURE, OPTION")
    if 'interval' in params and params['interval'] not in [1, 5, 15, 30, 60]:
        errors.append("interval must be one of: 1, 5, 15, 30, 60")
    if 'from_date' in params and params['from_date']:
        try:
            parse_date(params['from_date'])
        except ValueError:
            errors.append("from_date must be in YYYY-MM-DD format")
    if 'to_date' in params and params['to_date']:
        try:
            parse_date(params['to_date'])
        except ValueError:
            errors.append("to_date must be in YYYY-MM-DD format")
    if 'days' in params and (not isinstance(params['days'], int) or params['days'] <= 0):
        errors.append("days must be a positive integer")
    if 'expiry_code' in params and not isinstance(params['expiry_code'], int):
        errors.append("expiry_code must be an integer")
    if 'rsi_period' in params and (not isinstance(params['rsi_period'], int) or params['rsi_period'] <= 0):
        errors.append("rsi_period must be a positive integer")
    if 'sma_period' in params and (not isinstance(params['sma_period'], int) or params['sma_period'] <= 0):
        errors.append("sma_period must be a positive integer")
    if 'ema_period' in params and (not isinstance(params['ema_period'], int) or params['ema_period'] <= 0):
        errors.append("ema_period must be a positive integer")
    if 'fetch_type' in params and params['fetch_type'] not in ['all', 'intraday', 'historical']:
        errors.append("fetch_type must be one of: all, intraday, historical")
    return errors

# Chart API
chart_data_bp = Blueprint('chart_data', __name__)

@chart_data_bp.route('/chart_data', methods=['GET', 'POST'])
@sleep_and_retry
@limits(calls=CALLS, period=RATE_LIMIT)
def chart_data():
    try:
        if request.method == 'POST':
            try:
                params = request.get_json(silent=True) or {}
            except BadRequest as e:
                logger.warning(f"Invalid JSON in POST request: {str(e)}")
                return jsonify({'error': 'Invalid JSON', 'details': str(e)}), 400
        else:
            params = request.args.to_dict()

        for key in ['days', 'interval', 'expiry_code', 'rsi_period', 'sma_period', 'ema_period']:
            if key in params and str(params[key]).isdigit():
                params[key] = int(params[key])

        only_indicators = params.get('only_indicators', 'false').lower() == 'true'

        params.setdefault('exchange_segment', 'NSE_EQ')
        params.setdefault('instrument_type', 'EQUITY')
        params.setdefault('days', 5)
        params.setdefault('interval', 5)
        params.setdefault('expiry_code', 0)
        params.setdefault('symbol', '')
        params.setdefault('security_id', '')
        params.setdefault('from_date', None)
        params.setdefault('to_date', None)
        params.setdefault('rsi_period', 14)
        params.setdefault('sma_period', 20)
        params.setdefault('ema_period', 20)
        params.setdefault('fetch_type', 'all')

        errors = validate_params(params)
        if errors:
            logger.warning(f"Validation failed: {errors}")
            return jsonify({'error': 'Validation failed', 'details': errors}), 400

        symbol = params['symbol'].upper()
        security_id = params['security_id']
        if not security_id:
            security_id, symbol = get_security_id(symbol)
        else:
            # Reverse lookup symbol from security_id
            try:
                securities = dhan.fetch_security_list("compact")
                for s in securities:
                    if s.get("security_id") == str(security_id):
                        symbol = s.get("symbol", symbol)
                        break
            except Exception as e:
                logger.warning(f"Could not resolve symbol for security_id={security_id}: {str(e)}")

        if params['fetch_type'] in ['all', 'intraday']:
            intraday_df = get_intraday_minute_data(
                security_id, params['exchange_segment'], params['instrument_type'],
                params['from_date'], params['to_date'], params['days'], params['interval'],
                params['rsi_period']
            )
        else:
            intraday_df = pd.DataFrame()

        if params['fetch_type'] in ['all', 'historical']:
            historical_df = get_historical_daily_data(
                security_id, params['exchange_segment'], params['instrument_type'],
                params['from_date'], params['to_date'], params['days'], params['expiry_code'],
                params['sma_period'], params['ema_period'], params['rsi_period']
            )
        else:
            historical_df = pd.DataFrame()

        if only_indicators:
            intraday_indicators = intraday_df[['date', 'rsi']].dropna().to_dict(orient='records') if not intraday_df.empty else []
            historical_indicators = historical_df[['date', 'sma', 'ema', 'rsi']].dropna().to_dict(orient='records') if not historical_df.empty else []
            logger.debug(f"Returning indicators for symbol={symbol}: intraday={len(intraday_indicators)}, historical={len(historical_indicators)}")
            return jsonify({
                'status': 'success',
                'symbol': symbol,
                'indicators': {
                    'intraday': intraday_indicators,
                    'historical': historical_indicators
                }
            })

        results = {
            'intraday': intraday_df.to_dict(orient='records') if not intraday_df.empty else [],
            'historical': historical_df.to_dict(orient='records') if not historical_df.empty else []
        }

        logger.info(f"Full data fetched for symbol={symbol}, security_id={security_id}")
        return jsonify({'status': 'success', 'symbol': symbol, 'data': results})

    except Exception as e:
        logger.error(f"API Error for params={params}: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

