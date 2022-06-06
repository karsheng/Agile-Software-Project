import time
from flask import Flask
from src.utils import get_rise_timestamps
import pandas as pd
import plotly.express as px
import json
import pickle

app = Flask(__name__, static_folder='web-app/build', static_url_path='/')

@app.route('/api/time')
def get_current_time():
    return {'time': time.time()}

@app.route('/api/btc_viz')
def get_btc_viz():
    btc_prices = pd.read_csv("data/btc_prices.csv", parse_dates=["Timestamp"]).set_index("Timestamp")
    threshold = 0.10
    ts = btc_prices.resample('7D').first()

    rise_timestamps = get_rise_timestamps(ts, threshold)
    fig = px.line(btc_prices)
    for t in rise_timestamps:
        fig.add_vrect(
            x0=t, x1=t + pd.Timedelta("7d"),
            fillcolor="lightgreen", opacity=0.5,
            layer="below", line_width=1,
        )
    return json.loads(fig.to_json())

@app.route('/api/btc_sentiment')
def get_btc_sentiment():
    fig = pickle.load(open('data/sentiment.pickle', 'rb'))
    return json.loads(fig.to_json())

@app.route('/')
def index():
    return app.send_static_file('index.html')