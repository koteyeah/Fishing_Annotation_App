"use client";

import ActionButtons from "@/components/ActionButtons";
import ActionLogs from "@/components/ActionLogs";
import NotesInput from "@/components/NotesInput";
import VideoPlayer from "@/components/VideoPlayer";
import React, { useRef, useState } from "react";

interface ActionRecord {
  action: string;
  startTime: string;
  endTime: string | null;
}

export default function Page() {
  const videoRef = useRef<HTMLVideoElement>(null!);
  const [absoluteTimeCode, setAbsoluteTimeCode] = useState<number | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [actionRecords, setActionRecords] = useState<ActionRecord[]>([]);

  const [isFishing, setIsFishing] = useState<boolean>(false);
  const [fishingRecords, setFishingRecords] = useState<ActionRecord[]>([]);

  const [note, setNote] = useState<string>("");

  // タイムコードを秒に変換
  const timeCodeToSeconds = (timeCode: string): number => {
    const cleanTimeCode = timeCode.split(";")[0];
    const [hours, minutes, seconds] = cleanTimeCode.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  // 秒をタイムコード (hh:mm:ss) に変換
  const secondsToTimeCode = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  // 動画ファイルをアップロードしてバックエンドから絶対時間を取得
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await fetch("http://127.0.0.1:5001/get_metadata", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();

        if (response.ok) {
          setAbsoluteTimeCode(timeCodeToSeconds(data.timecode));
          const url = URL.createObjectURL(file);
          setVideoUrl(url);
        } else {
          setError(data.error || "Failed to fetch metadata");
        }
      } catch (err) {
        setError("Failed to connect to the server");
      }
    }
  };

  // アクションボタンを押した時の処理
  const handleActionButtonClick = (action: string) => {
    if (!videoRef.current || absoluteTimeCode === null) return;

    const currentTime = videoRef.current.currentTime;
    const combinedSeconds = absoluteTimeCode + currentTime;
    const combinedTimeCode = secondsToTimeCode(combinedSeconds);

    if (action === "釣り") {
      if (isFishing) {
        // 釣りの終了
        setFishingRecords((prev) =>
          prev.map((r) =>
            r.endTime === null ? { ...r, endTime: combinedTimeCode } : r
          )
        );
      } else {
        // 釣りの開始
        setFishingRecords((prev) => [
          ...prev,
          { action: "釣り", startTime: combinedTimeCode, endTime: null },
        ]);
      }
      setIsFishing(!isFishing);
    } else {
      if (activeAction === action) {
        // アクションの終了
        setActionRecords((prev) =>
          prev.map((r) =>
            r.action === action && r.endTime === null
              ? { ...r, endTime: combinedTimeCode }
              : r
          )
        );
        setActiveAction(null);
      } else {
        // アクションの開始
        setActionRecords((prev) => [
          ...prev,
          { action, startTime: combinedTimeCode, endTime: null },
        ]);
        setActiveAction(action);
      }
    }
  };

  // アクションログをタブ区切り形式で表示
  const formatRecordsForSpreadsheet = (action: string): string => {
    return [...actionRecords, ...fishingRecords]
      .filter((record) => record.action === action && record.endTime !== null)
      .map((record) => `${record.startTime}\t${record.endTime}`)
      .join("\n");
  };

  return (
    <div className="flex min-h-screen bg-gray-100 p-4">
      {/* 左側 */}
      <div className="w-2/3 p-4 bg-white shadow rounded">
        <VideoPlayer
          videoUrl={videoUrl}
          handleFileUpload={handleFileUpload}
          videoRef={videoRef}
        />
        <ActionButtons
          activeAction={activeAction}
          isFishing={isFishing}
          handleActionButtonClick={handleActionButtonClick}
        />
        <NotesInput note={note} setNote={setNote} />
      </div>

      {/* 右側 */}
      <div className="w-1/3 p-4 bg-white shadow rounded ml-4">
        <ActionLogs
          actionRecords={[...actionRecords, ...fishingRecords]}
          formatRecordsForSpreadsheet={formatRecordsForSpreadsheet}
        />
      </div>
    </div>
  );
}
