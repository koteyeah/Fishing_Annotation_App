import React, { useRef } from "react";

interface VideoPlayerProps {
  videoUrl: string | null;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  isFishing: boolean;
}

export default function VideoPlayer({
  videoUrl,
  handleFileUpload,
  videoRef,
  isFishing,
}: VideoPlayerProps) {
  return (
    <div>
      <input
        type="file"
        accept="video/mp4"
        onChange={handleFileUpload}
        className="mb-4 p-2 border rounded bg-white w-full"
      />
      <div className="flex justify-center mb-4">
        <div
          className={`flex items-center px-6 py-3 rounded-full shadow-md border text-lg font-semibold ${
            isFishing
              ? "bg-green-500 border-green-600 text-white"
              : "bg-yellow-100 border-yellow-400 text-yellow-800"
          }`}
        >
          <span
            className={`inline-block w-4 h-4 rounded-full mr-3 ${
              isFishing ? "bg-white" : "bg-yellow-500"
            }`}
          ></span>
          <span>{isFishing ? "釣り中" : "準備中"}</span>
        </div>
      </div>
      {videoUrl && (
        <video
          ref={videoRef}
          controls
          src={videoUrl}
          className="w-full border mb-4 rounded"
        ></video>
      )}
    </div>
  );
}
