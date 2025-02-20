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
  const actions = ["釣りあげ動作", "仕掛け動作", "仕掛け回収動作"];

  return (
    <div>
      {actions.map((action) => (
        <div key={action} className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{action}</h3>
          <textarea
            readOnly
            value={formatRecordsForSpreadsheet(action)}
            className="w-full h-24 p-2 border rounded bg-gray-100"
          ></textarea>
        </div>
      ))}
    </div>
  );
}
