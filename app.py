import time
from flask import Flask
from src.viz import generate_viz_data

app = Flask(__name__, static_folder='web-app/build', static_url_path='/')

@app.route('/time')
def get_current_time():
    return {'time': time.time()}

@app.route('/viz')
def get_current_viz():
    return generate_viz_data()

@app.route('/')
def index():
    return app.send_static_file('index.html')