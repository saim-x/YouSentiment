from flask import Flask, request, jsonify
from flask_cors import CORS
from textblob import TextBlob
import requests

app = Flask(__name__)
CORS(app)  # Enable CORS

YOUTUBE_API_KEY = 'YOUR_YOUTUBE_API_KEY'

def get_youtube_channel_data(channel_url):
    # Extract channel ID from URL
    channel_id = channel_url.split('/')[-1]
    # Fetch channel details
    url = f'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id={channel_id}&key={YOUTUBE_API_KEY}'
    response = requests.get(url)
    return response.json()

def analyze_sentiment(text):
    blob = TextBlob(text)
    return blob.sentiment.polarity, blob.sentiment.subjectivity

@app.route('/fetch-channel', methods=['POST'])
def fetch_channel():
    data = request.json
    channel_url = data.get('channel_url')
    channel_data = get_youtube_channel_data(channel_url)
    return jsonify(channel_data)

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    text = data.get('text')
    polarity, subjectivity = analyze_sentiment(text)
    return jsonify({'polarity': polarity, 'subjectivity': subjectivity})

if __name__ == '__main__':
    app.run(debug=True)
