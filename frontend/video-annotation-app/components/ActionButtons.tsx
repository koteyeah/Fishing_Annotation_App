import React from "react";

interface ActionButtonsProps {
  activeAction: string | null;
  handleActionButtonClick: (action: string) => void;
}

export default function ActionButtons({
  activeAction,
  handleActionButtonClick,
}: ActionButtonsProps) {
  const actions = ["釣りあげ動作", "仕掛け動作", "仕掛け回収動作"];

  return (
    <div className="flex justify-center space-x-4 mb-4">
      {actions.map((action) => (
        <button
          key={action}
          onClick={() => handleActionButtonClick(action)}
          disabled={activeAction !== null && activeAction !== action} // 他のボタンは無効化
          className={`px-6 py-2 text-white font-bold rounded ${
            activeAction === action
              ? "bg-green-500 hover:bg-green-600"
              : "bg-blue-500 hover:bg-blue-600"
          } ${
            activeAction !== null && activeAction !== action
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          {activeAction === action ? `${action}中` : action}
        </button>
      ))}
    </div>
  );
}
