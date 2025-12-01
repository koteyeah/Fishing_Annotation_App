import React from "react";

interface ActionLogsProps {
  actionRecords: {
    action: string;
    startTime: string;
    endTime: string | null;
  }[];
  formatRecordsForSpreadsheet: (action: string) => string;
}

export default function ActionLogs({
  actionRecords,
  formatRecordsForSpreadsheet,
}: ActionLogsProps) {
  const actions = [
    { label: "釣り中", key: "釣り" },
    { label: "仕掛け", key: "仕掛け動作" },
    { label: "釣りあげ", key: "釣りあげ動作" },
    { label: "仕掛け回収", key: "仕掛け回収動作" },
  ];
  return (
    <div>
      {actions.map(({ label, key }) => {
        const hasData = actionRecords.some(
          (r) => r.action === key && r.endTime !== null
        );
        return (
          <div key={key} className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {label}
            </h3>
            <textarea
              readOnly
              value={formatRecordsForSpreadsheet(key)}
              className="w-full h-24 p-2 border rounded bg-gray-100"
              placeholder={hasData ? "" : "まだ記録がありません"}
            ></textarea>
          </div>
        );
      })}
    </div>
  );
}
