import React from "react";
import { getStatus } from "../../utils/constants";

export const StatusBadge = ({ status }) => {
  const cfg = getStatus(status);
  return (
    <span
      className={`text-xs px-3 py-1 rounded font-semibold uppercase ${cfg.bar} text-white flex items-center space-x-1 whitespace-normal break-normal`}
    >
      {cfg.icon}
      <span>{status}</span>
    </span>
  );
};
