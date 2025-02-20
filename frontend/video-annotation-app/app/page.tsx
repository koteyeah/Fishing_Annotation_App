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
  const handleActionButtonClick = (action: string) => {
    if (videoRef.current && absoluteTimeCode !== null) {
      const currentTime = videoRef.current.currentTime;
      const combinedSeconds = absoluteTimeCode + currentTime;
      const combinedTimeCode = secondsToTimeCode(combinedSeconds);

      if (activeAction === action) {
        // 終了時刻を記録してリストに保存
        setActionRecords((prevRecords) =>
          prevRecords.map((record) =>
            record.action === action && record.endTime === null
              ? { ...record, endTime: combinedTimeCode }
              : record
          )
        );
        setActiveAction(null); // 動作を解除
      } else {
        // 新しい動作を開始時刻として記録
        setActionRecords((prevRecords) => [
          ...prevRecords,
          { action, startTime: combinedTimeCode, endTime: null },
        ]);
        setActiveAction(action); // 現在の動作を設定
      }
    }
  };

  const formatRecordsForSpreadsheet = (action: string): string => {
    return actionRecords
      .filter((record) => record.action === action && record.endTime !== null) // 該当アクションかつ終了時刻がある記録
      .map((record) => `${record.startTime}\t${record.endTime}`) // タブ区切り
      .join("\n"); // 改行で区切る
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
          handleActionButtonClick={handleActionButtonClick}
        />
        <NotesInput note={note} setNote={setNote} />
      </div>

      {/* 右側 */}
      <div className="w-1/3 p-4 bg-white shadow rounded ml-4">
        <ActionLogs
          actionRecords={actionRecords}
          formatRecordsForSpreadsheet={formatRecordsForSpreadsheet}
        />
      </div>
    </div>
  );
}
