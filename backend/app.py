from flask import Flask, request, jsonify
from flask_cors import CORS
import av

app = Flask(__name__)
CORS(app)

@app.route('/get_metadata', methods=['POST'])
def get_metadata():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    try:
        container = av.open(file)
        video_stream = next((s for s in container.streams if s.type == 'video'), None)
        if not video_stream:
            return jsonify({"error": "No video stream found"}), 400

        timecode = video_stream.metadata.get('timecode', None)
        if not timecode:
            return jsonify({"error": "No timecode metadata found"}), 400

        return jsonify({"timecode": timecode})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0",port=5001,debug=True)