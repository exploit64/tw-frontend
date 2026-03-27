import React from "react";
import { RefreshCw } from "lucide-react";

export const Loader = ({ message = "Загрузка..." }) => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-500" />
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);
