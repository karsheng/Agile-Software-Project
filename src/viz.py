import plotly.express as px
import json

def generate_viz_data():
    df = px.data.stocks()
    fig = px.line(df, x='date', y="GOOG")
    return json.loads(fig.to_json())