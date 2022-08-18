from functools import wraps
import json
from firebase_admin import auth, db

import pandas as pd
import numpy as np
from flask import *

from src.utils import get_rise_timestamps, get_crash_timestamps
from src.viz import subjectivity_polarity_plot, price_polarity_plot
from src.firebase_ad import init_firebase


app = Flask(__name__, static_folder='web-app/build', static_url_path='/')

init_firebase()


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
    try:
        args = request.args
        product = args.get('product')
        start = args.get('start')
        end = args.get('end')

        ref1 = db.reference(
            f'cryptos/{product}/prices').order_by_child('date').start_at(start).end_at(end)

        ref2 = db.reference(
            f'cryptos/{product}/polarity').order_by_child('date').start_at(start).end_at(end)

        ref3 = db.reference(
            f'cryptos/{product}/news_polarity').order_by_child('date').start_at(start).end_at(end)

        prices = pd.DataFrame(ref1.get().values())
        if prices.shape[0] > 0:
            prices['date'] = pd.to_datetime(prices['date'])
            prices = prices.set_index('date').squeeze()

        tweets_polarity = pd.DataFrame(ref2.get().values())
        if tweets_polarity.shape[0] > 0:
            tweets_polarity['date'] = pd.to_datetime(tweets_polarity['date'])
            tweets_polarity = tweets_polarity.set_index('date').squeeze()

        news_polarity = pd.DataFrame(ref3.get().values())
        if news_polarity.shape[0] > 0:
            news_polarity['date'] = pd.to_datetime(news_polarity['date'])
            news_polarity = news_polarity.set_index('date').squeeze()

        threshold = 0.12
        ts = prices.resample('7D').first()

        rise_timestamps = get_rise_timestamps(ts, threshold)
        crash_timestamps = get_crash_timestamps(ts, threshold)

        fig = price_polarity_plot(
            prices, tweets_polarity, news_polarity, rise_timestamps, crash_timestamps)
        return json.loads(fig.to_json())
    except Exception as e:
        print(e)
        return {"error": "Something went wrong when requesting price data."}, 400


@app.route('/api/tweets_sentiment', methods=["GET"])
@check_token
def get_tweets_sentiment_viz():
    try:
        args = request.args
        product = args.get('product')
        start = args.get('start')
        end = args.get('end')

        ref = db.reference(
            f'cryptos/{product}/tweets').order_by_child('date').start_at(start).end_at(end)

        df = pd.DataFrame(ref.get().values())
        df['date'] = pd.to_datetime(df['date'])
        df = df.drop_duplicates(['user_followers', 'text']
                                ).sort_values(by=['date', 'sentiment'], ascending=False)

        size = np.log(df["user_followers"].astype(float) + 2) / np.log(1.1)

        hover_name = 'text'
        hover_data = ['date', 'user_followers']
        fig = subjectivity_polarity_plot(df, hover_name, hover_data, size)

        return json.loads(fig.to_json())
    except Exception as e:
        print(e)
        return {"error": "Something went wrong when requesting tweets data."}, 400


@app.route('/api/news_sentiment', methods=["GET"])
@check_token
def get_news_sentiment_viz():
    try:
        args = request.args
        product = args.get('product')
        start = args.get('start')
        end = args.get('end')

        ref = db.reference(
            f'cryptos/{product}/news').order_by_child('date').start_at(start).end_at(end)

        df = pd.DataFrame(ref.get().values())
        df['date'] = pd.to_datetime(df['date'])
        df = df.drop_duplicates(['title']).sort_values(
            by=['date', 'sentiment'], ascending=False)

        hover_name = 'title'
        hover_data = ['date', 'publisher', 'link']
        fig = subjectivity_polarity_plot(df, hover_name, hover_data)

        return {'fig': json.loads(fig.to_json()), 'publishers': sorted(list(df['publisher'].unique()))}
    except Exception as e:
        print(e)
        return {"error": "Something went wrong when requesting news data."}, 400


@app.route('/api/metrics', methods=["GET"])
@check_token
def get_metrics():
    try:
        args = request.args
        product = args.get('product')

        # price
        ref1 = db.reference(
            f'cryptos/{product}/prices').order_by_child('date').limit_to_last(7)
        prices = pd.DataFrame(ref1.get().values())
        new_price, old_price = prices['price (USD)'].iloc[-1], prices['price (USD)'].iloc[0]
        price_pct = new_price/old_price*100 if old_price != 0 else 0

        # tweets
        ref2 = db.reference(
            f'cryptos/{product}/polarity').order_by_child('date').limit_to_last(7)
        tweets_polarity = pd.DataFrame(ref2.get().values())
        new_tpolarity, old_tpolarity = tweets_polarity['weighted_polarity'].iloc[
            -1], tweets_polarity['weighted_polarity'].iloc[0]
        tpolarity_pct = new_tpolarity/old_tpolarity*100 if old_tpolarity != 0 else 0

        # news
        ref3 = db.reference(
            f'cryptos/{product}/news_polarity').order_by_child('date').limit_to_last(7)
        news_polarity = pd.DataFrame(ref3.get().values())

        new_npolarity, old_npolarity = news_polarity['polarity'].iloc[
            -1], news_polarity['polarity'].iloc[0]
        npolarity_pct = new_npolarity/old_npolarity*100 if old_npolarity != 0 else 0

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
    except Exception as e:
        print(e)
        return {"error": "Something went wrong when requesting metrics data."}, 400


@app.errorhandler(404)
def not_found(e):
    return app.send_static_file('index.html')


@app.route('/')
def index():
    return app.send_static_file('index.html')


if __name__ == '__main__':
    app.run()
