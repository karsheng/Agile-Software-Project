import snscrape.modules.twitter as sntwitter
import pandas as pd
import datetime
import torch
from textblob import TextBlob
from transformers import AutoModelForSequenceClassification
from transformers import TFAutoModelForSequenceClassification
from transformers import AutoTokenizer
from scipy.special import softmax
import numpy as np
import csv
import urllib.request
from datetime import date
from datetime import timedelta



roberta = "cardiffnlp/twitter-roberta-base-sentiment"
model = AutoModelForSequenceClassification.from_pretrained(roberta)
tokenizer = AutoTokenizer.from_pretrained(roberta)
labels = ['Negative', 'Neutral', 'Positive']


def get_sentiment(score: float) -> str:
    if score < -0.33:
        return "negative"
    elif score >= -0.33 and score <= 0.33:
        return "neutral"
    else:
        return "positive"
    
    
def TwitLoader(currency_name, daily_limit):
    limit = daily_limit
    d = datetime.datetime.now()
    myDay = d.strftime('%Y-%m-%d')
    d = d - timedelta(days=1)
    

    tweets = []
    myDF = pd.DataFrame()
    query = "{0} lang:en until:{1}".format(currency_name, myDay)

    for tweet in sntwitter.TwitterSearchScraper(query).get_items():
        if len(tweets)==limit:
            break
        else:
            tweets.append([tweet.date, tweet.content, tweet.user.followersCount, tweet.user.location])

    myDF = pd.DataFrame(tweets, columns=['date', 'text', 'user_followers', 'user_location'])

    Polarity = []
    for i in range(len(myDF)):
        tweet = myDF.loc[i, "text"]
        tweet_words = []
        for word in tweet.split(' '):
            if word.startswith('@') and len(word) > 1:
                word = '@user'
            elif word.startswith('http'):
                word = "http"
            tweet_words.append(word)
            tweet_proc = " ".join(tweet_words)

        encoded_tweet = tokenizer(tweet_proc, return_tensors='pt')
        output = model(**encoded_tweet)
        scores = output[0][0].detach().numpy()
        scores = softmax(scores)
        Polarity.append(scores[2]-scores[0])
    myDF['polarity'] = Polarity

    myDF['sentiment'] = myDF['polarity'].apply(get_sentiment)

    mySubjectivity = []
    for i in range(len(myDF)):
        testimonial = TextBlob(myDF.loc[i, "text"])
        mySubjectivity.append(testimonial.sentiment.subjectivity)
    myDF['subjectivity'] = mySubjectivity
    myDF['date'] = myDF['date'].dt.date

    orderedDF = myDF[['date', 'polarity', 'sentiment', 'subjectivity','text', 'user_followers', 'user_location']]
    file_name = d.strftime('%Y-%m-%d') + ".csv"
    orderedDF.to_csv(file_name, index=False)