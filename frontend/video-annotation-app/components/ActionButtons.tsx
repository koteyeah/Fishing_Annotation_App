import React from "react";

interface ActionButtonsProps {
  activeAction: string | null;
  isFishing: boolean;
  handleActionButtonClick: (action: string) => void;
}

export default function ActionButtons({
  activeAction,
  isFishing,
  handleActionButtonClick,
}: ActionButtonsProps) {
  const actions = ["釣りあげ動作", "仕掛け動作", "仕掛け回収動作", "釣り"];

  return (
    <div className="flex justify-center space-x-4 mb-4">
      {actions.map((action) => {
        const isFishingAction = action === "釣り";
        const isActive = isFishingAction ? isFishing : activeAction === action;

        return (
          <button
            key={action}
            onClick={() => handleActionButtonClick(action)}
            disabled={
              !isFishingAction &&
              activeAction !== null &&
              activeAction !== action
            }
            className={`px-6 py-2 text-white font-bold rounded ${
              isFishingAction
                ? isActive
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "bg-orange-500 hover:bg-orange-600"
                : isActive
                ? "bg-green-500 hover:bg-green-600"
                : "bg-blue-500 hover:bg-blue-600"
            } ${
              !isFishingAction &&
              activeAction !== null &&
              activeAction !== action
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {isActive ? `${action}中` : action}
          </button>
        );
      })}
    </div>
  );
}
