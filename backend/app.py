from flask import Flask, request, jsonify
from flask_cors import CORS
import av
import threading
import tempfile
import os
import logging

app = Flask(__name__)
CORS(app)
app.logger.setLevel(logging.INFO)

def seconds_to_timecode(start_code: str, offset_sec: float) -> str:
    # timecode が "hh:mm:ss:ff" のようにフレームまで含む場合があるので、
    # 先頭3つ（hh, mm, ss）だけを使う
    parts = start_code.split(":")
    h, m, s = map(int, parts[:3])
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
            app.logger.error("❌ BG: No video stream found")
            return

        # できるだけ高速に尺を取得する（全フレームをデコードしない）
        end_offset_seconds: float | None = None

        if video_stream.duration is not None:
            # duration * time_base で秒に変換
            end_offset_seconds = float(video_stream.duration * video_stream.time_base)
            app.logger.info(
                "ℹ️ BG: duration from video_stream.duration: %s seconds",
                end_offset_seconds,
            )
        elif container.duration is not None:
            # コンテナ全体の duration を使用（av.time_base で秒に変換）
            end_offset_seconds = float(container.duration * av.time_base)
            app.logger.info(
                "ℹ️ BG: duration from container.duration: %s seconds",
                end_offset_seconds,
            )
        else:
            app.logger.error("❌ BG: Unable to determine duration")
            return

        end_timecode = seconds_to_timecode(start_timecode.split(";")[0], end_offset_seconds)

        app.logger.info("🟡 BG: Start Timecode: %s", start_timecode)
        app.logger.info("✅ BG: End Timecode  : %s", end_timecode)
        app.logger.info("%s\t%s", start_timecode, end_timecode)

    except Exception as e:
        app.logger.exception("❌ BG: Error during processing")
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
        app.logger.warning("🟡 BG: get_metadata called, starting metadata extraction")
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

        # ✅ 保存完了後に終了タイムコードをバックグラウンドで計算
        app.logger.warning("🟡 BG: starting background thread for end timecode (fast duration logic)")
        threading.Thread(target=process_end_timecode, args=(tmp.name, start_timecode), daemon=True).start()

        return jsonify({"timecode": start_timecode})
    except Exception as e:
        app.logger.exception("❌ BG: Error in get_metadata")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001, debug=True)
