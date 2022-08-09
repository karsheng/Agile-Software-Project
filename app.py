from functools import wraps
import json
from firebase_admin import credentials, auth, db
import firebase_admin

import pandas as pd
from flask import *
from dotenv import load_dotenv

from src.utils import get_rise_timestamps, get_crash_timestamps
from src.viz import subjectivity_polarity_plot, price_polarity_plot

import os

app = Flask(__name__, static_folder='web-app/build', static_url_path='/')

load_dotenv()

# Firebase config start
# Firebase Api credentials for authorization. TODO set them as environment variables instead of passing directly.

cred_dict = {
    'type': os.environ['type'],
    'project_id': os.environ['project_id'],
    'private_key_id': os.environ['private_key_id'],
    'private_key': os.environ.get('private_key').encode('latin1').decode('unicode_escape'),
    'client_email': os.environ['client_email'],
    'client_id': os.environ['client_id'],
    'auth_uri': os.environ['auth_uri'],
    'token_uri': os.environ['token_uri'],
    'auth_provider_x509_cert_url': os.environ['auth_provider_x509_cert_url'],
    'client_x509_cert_url': os.environ['client_x509_cert_url']
}


cred = credentials.Certificate(cred_dict)

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
        f'cryptos/{product}/prices').order_by_child('date').start_at(start).end_at(end)

    ref2 = db.reference(
        f'cryptos/{product}/polarity').order_by_child('date').start_at(start).end_at(end)

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
        f'cryptos/{product}/tweets').order_by_child('date').start_at(start).end_at(end)

    df = pd.DataFrame(ref.get().values())
    df['date'] = pd.to_datetime(df['date'])
    fig = subjectivity_polarity_plot(df)
    return json.loads(fig.to_json())


@app.route('/api/metrics', methods=["GET"])
@check_token
def get_metrics():
    args = request.args
    product = args.get('product')
    ref1 = db.reference(
        f'cryptos/{product}/prices').order_by_child('date').limit_to_last(7)
    prices = pd.DataFrame(ref1.get().values())
    new_price, old_price = prices['price (USD)'].iloc[0], prices['price (USD)'].iloc[-1]
    price_pct = new_price/old_price*100 if old_price != 0 else 0

    ref2 = db.reference(
        f'cryptos/{product}/polarity').order_by_child('date').limit_to_last(7)
    tweets_polarity = pd.DataFrame(ref2.get().values())
    new_tpolarity, old_tpolarity = tweets_polarity['weighted_polarity'].iloc[
        0], tweets_polarity['weighted_polarity'].iloc[-1]
    tpolarity_pct = new_tpolarity/old_tpolarity*100 if old_tpolarity != 0 else 0

    new_npolarity = -0.74567
    npolarity_pct = -27.3545
    return {
        'prices': {
            'currentValue': new_price,
            'percentage': f'{price_pct:.1f}'
        },
        'tweets': {
            'currentValue': f'{new_tpolarity:.2f}',
            'percentage': f'{tpolarity_pct:.1f}'
        },
        'news': {
            'currentValue': f'{new_npolarity:.2f}',
            'percentage': f'{npolarity_pct:.1f}'
        }
    }


@app.errorhandler(404)
def not_found(e):
    return app.send_static_file('index.html')


@app.route('/')
def index():
    return app.send_static_file('index.html')


if __name__ == '__main__':
    app.run()
