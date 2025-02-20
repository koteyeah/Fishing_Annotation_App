import React, { useRef } from "react";

interface VideoPlayerProps {
  videoUrl: string | null;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export default function VideoPlayer({
  videoUrl,
  handleFileUpload,
  videoRef,
}: VideoPlayerProps) {
  return (
    <div>
      <input
        type="file"
        accept="video/mp4"
        onChange={handleFileUpload}
        className="mb-4 p-2 border rounded bg-white w-full"
      />
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
