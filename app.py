from functools import wraps
import json
import pickle
import time
import pyrebase
from firebase_admin import credentials, auth
import firebase_admin

import pandas as pd
import plotly.express as px
from flask import *
from dotenv import load_dotenv

from src.utils import get_rise_timestamps
import os

app = Flask(__name__, static_folder='web-app/build', static_url_path='/')

load_dotenv()
fb_config = {
    'apiKey': os.environ['apiKey'],
    'authDomain': os.environ['authDomain'],
    'projectId': os.environ['projectId'],
    'storageBucket': os.environ['storageBucket'],
    'messagingSenderId': os.environ['messagingSenderId'],
    'appId': os.environ['appId'],
    'measurementId': os.environ['measurementId'],
    'databaseURL': os.environ['databaseURL'],
}

# Firebase config start
# Firebase Api credentials for authorization. TODO set them as environment variables instead of passing directly.
cred = credentials.Certificate('fbAdminConfig.json')
firebase = firebase_admin.initialize_app(cred)
pb = pyrebase.initialize_app(fb_config)

# Firebase config end

def check_token(f):
    @wraps(f)
    def wrap(*args,**kwargs):
        if not request.headers.get('authorization'):
            return {'message': 'No token provided'},400
        try:
            user = auth.verify_id_token(request.headers['authorization'])
            print(user)
            print('hello')
            request.user = user
        except Exception as e:
            print(e)
            return {'message':'Invalid token provided.'},400
        return f(*args, **kwargs)
    return wrap

@app.route('/api/time')
@check_token
def get_current_time():
    return {'time': time.time()}


@app.route('/api/btc_viz')
@check_token
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
@check_token
def get_btc_sentiment():
    fig = pickle.load(open('data/sentiment.pickle', 'rb'))
    return json.loads(fig.to_json())


#Api route to sign up a new user
@app.route('/api/signup')
def signup():
    email = request.form.get('email')
    password = request.form.get('password')
    if email is None or password is None:
        return {'message': 'Error missing email or password'}, 400
    try:
        user = auth.create_user(
               email=email,
               password=password
        )
        return {'message': f'Successfully created user {user.uid}'}, 200
    except Exception as e:
        return {'message': 'Error creating user'}, 400


#Api route to get a new token for a valid user
@app.route('/api/signin')
def signin():
    email = request.form.get('email')
    password = request.form.get('password')
    try:
        user = pb.auth().sign_in_with_email_and_password(email, password)
        jwt = user['idToken']
        return {'token': jwt}, 200
    except:
        return {'message': 'There was an error logging in'},400

@app.route('/api/userinfo')
@check_token
def userinfo():
    return {'data': 'hello'}, 200


# Default route has been updated to the login page
@app.route('/')
def index():
    return render_template('index.html')


if __name__ == '__main__':
    app.run()
