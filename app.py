import json
import pickle
import time
import pyrebase

import pandas as pd
import plotly.express as px
from flask import *

from src.utils import get_rise_timestamps

app = Flask(__name__, static_folder='web-app/build', static_url_path='/')

# Firebase config start
# Firebase Api credentials for authorization. TODO set them as environment variables instead of passing directly.
config = {
    'apiKey': 'AIzaSyBNExpa-j77UVxVP5hlaPl3I4lDqLf84jc',
    'authDomain': 'moneymood-662be.firebaseapp.com',
    'projectId': 'moneymood-662be',
    'storageBucket': 'moneymood-662be.appspot.com',
    'messagingSenderId': '126870422755',
    'appId': '1:126870422755:web:d655d169372ac38132f1d6',
    'measurementId': 'G-6RP6EPN2G2',
    'databaseURL': " "
}

firebase = pyrebase.initialize_app(config)  # Authenticate the api

auth = firebase.auth()


# Firebase config end


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


# App route to the login page, Upon successful authentication routes to homepage along with custom user session token.
'''TODO Implement further verification, Probably with session tokens feature of firebase,only allow user with valid 
tokens to view data. '''


@app.route('/login', methods=['GET', 'POST'])
def login():
    unsuccessful = 'Please check your credentials'
    if request.method == 'POST':
        email = request.form['Email']
        password = request.form['password']
        try:
            auth.sign_in_with_email_and_password(email, password)
            return app.send_static_file('index.html')
        except:
            return render_template('login.html', us=unsuccessful)

    return render_template('login.html')


# App route to create a user account with email and password.
@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        email = request.form['Email']
        password = request.form['password']
        auth.create_user_with_email_and_password(email, password)
        return app.send_static_file('index.html')

    return render_template('signup.html')


# Default route has been updated to the login page
@app.route('/')
def index():
    return render_template('login.html')


if __name__ == '__main__':
    app.run()
