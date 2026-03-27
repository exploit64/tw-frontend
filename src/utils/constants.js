import React from "react";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
} from "lucide-react";

export const getBackendUrl = () => {
  const { protocol, hostname, port } = window.location;
  const backendPort = process.env.REACT_APP_BACKEND_PORT || port;
  return `${protocol}//${hostname}:${backendPort}`;
};

export const BACKEND_URL = getBackendUrl();
export const API = `${BACKEND_URL}/api`;
export const COPIED_TESTS_KEY = "tw_copied_tests";
export const ROOT_LABEL = "Без категории";
export const ITEMS_KEY = "__items__";
export const UUID_NAMESPACE_URL = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";

export const STATUS_CONFIG = {
  passed: {
    label: "Passed",
    bg: "bg-green-100",
    text: "text-green-800",
    bar: "bg-green-500",
    badgeBg: "bg-green-100",
    badgeText: "text-green-800",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  failed: {
    label: "Failed",
    bg: "bg-red-100",
    text: "text-red-800",
    bar: "bg-red-500",
    badgeBg: "bg-red-100",
    badgeText: "text-red-800",
    icon: <XCircle className="w-4 h-4" />,
  },
  error: {
    label: "Error",
    bg: "bg-orange-100",
    text: "text-orange-800",
    bar: "bg-orange-500",
    badgeBg: "bg-orange-100",
    badgeText: "text-orange-800",
    icon: <AlertCircle className="w-4 h-4" />,
  },
  skipped: {
    label: "Skipped",
    bg: "bg-gray-100",
    text: "text-gray-600",
    bar: "bg-gray-400",
    badgeBg: "bg-gray-100",
    badgeText: "text-gray-600",
    icon: <Clock className="w-4 h-4" />,
  },
  waiting: {
    label: "Waiting",
    bg: "bg-blue-50",
    text: "text-blue-600",
    bar: "bg-blue-500",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-600",
    icon: <Clock className="w-4 h-4" />,
  },
  started: {
    label: "Started",
    bg: "bg-yellow-50",
    text: "text-yellow-600",
    bar: "bg-yellow-500",
    badgeBg: "bg-yellow-50",
    badgeText: "text-yellow-600",
    icon: <Clock className="w-4 h-4" />,
  },
  default: {
    label: "Unknown",
    bg: "bg-gray-100",
    text: "text-gray-600",
    bar: "bg-gray-400",
    badgeBg: "bg-gray-100",
    badgeText: "text-gray-600",
    icon: <Clock className="w-4 h-4" />,
  },
};

export const normalizeStatusKey = (raw) => {
  if (!raw) return "default";
  const key = raw.toString().toLowerCase();
  return STATUS_CONFIG[key] ? key : "default";
};

export const getStatus = (raw) => STATUS_CONFIG[normalizeStatusKey(raw)];
export const getStatusLabel = (raw) => getStatus(raw).label;
export const getStatusIcon = (raw) => getStatus(raw).icon;
export const getStatusTextClass = (raw) => getStatus(raw).text;
export const getStatusBgClass = (raw) => getStatus(raw).bg;
export const getStatusBarClass = (raw) => getStatus(raw).bar;
export const getBadgeClasses = (raw) => ({
  bg: getStatus(raw).badgeBg,
  text: getStatus(raw).badgeText,
});
