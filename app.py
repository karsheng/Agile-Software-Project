from functools import wraps
import json
from firebase_admin import credentials, auth, db
import firebase_admin

import pandas as pd
import plotly.express as px
from flask import *
from dotenv import load_dotenv

from src.utils import get_rise_timestamps, get_crash_timestamps
from src.viz import subjectivity_polarity_plot, price_polarity_plot

import os

app = Flask(__name__, static_folder='web-app/build', static_url_path='/')

load_dotenv()

# Firebase config start
# Firebase Api credentials for authorization. TODO set them as environment variables instead of passing directly.
cred = credentials.Certificate('fbAdminConfig.json')
firebase_admin.initialize_app(cred, {
    'databaseURL': os.environ['databaseURL']
})
# Firebase config end


def check_token(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if not request.headers.get('authorization'):
            return {'message': 'No token provided'}, 400
        try:
            user = auth.verify_id_token(request.headers['authorization'])
            request.user = user
        except Exception as e:
            print(e)
            return {'message': 'Invalid token provided.'}, 400
        return f(*args, **kwargs)
    return wrap


@app.route('/api/price_viz', methods=['GET'])
@check_token
def get_product_price_viz():
    args = request.args
    product = args.get('product')
    start = args.get('start')
    end = args.get('end')

    ref1 = db.reference(
        f'/{product}/prices').order_by_child('date').start_at(start).end_at(end)

    ref2 = db.reference(
        f'/{product}/polarity').order_by_child('date').start_at(start).end_at(end)

    prices = pd.DataFrame(ref1.get().values())
    prices['date'] = pd.to_datetime(prices['date'])
    prices = prices.set_index('date').squeeze()

    polarity = pd.DataFrame(ref2.get().values())
    polarity['date'] = pd.to_datetime(polarity['date'])
    polarity = polarity.set_index('date').squeeze()

    threshold = 0.12
    ts = prices.resample('7D').first()

    rise_timestamps = get_rise_timestamps(ts, threshold)
    crash_timestamps = get_crash_timestamps(ts, threshold)

    fig = price_polarity_plot(
        prices, polarity, rise_timestamps, crash_timestamps)
    return json.loads(fig.to_json())


@app.route('/api/sentiment', methods=["GET"])
@check_token
def get_sentiment_viz():
    args = request.args
    product = args.get('product')
    start = args.get('start')
    end = args.get('end')

    ref = db.reference(
        f'/{product}/tweets').order_by_child('date').start_at(start).end_at(end)

    df = pd.DataFrame(ref.get().values())
    df['date'] = pd.to_datetime(df['date'])
    fig = subjectivity_polarity_plot(df, 'Tweets sentiment')
    return json.loads(fig.to_json())


@app.route('/')
def index():
    return render_template('index.html')


if __name__ == '__main__':
    app.run()
