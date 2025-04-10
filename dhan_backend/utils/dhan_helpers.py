import hmac
import hashlib
import urllib.parse
import os
import requests
from dotenv import load_dotenv
from config import access_token, client_id

load_dotenv()

# Binance API Configuration
BASE_URL = "https://api.dhan.co/v2"

def generate_signature(params):
    query_string = urllib.parse.urlencode(params)
    return hmac.new(
        access_token.encode('utf-8'),
        query_string.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
