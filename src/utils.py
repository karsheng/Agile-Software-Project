import pandas as pd


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
