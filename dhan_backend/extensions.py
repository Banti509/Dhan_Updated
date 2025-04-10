# from flask_socketio import SocketIO
# from flask_sqlalchemy import SQLAlchemy

# # Initialize socketio instance but do not attach it to app yet
# # socketio = SocketIO(cors_allowed_origins="*")
# socketio = SocketIO()
# db = SQLAlchemy()


# from flask_socketio import SocketIO

# # ✅ Create a separate instance of socketio
# socketio = SocketIO(cors_allowed_origins="*", async_mode="eventlet")



from flask_socketio import SocketIO

socketio = SocketIO(cors_allowed_origins="*")  # Allow React origin

