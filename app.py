# from flask import Flask, request, jsonify
# from flask_cors import CORS
# from textblob import TextBlob
# import requests
# import logging

# app = Flask(__name__)
# CORS(app)  # Enable CORS
# logging.basicConfig(level=logging.DEBUG)  # Set up logging

# YOUTUBE_API_KEY = (
#     "AIzaSyDojB3L_sP1XF4NjF-0PGHEZhC5fHMyqXQ"  # Replace with your actual API key
# )


# def extract_channel_id(channel_url):
#     # Extracts channel ID from various YouTube URL formats
#     if "channel/" in channel_url:
#         return channel_url.split("channel/")[-1].split("/")[0]
#     elif "c/" in channel_url:
#         return channel_url.split("c/")[-1].split("/")[0]
#     elif "user/" in channel_url:
#         username = channel_url.split("user/")[-1].split("/")[0]
#         return get_channel_id_from_username(username)
#     else:
#         logging.error("Unsupported URL format.")
#         return None


# def get_channel_id_from_username(username):
#     url = f"https://www.googleapis.com/youtube/v3/channels?part=snippet&forUsername={username}&key={YOUTUBE_API_KEY}"
#     response = requests.get(url)
#     logging.debug(f"URL: {url}")
#     logging.debug(f"Response: {response.status_code} - {response.text}")
#     data = response.json()
#     if "items" in data and len(data["items"]) > 0:
#         return data["items"][0]["id"]
#     return None


# def get_youtube_channel_data(channel_url):
#     channel_id = extract_channel_id(channel_url)
#     if not channel_id:
#         logging.error("Failed to extract channel ID from URL.")
#         return None

#     url = f"https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id={channel_id}&key={YOUTUBE_API_KEY}"
#     logging.debug(f"Fetching URL: {url}")
#     response = requests.get(url)
#     logging.debug(f"Response: {response.status_code} - {response.text}")
#     return response.json()


# def analyze_sentiment(text):
#     blob = TextBlob(text)
#     return blob.sentiment.polarity, blob.sentiment.subjectivity


# @app.route("/fetch-channel", methods=["POST"])
# def fetch_channel():
#     try:
#         data = request.json
#         channel_url = data.get("channel_url")
#         if not channel_url:
#             return jsonify({"error": "Channel URL is required"}), 400
#         channel_data = get_youtube_channel_data(channel_url)
#         if (
#             not channel_data
#             or "items" not in channel_data
#             or len(channel_data["items"]) == 0
#         ):
#             return jsonify({"error": "No channel data found"}), 404

#         # Log the description length
#         if "items" in channel_data:
#             for item in channel_data["items"]:
#                 description = item.get("snippet", {}).get("description", "")
#                 logging.debug(f"Description length: {len(description)} characters")

#         return jsonify(channel_data)
#     except Exception as e:
#         logging.error(f"Error: {str(e)}")
#         return jsonify({"error": "An error occurred while fetching channel data"}), 500


# @app.route("/analyze", methods=["POST"])
# def analyze():
#     try:
#         data = request.json
#         text = data.get("text")
#         if not text:
#             return jsonify({"error": "Text is required"}), 400
#         polarity, subjectivity = analyze_sentiment(text)
#         return jsonify({"polarity": polarity, "subjectivity": subjectivity})
#     except Exception as e:
#         logging.error(f"Error: {str(e)}")
#         return jsonify({"error": "An error occurred during sentiment analysis"}), 500


# if __name__ == "__main__":
#     app.run(debug=True)


from flask import Flask, request, jsonify
from flask_cors import CORS
from textblob import TextBlob
import requests
import logging

app = Flask(__name__)
CORS(app)  # Enable CORS
logging.basicConfig(level=logging.DEBUG)  # Set up logging

YOUTUBE_API_KEY = "AIzaSyDojB3L_sP1XF4NjF-0PGHEZhC5fHMyqXQ"  # Replace with your actual API key

def extract_channel_id(channel_url):
    if "channel/" in channel_url:
        return channel_url.split("channel/")[-1].split("/")[0]
    elif "c/" in channel_url:
        return channel_url.split("c/")[-1].split("/")[0]
    elif "user/" in channel_url:
        username = channel_url.split("user/")[-1].split("/")[0]
        return get_channel_id_from_username(username)
    else:
        logging.error("Unsupported URL format.")
        return None

def get_channel_id_from_username(username):
    url = f"https://www.googleapis.com/youtube/v3/channels?part=snippet&forUsername={username}&key={YOUTUBE_API_KEY}"
    response = requests.get(url)
    logging.debug(f"URL: {url}")
    logging.debug(f"Response: {response.status_code} - {response.text}")
    data = response.json()
    if "items" in data and len(data["items"]) > 0:
        return data["items"][0]["id"]
    logging.error("No channel ID found for username.")
    return None

def get_youtube_channel_data(channel_url):
    channel_id = extract_channel_id(channel_url)
    if not channel_id:
        logging.error("Failed to extract channel ID from URL.")
        return None

    url = f"https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id={channel_id}&key={YOUTUBE_API_KEY}"
    logging.debug(f"Fetching URL: {url}")
    response = requests.get(url)
    logging.debug(f"Response: {response.status_code} - {response.text}")
    channel_data = response.json()
    
    if "items" in channel_data and len(channel_data["items"]) > 0:
        # Get the latest videos from the channel
        video_data = []
        video_ids = get_latest_video_ids(channel_id)
        if video_ids:
            for video_id in video_ids:
                video_url = f"https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id={video_id}&key={YOUTUBE_API_KEY}"
                video_response = requests.get(video_url)
                video_info = video_response.json()
                video_data.append(video_info)
        channel_data["videos"] = video_data
        return channel_data
    logging.error("No channel data found.")
    return None

def get_latest_video_ids(channel_id):
    url = f"https://www.googleapis.com/youtube/v3/search?part=snippet&channelId={channel_id}&order=date&maxResults=5&key={YOUTUBE_API_KEY}"
    response = requests.get(url)
    logging.debug(f"Fetching URL: {url}")
    logging.debug(f"Response: {response.status_code} - {response.text}")
    data = response.json()
    if "items" in data:
        return [item["id"]["videoId"] for item in data["items"] if "id" in item and "videoId" in item["id"]]
    logging.error("No video IDs found.")
    return []

def analyze_sentiment(text):
    blob = TextBlob(text)
    return blob.sentiment.polarity, blob.sentiment.subjectivity

@app.route("/fetch-channel", methods=["POST"])
def fetch_channel():
    try:
        data = request.json
        channel_url = data.get("channel_url")
        if not channel_url:
            return jsonify({"error": "Channel URL is required"}), 400
        
        channel_data = get_youtube_channel_data(channel_url)
        if not channel_data:
            return jsonify({"error": "No channel data found"}), 404
        
        # Process videos and comments for sentiment analysis
        if "videos" in channel_data:
            for video in channel_data["videos"]:
                items = video.get("items", [])
                if items:
                    video_snippet = items[0].get("snippet", {})
                    title = video_snippet.get("title", "")
                    description = video_snippet.get("description", "")
                    
                    title_polarity, title_subjectivity = analyze_sentiment(title)
                    desc_polarity, desc_subjectivity = analyze_sentiment(description)
                    
                    video["sentiment"] = {
                        "title": {"polarity": title_polarity, "subjectivity": title_subjectivity},
                        "description": {"polarity": desc_polarity, "subjectivity": desc_subjectivity},
                    }
        
        return jsonify(channel_data)
    except Exception as e:
        logging.error(f"Error: {str(e)}")
        return jsonify({"error": "An error occurred while fetching channel data"}), 500

@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        data = request.json
        text = data.get("text")
        if not text:
            return jsonify({"error": "Text is required"}), 400
        polarity, subjectivity = analyze_sentiment(text)
        return jsonify({"polarity": polarity, "subjectivity": subjectivity})
    except Exception as e:
        logging.error(f"Error: {str(e)}")
        return jsonify({"error": "An error occurred during sentiment analysis"}), 500

if __name__ == "__main__":
    app.run(debug=True)
