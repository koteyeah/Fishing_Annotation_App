from flask import Flask, request, jsonify
from flask_cors import CORS
import av
import threading
import tempfile
import os

app = Flask(__name__)
CORS(app)

def seconds_to_timecode(start_code: str, offset_sec: float) -> str:
    h, m, s = map(int, start_code.split(":"))
    total_seconds = h * 3600 + m * 60 + s + offset_sec
    h = int(total_seconds // 3600)
    m = int((total_seconds % 3600) // 60)
    s = int(total_seconds % 60)
    return f"{h:02}:{m:02}:{s:02}"

def process_end_timecode(file_path: str, start_timecode: str):
    try:
        container = av.open(file_path)
        video_stream = next((s for s in container.streams if s.type == 'video'), None)
        if not video_stream:
            print("❌ BG: No video stream found", flush=True)
            return

        last_pts = None
        for frame in container.decode(video_stream):
            last_pts = frame.pts

        if last_pts is None:
            print("❌ BG: Failed to decode any frame", flush=True)
            return

        time_base = video_stream.time_base
        end_offset_seconds = float(last_pts * time_base)
        end_timecode = seconds_to_timecode(start_timecode.split(";")[0], end_offset_seconds)

        print("🟡 BG: Start Timecode:", start_timecode, flush=True)
        print("✅ BG: End Timecode  :", end_timecode, flush=True)
        print(f"{start_timecode}\t{end_timecode}", flush=True)

    except Exception as e:
        print("❌ BG: Error during processing:", str(e), flush=True)
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)  # クリーンアップ
import shutil

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

        start_timecode = video_stream.metadata.get('timecode', None)
        if not start_timecode:
            return jsonify({"error": "No timecode metadata found"}), 400

        # 🛠 一時ファイルをちゃんと保存する
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
        file.stream.seek(0)  # ストリームの先頭に戻す
        with open(tmp.name, 'wb') as f:
            shutil.copyfileobj(file.stream, f)

        # ✅ 保存完了後にスレッド起動
        threading.Thread(target=process_end_timecode, args=(tmp.name, start_timecode)).start()

        return jsonify({"timecode": start_timecode})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001, debug=True)