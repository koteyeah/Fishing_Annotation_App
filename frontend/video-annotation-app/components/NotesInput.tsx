import React from "react";

interface NotesInputProps {
  note: string;
  setNote: (value: string) => void;
}

export default function NotesInput({ note, setNote }: NotesInputProps) {
  return (
    <textarea
      value={note}
      onChange={(e) => setNote(e.target.value)}
      placeholder="補足メモを入力してください..."
      className="w-full h-24 p-2 border rounded bg-gray-50"
    ></textarea>
  );
}
