import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";

export const ParamsTooltipWrapper = ({ params, children }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const pretty = Array.isArray(params) ? params : [];
  const ref = useRef(null);
  const handleEnter = () => {
    try {
      const rowRect = ref.current?.getBoundingClientRect();
      const panel = document.querySelector(".tw-runs-select-panel");
      const panelRect = panel ? panel.getBoundingClientRect() : null;
      if (rowRect && panelRect) {
        const desiredLeft = panelRect.right + 8;
        const maxLeft = Math.max(8, window.innerWidth - 400);
        setPos({
          top: rowRect.top + rowRect.height / 2,
          left: Math.min(desiredLeft, maxLeft),
        });
      }
    } catch {}
    setOpen(true);
  };
  return (
    <div
      ref={ref}
      onMouseEnter={handleEnter}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
      {open &&
        createPortal(
          <div
            className="z-[9999] bg-white border border-gray-200 shadow-lg rounded p-2 min-w-[14rem] max-w-[40vw]"
            style={{
              position: "fixed",
              top: `${pos.top}px`,
              left: `${pos.left}px`,
              transform: "translateY(-50%)",
            }}
          >
            {pretty.length === 0 ? (
              <div className="text-xs text-gray-500">-</div>
            ) : (
              <div className="space-y-1">
                {pretty.map((row, idx) => (
                  <div key={idx} className="text-xs leading-tight">
                    <span className="text-gray-500">{row.key}</span>
                    <span className="mx-1 text-gray-400">:</span>
                    <span className="text-gray-900 font-medium break-all">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
};
