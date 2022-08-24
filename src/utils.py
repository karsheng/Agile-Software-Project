import pandas as pd
import re
from textblob import TextBlob


def get_crash_timestamps(
    ts: pd.Series,
    threshold: float
) -> pd.DatetimeIndex:

    # compute the percentage change of
    # prices for each row
    diff = (ts.diff().shift(-1)/ts)

    # returns only the timestamps where the
    # changes is crosses the threshold
    mask = diff < -threshold
    timestamps = mask[mask].dropna().index

    return timestamps


def get_rise_timestamps(
    ts: pd.Series,
    threshold: float
) -> pd.DatetimeIndex:

    # compute the percentage change of
    # prices for each row
    diff = (ts.diff().shift(-1)/ts)

    # returns only the timestamps where the
    # changes is crosses the threshold
    mask = diff > threshold
    timestamps = mask[mask].dropna().index

    return timestamps


def get_sentiment(score: float) -> str:
    if score < -0.33:
        return 'negative'
    elif score >= -0.33 and score <= 0.33:
        return "neutral"
    else:
        return "positive"


def remove_rows_with_invalid_dates(df: pd.DataFrame) -> pd.DataFrame:
    """
    remove any entries with
    invalid date pattern
    """
    datetime_pattern = r"^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])\s([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$"
    mask = df["date"].str.match(datetime_pattern).fillna(False)
    return df[mask]


def convert_str_to_datetime(df: pd.DataFrame) -> pd.DataFrame:
    df.loc[:, 'date'] = pd.to_datetime(df['date'])
    return df


def clean_tweets(tweet: str) -> str:
    # removes any strings with a '#' i.e. hashtags
    tweet = re.sub('#[A-Za-z0-9]+', '', tweet)
    # removes any strings with a '@' i.e. mentions
    tweet = re.sub('@[A-Za-z0-9]+', '', tweet)
    tweet = re.sub('\\n', '', tweet)  # removes the '\n' string
    tweet = re.sub('https?:\/\/\S+', '', tweet)  # removes any hyperlinks
    return tweet


def get_subjectivity(tweet: str) -> float:
    return TextBlob(tweet).sentiment.subjectivity


def get_polarity(tweet: str) -> float:
    return TextBlob(tweet).sentiment.polarity
