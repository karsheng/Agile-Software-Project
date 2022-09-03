#!/usr/bin/env python
# coding: utf-8

# In[1]:


import sys
sys.path.append("../")


# In[2]:


import pandas as pd
import os
from src.utils import *
from src.firebase_ad import init_firebase
from firebase_admin import auth, db


from dotenv import load_dotenv
import requests
load_dotenv()
import time
import re

import json


# In[3]:


init_firebase()


# In[4]:


CRYPTO_BASE = '../data/01_raw/cryptos/news'
STOCKS_BASE = '../data/01_raw/stocks/news'


# # Cryptos

# ## `news`

# In[46]:


dfs = {}
for prod in os.listdir(CRYPTO_BASE):
    path = f'{CRYPTO_BASE}/{prod}'
    temp = []
    
    sorted_paths = sorted(os.listdir(path))
    last_date = sorted_paths[0][:10] # default last date to first date
    
    # get last date from db
    ref = db.reference(f'cryptos/{prod}/news').order_by_child('date').limit_to_last(1).get()
    
    ref = None
    if ref:
        last_date = list(ref.values())[0]['date']
        print(f'{prod} last date: {last_date}.')
    else: 
        print(f'{prod} has no last date.')


    # get filenames based on last date
    filenames = [p for p in sorted_paths if p[:10] > last_date]
    
    # parse the csv as df
    for filename in filenames:
        try:
            temp.append(pd.read_csv(f'{path}/{filename}'))
        except Exception as e:
            print(f"Problem with {prod.upper()} {filename}: {e}")
    if len(temp) > 0:
        df = pd.concat(temp).reset_index(drop=True)
        cols = {c: c.lower() for c in df.columns}
        df = df.rename(columns=cols)
        dfs[prod] = df
    
    else:
        dfs[prod] = None
   


# In[47]:


def compute_sentiments(df):
    df['polarity'] = df['title'].apply(get_polarity)
    df['subjectivity'] = df['title'].apply(get_subjectivity)
    df['sentiment'] = df['polarity'].apply(get_sentiment)
    return df


# In[48]:


for prod, df in dfs.items():
    print('Computing sentiments for:', prod)
    dfs[prod] = compute_sentiments(df)


# In[49]:


cryptos = {}
for prod, df in dfs.items():
    cryptos[prod] = {'news': df.fillna('').to_dict(orient='records')}


# In[50]:


# btc bulk
btc_news_bulk = pd.read_csv('../data/01_raw/cryptos/news_bulk/btc.csv')
btc_news_bulk['Date'] = pd.to_datetime(btc_news_bulk['Date'], dayfirst=True).dt.strftime('%Y-%m-%d')
btc_news_bulk = btc_news_bulk.drop(columns='Snippet')
cols = {c: c.lower() for c in btc_news_bulk.columns}
btc_news_bulk = btc_news_bulk.rename(columns=cols)
btc_news_bulk = compute_sentiments(btc_news_bulk)
cryptos['btc']['news'] = pd.concat([btc_news_bulk, dfs['btc'].drop(columns='unnamed: 0')]).to_dict(orient='records')


# ## `news_polarity`

# In[51]:


for prod, df in dfs.items():
    cryptos[prod]['news_polarity'] = df.groupby('date').mean()['polarity'].reset_index().to_dict(orient='records')


# ## `price`

# In[52]:


def get_price_data(curr, api_key = os.environ['ALPHA_VANTAGE_API_KEY'], stock=False):
    url = f"https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol={curr}&market=USD&apikey=f{api_key}"
    if stock:
        url = f"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={curr}&apikey={api_key}"
    print(url)
    res = requests.get(url)
    json = res.json()
    data = []
    for date, prices in json['Time Series (Digital Currency Daily)'].items():
        d = prices
        d['date'] = date
        data.append(d)
    df = pd.DataFrame(data)
    df = df[['date', '4b. close (USD)']].rename(columns={'4b. close (USD)': 'price (USD)'})
    df['price (USD)'] = df['price (USD)'].astype(float)
    
    return df


# In[63]:


for prod in dfs.keys():
    try:
        cryptos[prod]['prices'] = get_price_data(prod).to_dict(orient='records')
        time.sleep(5)
    except Exception as e:
        print(prod, e)


# ## `tweets`

# In[56]:


# treat bulk
tweets = {}
TWEETS_BULK_BASE = '../data/01_raw/cryptos/tweets_bulk'

for file in os.listdir(TWEETS_BULK_BASE):
    prod = file[:-4]
    print(prod)
    df = pd.read_csv(f'{TWEETS_BULK_BASE}/{file}')
    df['sentiment'] = df['polarity'].apply(get_sentiment)
    df = df.fillna('')
    unnamed = [c for c in df.columns if 'unnamed' in c]
    if len(unnamed):
        df = df.drop(columns=unnamed[0])
    mask = df['date'] >= '2021-01-01'
    df = df[mask]
    df = df.sort_values('date')
    df = df.drop_duplicates()
    tweets[prod] = df


# In[57]:


for prod, df in tweets.items():
    cryptos[prod]['tweets'] = df.to_dict(orient='records')


# ## `tweets_polarity`

# In[58]:


for prod, df in tweets.items():
    followers = df.groupby('date').sum()['user_followers']
    wdf = df[['date']]
    wdf['weighted_polarity'] = df.apply(lambda x:  x['polarity'] * x['user_followers'] / followers.loc[x['date']], axis=1)
    wdf = wdf.groupby('date').sum().reset_index()
    cryptos[prod]['polarity'] = wdf.to_dict(orient='records') # polarity instead of tweet polarity


# In[62]:


# generate JSON
with open("../data/02_upload/cryptos.json", "w") as outfile:
    json.dump(cryptos, outfile)


# In[ ]:


db.reference('cryptos/').set(cryptos)


# # Stocks

# In[5]:


def get_stock_price_data(curr, api_key = os.environ['ALPHA_VANTAGE_API_KEY']):
    url = f"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={curr}&apikey={api_key}&outputsize=full"
    print(url)
    res = requests.get(url)
    json = res.json()
    data = []
    for date, prices in json['Time Series (Daily)'].items():
        d = prices
        d['date'] = date
        data.append(d)
    df = pd.DataFrame(data)
    df = df[['date', '4. close']].rename(columns={'4. close': 'price (USD)'})
    df['price (USD)'] = df['price (USD)'].astype(float)
    df = df.sort_values('date')
    mask = df['date'] >= '2021-01-01'
    df = df[mask]
    return df


# In[6]:


stocks = {}


# ## `news`

# In[8]:


dfs = {}
for prod in os.listdir(STOCKS_BASE):
    path = f'{STOCKS_BASE}/{prod}'
    temp = []
    
    sorted_paths = sorted(os.listdir(path))
    last_date = sorted_paths[0][:10] # default last date to first date
    
    # get last date from db
    ref = db.reference(f'stocks/{prod}/news').order_by_child('date').limit_to_last(1).get()
    
    ref = None
    if ref:
        last_date = list(ref.values())[0]['date']
        print(f'{prod} last date: {last_date}.')
    else: 
        print(f'{prod} has no last date.')


    # get filenames based on last date
    filenames = [p for p in sorted_paths if p[:10] > last_date]
    
    # parse the csv as df
    for filename in filenames:
        try:
            temp.append(pd.read_csv(f'{path}/{filename}'))
        except Exception as e:
            print(f"Problem with {prod.upper()} {filename}: {e}")
    if len(temp) > 0:
        df = pd.concat(temp).reset_index(drop=True)
        cols = {c: c.lower() for c in df.columns}
        df = df.rename(columns=cols)
        dfs[prod] = df
    
    else:
        dfs[prod] = None
   


# In[11]:


for prod, df in dfs.items():
    print('Computing sentiments for:', prod)
    dfs[prod] = compute_sentiments(df)


# In[28]:


stocks = {}
for prod, df in dfs.items():
    if 'unnamed: 0' in df.columns:
        df = df.drop(columns='unnamed: 0')
    stocks[prod] = {'news': df.fillna('').to_dict(orient='records')}


# ## `news_polarity`

# In[29]:


for prod, df in dfs.items():
    if prod not in stocks.keys():
        stocks[prod] = {}
    stocks[prod]['news_polarity'] = df.groupby('date').mean()['polarity'].reset_index().to_dict(orient='records')


# ## `prices`

# In[34]:


for prod in dfs.keys():
    try:
        time.sleep(5)
        stocks[prod]['prices'] = get_stock_price_data(prod).to_dict(orient='records')
    except Exception as e:
        print(prod, e)


# ## `tweets`

# In[35]:


# treat bulk
tweets = {}
TWEETS_BULK_BASE = '../data/01_raw/stocks/tweets_bulk'

for file in os.listdir(TWEETS_BULK_BASE):
    prod = file[:-4]
    print(prod)
    df = pd.read_csv(f'{TWEETS_BULK_BASE}/{file}')
    df['sentiment'] = df['polarity'].apply(get_sentiment)
    df = df.fillna('')
    df = df.drop(columns='Unnamed: 0')
    df['date'] = df['date'].apply(lambda x: x[:10])
    mask = df['date'] >= '2021-01-01'
    df = df[mask]
    df = df.sort_values('date')
    df = df.drop_duplicates()
    tweets[prod] = df


# In[36]:


for prod, df in tweets.items():
    if not stocks.get(prod):
        stocks[prod] = {}
    stocks[prod]['tweets'] = df.to_dict(orient='records') 


# ## `tweets_polarity`

# In[37]:


for prod, df in tweets.items():
    followers = df.groupby('date').sum()['user_followers']
    wdf = df[['date']]
    wdf['weighted_polarity'] = df.apply(lambda x:  x['polarity'] * x['user_followers'] / followers.loc[x['date']], axis=1)
    wdf = wdf.groupby('date').sum().reset_index()
    stocks[prod]['polarity'] = wdf.to_dict(orient='records') # polarity instead of tweet polarity


# In[44]:


db.reference('stocks/').set(stocks)


# In[45]:


# generate JSON
with open("../data/02_upload/stocks.json", "w") as outfile:
    json.dump(stocks, outfile)


# ## 5. Upload to Firebase

# In[189]:


prod = 'btc'
df = dfs[prod]

# news
for i, row in df.drop(columns='unnamed: 0').iterrows():
    db.reference(f'cryptos/{prod}/news').push(row.to_dict())


# In[183]:


polarity = polarities[prod]

# news_polarity
for i, row in polarity.iterrows():
#     print(row.to_dict())
    db.reference(f'cryptos/{prod}/news_polarity').push(row.to_dict())


# ## first BTC

# In[184]:


btc_news_bulk = pd.read_csv('../data/results_Final.csv')
btc_news_bulk['Date'] = pd.to_datetime(btc_news_bulk['Date'], dayfirst=True).d.strftime('%Y-%m-%d')
btc_news_bulk = btc_news_bulk.drop(columns='Snippet')
cols = {c: c.lower() for c in btc_news_bulk.columns}
btc_news_bulk = btc_news_bulk.rename(columns=cols)
btc_news_bulk = compute_sentiments(btc_news_bulk)


# In[185]:


df.to_json('test.json', orient='records')


# In[ ]:




