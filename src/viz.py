from typing import List
import plotly.express as px
import pandas as pd
import numpy as np
import plotly.graph_objects as go
from plotly.subplots import make_subplots


def subjectivity_polarity_plot(tweets: pd.DataFrame) -> go.Figure:
    """
    Plots a bubble chart of subjectivity vs. polarity
    """
    fig = px.scatter(tweets,
                     x="polarity", y="subjectivity",
                     size=np.log(tweets["user_followers"]+2) / np.log(1.1), color="sentiment",
                     color_discrete_sequence=["#00CC96", "#636EFA", "#EF553B"],
                     hover_name="text",
                     hover_data=['date', 'user_followers'],
                     size_max=40)
    fig.update_layout(
        yaxis_range=[-0.2, 1.2], xaxis_range=[-1.2, 1.2], xaxis_title='Polarity', yaxis_title='Subjectivity')

    return fig


def price_polarity_plot(prices: pd.Series, tweets_polarity: pd.Series, news_polarity: pd.Series, rise_timestamps: List, crash_timestamps: List) -> go.Figure:
    # Create figure with secondary y-axis
    fig = make_subplots(specs=[[{"secondary_y": True}]])

    # Add traces
    fig.add_trace(
        go.Scatter(x=prices.index, y=prices, name="price (USD)"),
        secondary_y=False,
    )

    fig.add_trace(
        go.Scatter(x=tweets_polarity.index, y=tweets_polarity, name="tweets polarity",
                   line=dict(color='rgba(0, 255, 0, 0.4)', width=3, dash='dot')),
        secondary_y=True,
    )

    fig.add_trace(
        go.Scatter(x=news_polarity.index, y=news_polarity, name="news polarity",
                   line=dict(color='rgba(255, 0, 0, 0.4)', width=3, dash='dot')),
        secondary_y=True,
    )

    for t in rise_timestamps:
        fig.add_vrect(
            x0=t, x1=t + pd.Timedelta("7d"),
            fillcolor="lightgreen", opacity=0.5,
            layer="below", line_width=0,
        )
    for t in crash_timestamps:
        fig.add_vrect(
            x0=t, x1=t + pd.Timedelta("7d"),
            fillcolor="salmon", opacity=0.5,
            layer="below", line_width=0,
        )

    # Set y-axes titles
    fig.update_yaxes(title_text="price (USD)", secondary_y=False)
    fig.update_yaxes(title_text="polarity", secondary_y=True)

    return fig
