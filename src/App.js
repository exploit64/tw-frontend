import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  createContext,
  useContext,
} from "react";
import { createPortal } from "react-dom";
import "./App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  FlaskConical,
  PlayCircle,
  Play,
  ListChevronsUpDown,
  ListChevronsDownUp,
  FolderSync,
  ChartPie,
  Copy,
  BarChart3,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  FilePlus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Trash2,
  RefreshCw,
  Filter,
  FileText,
  Check,
  Printer,
  Download,
  Clapperboard,
} from "lucide-react";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { ScrollArea } from "./components/ui/scroll-area";
import { Separator } from "./components/ui/separator";
import { Progress } from "./components/ui/progress";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "./components/ui/pagination";
import PepeEasterEgg from "./PepeEasterEgg";
import Swal from "sweetalert2";
window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (event.data.type !== "SWAL") return;
  const options = event.data.payload;
  Swal.fire(options);
});
const getBackendUrl = () => {
  const { protocol, hostname, port } = window.location;
  const backendPort = process.env.REACT_APP_BACKEND_PORT || port;
  console.log(`${protocol}//${hostname}:${backendPort}`);
  return `${protocol}//${hostname}:${backendPort}`;
};
if (!window.actualCheckedNodes) {
  window.actualCheckedNodes = new Set();
}
const BACKEND_URL = getBackendUrl();
const API = `${BACKEND_URL}/api`;
const AuthContext = createContext();
window.clearCheckboxes = function () {
  if (window.actualCheckedNodes) {
    window.actualCheckedNodes.clear();
  }
  window.dispatchEvent(new CustomEvent("checkboxes-cleared"));
  window.dispatchEvent(new CustomEvent("actualCheckedNodesChanged"));
};
const STATUS_CONFIG = {
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
const copyToClipboard = (text) => {
  return new Promise((resolve, reject) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "-9999px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, 99999);
    try {
      document.execCommand("copy");
      document.body.removeChild(textarea);
      const notification = document.createElement("div");
      notification.textContent = "Скопировано";
      notification.style.cssText = `
        position: fixed;
        bottom: 16px;
        right: 24px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 12px 20px;
        border-radius: 12px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        z-index: 9999;
        font-size: 14px;
        font-weight: 600;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        gap: 8px;
      `;
      const checkIcon = document.createElement("div");
      checkIcon.innerHTML = "✓";
      checkIcon.style.cssText = `
        width: 16px;
        height: 16px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
      `;
      notification.appendChild(checkIcon);
      document.body.appendChild(notification);
      requestAnimationFrame(() => {
        notification.style.transform = "translateX(0)";
        notification.style.opacity = "1";
      });
      setTimeout(() => {
        notification.style.transform = "translateX(100%)";
        notification.style.opacity = "0";
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }, 3000);
      resolve();
    } catch (err) {
      document.body.removeChild(textarea);
      reject(new Error("Не удалось скопировать текст"));
    }
  });
};
const fetchJson = (url, options = {}) => {
  const key = `${url}::${JSON.stringify(options)}`;
  const token = localStorage.getItem("access_token");
  if (token) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  if (inFlightFetches.has(key)) {
    return inFlightFetches.get(key);
  }
  const controller = new AbortController();
  const merged = {
    ...options,
    signal: controller.signal,
  };
  const promise = fetch(url, merged)
    .then((res) => {
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("access_token");
          window.location.href = "/tw/";
          throw new Error("Unauthorized");
        }
        const err = new Error(`Fetch error ${res.status} ${res.statusText}`);
        err.status = res.status;
        throw err;
      }
      return res.json();
    })
    .finally(() => {
      inFlightFetches.delete(key);
    });
  inFlightFetches.set(key, promise);
  return promise;
};
const normalizeStatusKey = (raw) => {
  if (!raw) return "default";
  const key = raw.toString().toLowerCase();
  return STATUS_CONFIG[key] ? key : "default";
};
const getStatus = (raw) => STATUS_CONFIG[normalizeStatusKey(raw)];
const getStatusLabel = (raw) => getStatus(raw).label;
const getStatusIcon = (raw) => getStatus(raw).icon;
const getStatusTextClass = (raw) => getStatus(raw).text;
const getStatusBgClass = (raw) => getStatus(raw).bg;
const getStatusBarClass = (raw) => getStatus(raw).bar;
const getBadgeClasses = (raw) => ({
  bg: getStatus(raw).badgeBg,
  text: getStatus(raw).badgeText,
});
const inFlightFetches = new Map();
const useFetch = (fetcher, deps = [], initial = null) => {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const fetchData = useCallback(async () => {
    if (!mountedRef.current) return;
    setLoading(true);
    try {
      const res = await fetcher();
      if (mountedRef.current) {
        setData(res);
      }
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetcher]);
  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => {
      mountedRef.current = false;
    };
  }, [...deps, fetchData]);
  return { data, loading, setData, refetch: fetchData };
};
const groupByHierarchy = (items, getEpic, getFeature, getStory) => {
  const ROOT = "Без категории";
  return items.reduce((acc, item) => {
    const levels = [getEpic(item), getFeature(item), getStory(item)];
    let current = acc;
    let found = false;
    for (const level of levels) {
      if (level) {
        if (!current[level]) {
          const hasNextRealLevel = levels
            .slice(levels.indexOf(level) + 1)
            .some(Boolean);
          current[level] = hasNextRealLevel ? {} : [];
        }
        current = current[level];
        found = true;
      }
    }
    if (!found) {
      if (!current[ROOT]) {
        current[ROOT] = [];
      }
      current[ROOT].push(item);
    } else {
      if (Array.isArray(current)) {
        current.push(item);
      } else {
        current[""] = current[""] || [];
        current[""].push(item);
      }
    }
    return acc;
  }, {});
};
const collectAllGroupNodeIds = (node, nodeId = "") => {
  if (Array.isArray(node)) return [];
  let ids = [];
  Object.entries(node).forEach(([key, value]) => {
    const childNodeId = nodeId ? `${nodeId}-${key}` : key;
    ids.push(childNodeId);
    ids = ids.concat(collectAllGroupNodeIds(value, childNodeId));
  });
  return ids;
};
const collectAllIds = (node) => {
  if (Array.isArray(node))
    return node.map((n) => `${n.number}|${n.test_id}`).filter(Boolean);
  let ids = [];
  Object.values(node).forEach((v) => {
    ids.push(...collectAllIds(v));
  });
  return ids;
};
const Loader = ({ message = "Загрузка..." }) => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-500" />
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);
const StatusBadge = ({ status }) => {
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
const Tree = React.memo(function Tree({
  items,
  getEpic,
  getStory,
  getFeature,
  onSelect,
  selected,
  showStatusBar = false,
  onCheck = () => {},
  pageType = "tests",
}) {
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [checkedNodes, setCheckedNodes] = useState(new Set());
  const lastSelectedRef = useRef(null);
  useEffect(() => {
    if (!selected) {
      lastSelectedRef.current = null;
      return;
    }
    const selectedId = selected
      ? `${selected.number}|${selected.test_id}`
      : null;
    if (selectedId === lastSelectedRef.current) {
      return;
    }
    lastSelectedRef.current = selectedId;
    try {
      const epic = getEpic?.(selected);
      const feature = getFeature?.(selected);
      const story = getStory?.(selected);
      const ids = [];
      if (epic) ids.push(String(epic));
      if (epic && feature) ids.push(`${epic}-${feature}`);
      if (epic && feature && story) ids.push(`${epic}-${feature}-${story}`);
      if (ids.length > 0) {
        setExpandedNodes((prev) => {
          const next = new Set(prev);
          ids.forEach((id) => next.add(id));
          return next;
        });
      }
    } catch (e) {}
  }, [selected, getEpic, getStory, getFeature]);
  useEffect(() => {
    const handleClearCheckboxes = () => {
      const empty = new Set();
      setCheckedNodes(empty);
      try {
        window.actualCheckedNodes = new Set(empty);
        window.dispatchEvent(new CustomEvent("actualCheckedNodesChanged"));
      } catch {}
      try {
        onCheck(empty);
      } catch {}
    };
    const handleSetChecked = (e) => {
      try {
        const ids = Array.isArray(e?.detail?.ids) ? e.detail.ids : [];
        const next = new Set(ids);
        setCheckedNodes(next);
        window.actualCheckedNodes = new Set(next);
        window.dispatchEvent(new CustomEvent("actualCheckedNodesChanged"));
        try {
          onCheck(next);
        } catch {}
      } catch {}
    };
    window.addEventListener("checkboxes-cleared", handleClearCheckboxes);
    window.addEventListener("set-checked-nodes", handleSetChecked);
    if (typeof window.clearCheckboxes !== "function") {
      window.clearCheckboxes = () => {
        try {
          window.dispatchEvent(new CustomEvent("checkboxes-cleared"));
        } catch {}
      };
    }
    if (typeof window.setCheckedNodes !== "function") {
      window.setCheckedNodes = (ids) => {
        try {
          window.dispatchEvent(
            new CustomEvent("set-checked-nodes", { detail: { ids } })
          );
        } catch {}
      };
    }
    return () => {
      window.removeEventListener("checkboxes-cleared", handleClearCheckboxes);
      window.removeEventListener("set-checked-nodes", handleSetChecked);
    };
  }, [onCheck]);
  const { grouped, statusStats, countStats } = useMemo(() => {
    const groupedData = groupByHierarchy(items, getEpic, getFeature, getStory);
    const stats = {};
    const counts = {};
    if (pageType === "results" && showStatusBar) {
      const calculateStats = (node, nodeId) => {
        let counts = {};
        if (Array.isArray(node)) {
          counts = node.reduce((acc, item) => {
            const status = normalizeStatusKey(item.status);
            acc[status] = (acc[status] || 0) + 1;
            return acc;
          }, {});
        } else {
          Object.entries(node).forEach(([key, value]) => {
            const childNodeId = nodeId ? `${nodeId}-${key}` : key;
            const childStats = calculateStats(value, childNodeId);
            Object.entries(childStats).forEach(([status, count]) => {
              counts[status] = (counts[status] || 0) + count;
            });
          });
        }
        if (nodeId) {
          stats[nodeId] = counts;
        }
        return counts;
      };
      calculateStats(groupedData, "");
    }
    if (pageType === "tests") {
      const calculateCounts = (node, nodeId) => {
        let count = 0;
        if (Array.isArray(node)) {
          count = node.length;
        } else {
          Object.entries(node).forEach(([key, value]) => {
            const childNodeId = nodeId ? `${nodeId}-${key}` : key;
            const childCount = calculateCounts(value, childNodeId);
            count += childCount;
          });
        }
        if (nodeId) {
          counts[nodeId] = count;
        }
        return count;
      };
      calculateCounts(groupedData, "");
    }
    return { grouped: groupedData, statusStats: stats, countStats: counts };
  }, [items, getEpic, getStory, getFeature, pageType, showStatusBar]);
  const isSelectedItem = useCallback(
    (item) => {
      if (!selected) return false;
      const id = `${item.number}|${item.test_id}`;
      const selectedId = `${selected.number}|${selected.test_id}`;
      return id === selectedId;
    },
    [selected]
  );
  const toggleNode = useCallback((nodeId) => {
    setExpandedNodes((prev) => {
      const clone = new Set(prev);
      clone.has(nodeId) ? clone.delete(nodeId) : clone.add(nodeId);
      return clone;
    });
  }, []);
  const toggleCheck = useCallback(
    (nodeId, children = []) => {
      setCheckedNodes((prev) => {
        const clone = new Set(prev);
        if (children.length > 0) {
          const allChecked = children.every((id) => clone.has(id));
          children.forEach((id) => {
            if (allChecked) clone.delete(id);
            else clone.add(id);
          });
        } else {
          clone.has(nodeId) ? clone.delete(nodeId) : clone.add(nodeId);
        }
        window.actualCheckedNodes = new Set(clone);
        window.dispatchEvent(new CustomEvent("actualCheckedNodesChanged"));
        return clone;
      });
      onCheck((prev) => {
        const clone = new Set(prev);
        if (children.length > 0) {
          const allChecked = children.every((id) => clone.has(id));
          children.forEach((id) => {
            if (allChecked) clone.delete(id);
            else clone.add(id);
          });
        } else {
          clone.has(nodeId) ? clone.delete(nodeId) : clone.add(nodeId);
        }
        return clone;
      });
    },
    [onCheck]
  );
  const Checkbox = React.memo(
    ({ checked, indeterminate, onChange, pageType, testId }) => {
      const ref = useRef();
      useEffect(() => {
        if (ref.current) ref.current.indeterminate = indeterminate;
      }, [indeterminate]);
      return (
        <input
          ref={ref}
          data="test"
          type="checkbox"
          className="mr-2"
          checked={checked}
          onChange={onChange}
          onClick={(e) => e.stopPropagation()}
          value={testId}
        />
      );
    }
  );
  const LeafRow = React.memo(function LeafRow({ item, level, pageType }) {
    const id = `${item.number}|${item.test_id}`;
    const isSelected = isSelectedItem(item);
    const checked = checkedNodes.has(id);
    const padding = level * 20 + 8;
    const statusBarClass = getStatusBarClass(item.status || "default");
    return (
      <div
        key={id}
        onClick={() => onSelect(item)}
        className={`flex items-center px-2 py-1 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
          isSelected ? "bg-blue-50 border-l-2 border-l-blue-500" : ""
        }`}
        style={{
          paddingLeft: `${padding}px`,
          paddingRight: "15px",
        }}
      >
        <Checkbox
          checked={checked}
          onChange={(e) => {
            e.stopPropagation();
            toggleCheck(id);
          }}
          pageType={pageType}
          testId={item.test_id}
        />
        {showStatusBar && (
          <div
            className={`w-2 h-5 mr-3 rounded-full ${statusBarClass} shadow-sm`}
          />
        )}
        <span className="text-sm text-gray-800">
          {item.number && item.number !== 0 ? `[${item.number}] ` : ""}
          {item.name}
        </span>
        <span className="ml-auto text-xs text-gray-500 tabular-nums">
          {(() => {
            const { date_start, date_end } = item;
            if (pageType === "tests") return "";
            if (!date_start || !date_end) return "–";
            const diffMs = new Date(date_end) - new Date(date_start);
            const diffSeconds = diffMs / 1000;
            if (diffSeconds < 60) {
              const formatted =
                diffSeconds % 1 === 0
                  ? diffSeconds.toFixed(0)
                  : diffSeconds.toFixed(1);
              return `${formatted}s`;
            } else {
              const diffMinutes = diffSeconds / 60;
              const formatted =
                diffMinutes % 1 === 0
                  ? diffMinutes.toFixed(0)
                  : diffMinutes.toFixed(1);
              return `${formatted}m`;
            }
          })()}
        </span>
      </div>
    );
  });
  const renderTreeRecursive = (node, nodeId, level = 0) => {
    if (Array.isArray(node)) {
      return node.map((item) => (
        <LeafRow
          key={`${item.number}|${item.test_id}`}
          item={item}
          level={level}
          pageType={pageType}
        />
      ));
    }
    return Object.entries(node).map(([key, value]) => {
      const childNodeId = nodeId ? `${nodeId}-${key}` : key;
      const isExpanded = expandedNodes.has(childNodeId);
      const childIds = collectAllIds(value);
      const all =
        childIds.length > 0 && childIds.every((id) => checkedNodes.has(id));
      const none =
        childIds.length > 0 && childIds.every((id) => !checkedNodes.has(id));
      const partial = childIds.length > 0 && !all && !none;
      const statusCounts =
        pageType === "results" && showStatusBar
          ? statusStats[childNodeId] || {}
          : {};
      const testCount = pageType === "tests" ? countStats[childNodeId] || 0 : 0;
      const children = renderTreeRecursive(value, childNodeId, level + 1);
      return (
        <div key={childNodeId}>
          <div
            className="flex items-center px-2 py-1 hover:bg-gray-100 cursor-pointer border-b border-gray-200"
            style={{ paddingLeft: `${level * 20}px` }}
            onClick={() => toggleNode(childNodeId)}
          >
            <input
              type="checkbox"
              className="mr-2"
              checked={
                childIds.length > 0 ? all : checkedNodes.has(childNodeId)
              }
              ref={(el) => {
                if (el) el.indeterminate = partial;
              }}
              onChange={(e) => {
                toggleCheck(childNodeId, childIds);
              }}
              onClick={(e) => e.stopPropagation()}
            />
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 mr-2 text-gray-600" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-2 text-gray-600" />
            )}
            <span className="text-sm font-semibold text-gray-900 flex-1">
              {key}
            </span>
            {pageType === "tests" && testCount > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-gray-100 text-gray-700">
                {testCount}
              </span>
            )}
            {pageType === "results" &&
              showStatusBar &&
              Object.keys(statusCounts).length > 0 && (
                <div className="flex space-x-1 ml-2">
                  {[
                    "passed",
                    "failed",
                    "skipped",
                    "error",
                    "waiting",
                    "started",
                  ]
                    .filter((status) => statusCounts[status] > 0)
                    .map((status) => {
                      const count = statusCounts[status];
                      const cfg = getStatus(status);
                      return (
                        <span
                          key={status}
                          className={`text-xs px-1.5 py-0.5 rounded font-semibold uppercase ${cfg.bar} text-white`}
                        >
                          {count}
                        </span>
                      );
                    })}
                </div>
              )}
          </div>
          {isExpanded && children}
        </div>
      );
    });
  };
  return (() => {
    try {
      const ids = collectAllIds(grouped);
      const total = ids.length;
      if (total === 0) {
        return null;
      }
      const selectedCount = ids.filter((id) => checkedNodes.has(id)).length;
      const all = selectedCount === total;
      const none = selectedCount === 0;
      const partial = !none && !all;
      if (selectedCount == 0 && window.actualCheckedNodes.size != 0) {
        window.clearCheckboxes();
      }
      let refEl;
      setTimeout(() => {
        try {
          if (refEl) refEl.indeterminate = partial;
        } catch {}
      }, 0);
      const allNodeKeys = collectAllGroupNodeIds(grouped, "");
      const allOpened =
        allNodeKeys.length > 0 &&
        allNodeKeys.every((k) => expandedNodes.has(k));
      return (
        <div className="flex flex-col h-full min-h-0 pr-1">
          <div className="px-2 py-1 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs text-gray-700 select-none">
                <input
                  ref={(el) => {
                    refEl = el;
                  }}
                  type="checkbox"
                  className="mr-2"
                  checked={all && !partial}
                  onChange={() => {
                    setCheckedNodes((prev) => {
                      const next = new Set(prev);
                      if (all) {
                        ids.forEach((id) => next.delete(id));
                      } else {
                        ids.forEach((id) => next.add(id));
                      }
                      try {
                        window.actualCheckedNodes = new Set(next);
                        window.dispatchEvent(
                          new CustomEvent("actualCheckedNodesChanged")
                        );
                      } catch {}
                      return next;
                    });
                    try {
                      onCheck((prev) => {
                        const base = new Set(prev);
                        if (all) {
                          ids.forEach((id) => base.delete(id));
                        } else {
                          ids.forEach((id) => base.add(id));
                        }
                        return base;
                      });
                    } catch {}
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  type="button"
                  className="flex items-center gap-1 px-0 py-0 font-semibold text-sm text-gray-900 bg-transparent border-none cursor-pointer focus:outline-none"
                  style={{ background: "none" }}
                  onClick={() => {
                    const allNodeKeys = collectAllGroupNodeIds(grouped, "");
                    const anyFolded = allNodeKeys.some(
                      (k) => !expandedNodes.has(k)
                    );
                    setExpandedNodes(() => {
                      if (anyFolded) {
                        const next = new Set(expandedNodes);
                        allNodeKeys.forEach((k) => next.add(k));
                        return next;
                      } else {
                        const next = new Set(expandedNodes);
                        allNodeKeys.forEach((k) => next.delete(k));
                        return next;
                      }
                    });
                  }}
                  tabIndex={0}
                >
                  {allOpened ? (
                    <ListChevronsUpDown className="w-4 h-4 mr-1 text-gray-600" />
                  ) : (
                    <ListChevronsDownUp className="w-4 h-4 mr-1 text-gray-600" />
                  )}
                </button>
              </div>
              <div className="text-xs text-gray-700">
                <span className="font-semibold">Выделено: {selectedCount}</span>
                <span className="mx-2">|</span>
                <span className="font-semibold">Всего: {total}</span>
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden pl-2">
            {renderTreeRecursive(grouped, "")}
          </div>
        </div>
      );
    } catch {
      return null;
    }
  })();
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 min-h-0 overflow-hidden pl-2">
        {Object.entries(grouped).map(([epic, stories]) => {
          const epicIds = collectAllIds(stories);
          return renderGroup(
            epic,
            Object.entries(stories).map(([story, features]) => {
              const storyIds = collectAllIds(features);
              return renderGroup(
                story,
                Object.entries(features).map(([feature, results]) =>
                  renderGroup(
                    feature,
                    results.map((r) => (
                      <LeafRow
                        key={`${r.number}|${r.test_id}`}
                        item={r}
                        level={3}
                        pageType={pageType}
                      />
                    )),
                    `${epic}-${story}-${feature}`,
                    2,
                    results.map((r) => `${r.number}|${r.test_id}`)
                  )
                ),
                `${epic}-${story}`,
                1,
                storyIds
              );
            }),
            epic,
            0,
            epicIds
          );
        })}
      </div>
    </div>
  );
});
const TreeMemo = React.memo(Tree, (prevProps, nextProps) => {
  return (
    prevProps.items === nextProps.items &&
    prevProps.showStatusBar === nextProps.showStatusBar &&
    prevProps.selected === nextProps.selected
  );
});
const EnvBadge = ({ envText, params }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const pretty = Array.isArray(params) ? params : [];
  const ref = useRef(null);
  const handleEnter = () => {
    try {
      const badgeRect = ref.current?.getBoundingClientRect();
      const panel = document.querySelector(".tw-runs-select-panel");
      const panelRect = panel ? panel.getBoundingClientRect() : null;
      if (badgeRect && panelRect) {
        const desiredLeft = panelRect.right + 8;
        const maxLeft = Math.max(8, window.innerWidth - 400);
        setPos({
          top: badgeRect.top + badgeRect.height / 2,
          left: Math.min(desiredLeft, maxLeft),
        });
      }
    } catch {}
    setOpen(true);
  };
  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={() => setOpen(false)}
    >
      <span
        ref={ref}
        className="text-[10px] px-1 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-700 w-[10ch] text-center inline-block truncate"
      >
        {envText}
      </span>
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
const ParamsTooltipWrapper = ({ params, children }) => {
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
const TestSteps = ({ steps, level = 0 }) => {
  const [expandedSteps, setExpandedSteps] = useState(new Set());
  if (!Array.isArray(steps) || steps.length === 0) return null;
  const toggleStep = (stepIndex) => {
    const key = `${level}-${stepIndex}`;
    setExpandedSteps((prev) => {
      const clone = new Set(prev);
      clone.has(key) ? clone.delete(key) : clone.add(key);
      return clone;
    });
  };
  return (
    <div className="space-y-1">
      {steps.map((step, index) => {
        const stepKey = `${level}-${index}`;
        const hasSubSteps = Array.isArray(step.steps) && step.steps.length > 0;
        const isExpanded = expandedSteps.has(stepKey);
        const statusKey = normalizeStatusKey(step.status);
        const statusCfg = getStatus(step.status);
        return (
          <div key={stepKey} style={{ paddingLeft: `${level * 16}px` }}>
            <div
              className={`flex items-center space-x-2 py-1 px-3 rounded-md cursor-pointer transition-colors hover:bg-gray-50 ${
                statusKey === "failed"
                  ? "bg-red-50"
                  : statusKey === "passed"
                  ? "bg-green-50"
                  : "bg-gray-50"
              }`}
              onClick={() => hasSubSteps && toggleStep(index)}
            >
              {hasSubSteps ? (
                isExpanded ? (
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-gray-500" />
                )
              ) : (
                <div className="w-3" />
              )}
              {statusCfg.icon}
              <span
                className={`text-xs flex-1 ${
                  statusKey === "failed"
                    ? "text-red-700 font-medium"
                    : statusKey === "passed"
                    ? "text-green-700"
                    : "text-gray-700"
                }`}
              >
                {step.name}
              </span>
            </div>
            {hasSubSteps && isExpanded && (
              <TestSteps steps={step.steps} level={level + 1} />
            )}
          </div>
        );
      })}
    </div>
  );
};
const renderStacktrace = (raw) => {
  if (!raw) return null;
  const lines = raw.split("\n");
  const fileLineRegex = /\(([^()]+:\d+)\)/g;
  const renderLineWithClickableFile = (line) => {
    const parts = [];
    let lastIndex = 0;
    let match;
    while ((match = fileLineRegex.exec(line)) !== null) {
      const start = match.index;
      const end = fileLineRegex.lastIndex;
      if (start > lastIndex) {
        parts.push(line.slice(lastIndex, start));
      }
      const fileAndLine = match[1];
      parts.push(<span key={`${start}-lb`}>(</span>);
      parts.push(
        <span
          key={`${start}-fl`}
          className="underline decoration-dotted cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            copyToClipboard(fileAndLine);
          }}
          title="Скопировать"
          onMouseDown={(e) => e.preventDefault()}
        >
          {fileAndLine}
        </span>
      );
      parts.push(<span key={`${start}-rb`}>)</span>);
      lastIndex = end;
    }
    if (lastIndex < line.length) {
      parts.push(line.slice(lastIndex));
    }
    return parts.length > 0 ? parts : line;
  };
  return lines.map((line, idx) => {
    let className = "text-gray-700";
    if (idx === 0) {
      className = "font-semibold text-red-600";
    } else if (/Exception\b/.test(line) || /Error\b/.test(line)) {
      className = "text-red-500";
    } else if (/at\s+/.test(line)) {
      className = "text-gray-800";
    } else if (
      /\(Native Method\)/.test(line) ||
      /\(Unknown Source\)/.test(line)
    ) {
      className = "italic text-gray-500";
    }
    return (
      <div key={idx} className={className} style={{ lineHeight: 1.2 }}>
        {renderLineWithClickableFile(line)}
      </div>
    );
  });
};
const TestTree = ({
  tests,
  onTestSelect,
  selectedTest,
  pageType = "tests",
  checkedNodes = new Set(),
  onCreatePlan = () => {},
  onCheck = () => {},
  syncInfo,
  onUpdateSyncInfo = () => {},
}) => {
  const [filter, setFilter] = useState("");
  const [generalFilter, setGeneralFilter] = useState("");
  useEffect(() => {
    window.triggerSync = async () => {
      try {
        const response = await fetchJson(`${API}/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        console.error("Ошибка при синхронизации:", err);
      }
    };
    return () => {
      delete window.triggerSync;
    };
  }, [onUpdateSyncInfo]);
  const matchesFilter = (test, filterExpression) => {
    if (!filterExpression.trim()) return true;
    const tags = test.tags || [];
    let expression = filterExpression;
    const tagWithNotRegex = /!([a-zA-Z0-9_\-]+)/g;
    expression = expression.replace(tagWithNotRegex, (match, tag) => {
      return !tags.includes(tag) ? "true" : "false";
    });
    const tagRegex = /([a-zA-Z0-9_\-]+)/g;
    expression = expression.replace(tagRegex, (match) => {
      if (match === "true" || match === "false") return match;
      return tags.includes(match) ? "true" : "false";
    });
    expression = expression.replace(/&/g, "&&").replace(/\|/g, "||");
    try {
      return eval(expression);
    } catch (e) {
      return true;
    }
  };
  const matchesGeneralFilter = (test, searchTerm) => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    const fieldsToSearch = [
      test.name,
      test.test_id,
      test.number?.toString(),
      test.epic,
      test.story,
      test.feature,
      test.url,
      test.description,
      test.params_test,
      ...(test.tags || []),
      ...(test.tms_links || []),
    ];
    return fieldsToSearch.some(
      (field) => field && field.toString().toLowerCase().includes(searchLower)
    );
  };
  const filteredTests = useMemo(() => {
    return tests.filter((test) => {
      const matchesTags = matchesFilter(test, filter);
      const matchesGeneral = matchesGeneralFilter(test, generalFilter);
      return matchesTags && matchesGeneral;
    });
  }, [tests, filter, generalFilter]);
  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm flex flex-col h-full min-h-0">
      <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold">
            {pageType === "tests" ? "Тесты" : "Результаты тестов"}
          </h1>
          {pageType === "tests" && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                {syncInfo?.update ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Идет синхронизация...</span>
                  </>
                ) : (
                  <span>
                    Обновлено:{" "}
                    {syncInfo?.date_update_tests
                      ? new Date(syncInfo.date_update_tests).toLocaleString(
                          "ru-RU",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "н/д"}
                  </span>
                )}
              </div>
              <Button
                onClick={onCreatePlan}
                disabled={checkedNodes.size === 0}
                className="text-xs px-3 py-1 h-8"
              >
                Создать тест-план
              </Button>
            </div>
          )}
        </div>
        {pageType === "tests" && (
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Поиск"
                value={generalFilter}
                onChange={(e) => setGeneralFilter(e.target.value)}
                className="h-6 text-xs"
              />
            </div>
            <div className="w-1/2">
              <Input
                type="text"
                placeholder="Фильтр по тегам"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="h-6 text-xs"
              />
            </div>
          </div>
        )}
        <div
          className="flex flex items-center justify-between py-2"
          id="runner-panel"
          hidden
        >
          <TestRunnerPanel testPlanId="" />
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <TreeMemo
            items={filteredTests}
            getEpic={(t) => t.epic}
            getStory={(t) => t.story}
            getFeature={(t) => t.feature}
            onSelect={onTestSelect}
            selected={selectedTest}
            showStatusBar={false}
            checkedNodes={checkedNodes}
            onCheck={onCheck}
            pageType={pageType}
          />
        </ScrollArea>
      </div>
    </div>
  );
};
const TestRunnerPanel = ({ testPlanId }) => {
  const [pluginItems, setPluginItems] = useState([]);
  const [checkedNodesCount, setCheckedNodesCount] = useState(
    window.actualCheckedNodes?.size || 0
  );
  const [selectedEnv, setSelectedEnv] = useState(undefined);
  const [branchValue, setBranchValue] = useState("PUSHka");
  const [threadsValue, setThreadsValue] = useState("11");
  const [showAdditionalParams, setShowAdditionalParams] = useState(false);
  const [additionalParams, setAdditionalParams] = useState("");
  useEffect(() => {
    const loadItems = () => {
      const items = window.__PLUGIN_ENV_OPTIONS__ || [];
      const validItems = Array.isArray(items)
        ? items
            .map((item) =>
              typeof item === "object" && item.value ? item : null
            )
            .filter(Boolean)
        : [];
      setPluginItems(validItems);
    };
    loadItems();
    const onUpdate = () => {
      requestAnimationFrame(loadItems);
    };
    window.addEventListener("rp-env-updated", onUpdate);
    return () => {
      window.removeEventListener("rp-env-updated", onUpdate);
    };
  }, []);
  useEffect(() => {
    const handleActualCheckedNodesChanged = () => {
      requestAnimationFrame(() => {
        setCheckedNodesCount(window.actualCheckedNodes?.size || 0);
      });
    };
    window.addEventListener(
      "actualCheckedNodesChanged",
      handleActualCheckedNodesChanged
    );
    return () => {
      window.removeEventListener(
        "actualCheckedNodesChanged",
        handleActualCheckedNodesChanged
      );
    };
  }, []);
  const [showCopyOptions, setShowCopyOptions] = useState(false);
  const [showChangeStatusModal, setShowChangeStatusModal] = useState(false);
  const [changeStatusValue, setChangeStatusValue] = useState("passed");
  const [changeStatusMessage, setChangeStatusMessage] = useState("");
  const [needUpdating, setNeedUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const getCookie = (name) => {
    const match = document.cookie.match(
      new RegExp(
        "(?:^|; )" +
          name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, "\\$1") +
          "=([^;]*)"
      )
    );
    return match ? decodeURIComponent(match[1]) : undefined;
  };
  const setCookie = (name, value, days) => {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = "expires=" + d.toUTCString();
    document.cookie = `${name}=${encodeURIComponent(
      value
    )}; ${expires}; path=/`;
  };
  useEffect(() => {
    const cookieKey = testPlanId ? `tp_env_${testPlanId}` : "tp_env_global";
    const allowedValues = (pluginItems || [])
      .map((i) => i?.value)
      .filter(Boolean);
    let initial = undefined;
    const fromCookie = getCookie(cookieKey);
    if (fromCookie) initial = fromCookie;
    if (
      !initial ||
      (allowedValues.length > 0 && !allowedValues.includes(initial))
    ) {
      initial = pluginItems[0]?.value;
    }
    setSelectedEnv(initial);
    const el = document.getElementById("rp-env");
    if (el && initial) el.setAttribute("data-value", initial);
  }, [pluginItems, testPlanId]);
  useEffect(() => {
    const cookieKey = testPlanId
      ? `tp_branch_${testPlanId}`
      : "tp_branch_global";
    let initial = "PUSHka";
    const fromCookie = getCookie(cookieKey);
    if (fromCookie) initial = fromCookie;
    setBranchValue(initial);
  }, [testPlanId]);
  useEffect(() => {
    const cookieKey = testPlanId
      ? `tp_threads_${testPlanId}`
      : "tp_threads_global";
    let initial = "11";
    const fromCookie = getCookie(cookieKey);
    if (
      fromCookie &&
      /^\d+$/.test(fromCookie) &&
      parseInt(fromCookie, 10) >= 1
    ) {
      initial = fromCookie;
    }
    setThreadsValue(initial);
  }, [testPlanId]);
  useEffect(() => {
    const cookieKey = testPlanId
      ? `tp_additional_params_${testPlanId}`
      : "tp_additional_params_global";
    const fromCookie = getCookie(cookieKey);
    if (fromCookie) {
      setAdditionalParams(fromCookie);
    }
  }, [testPlanId]);
  useEffect(() => {
    const el = document.getElementById("rp-additional-params");
    if (el) {
      el.setAttribute("data-value", additionalParams);
    }
  }, [additionalParams]);
  const parseTestNode = (node) => {
    const parts = node.split("|");
    const fullPath = parts[1];
    if (!fullPath || !fullPath.includes("#")) {
      return null;
    }
    const [testClass, method] = fullPath.split("#");
    return { testClass, method };
  };
  const copyJUnit5Format = () => {
    if (!window.actualCheckedNodes || window.actualCheckedNodes.size === 0) {
      setShowCopyOptions(false);
      return;
    }
    const junit5Parts = [];
    for (const node of window.actualCheckedNodes) {
      const parsed = parseTestNode(node);
      if (parsed) {
        junit5Parts.push(`${parsed.testClass},${parsed.method}`);
      }
    }
    if (junit5Parts.length === 0) {
      setShowCopyOptions(false);
      return;
    }
    const junit5Format = junit5Parts.join("||");
    copyToClipboard(junit5Format)
      .catch((err) => {
        console.error("Failed to copy JUnit 5 format: ", err);
      })
      .finally(() => {
        setShowCopyOptions(false);
        window.clearCheckboxes?.();
      });
  };
  const handleRunSync = async () => {
    const result = await window.preSync?.();
    if (result !== false) {
      window.triggerSync?.();
    }
  };
  const copyMavenFormat = () => {
    if (!window.actualCheckedNodes || window.actualCheckedNodes.size === 0) {
      setShowCopyOptions(false);
      return;
    }
    const mavenParts = [];
    for (const node of window.actualCheckedNodes) {
      const parsed = parseTestNode(node);
      if (parsed) {
        mavenParts.push(`${parsed.testClass}#${parsed.method}`);
      }
    }
    if (mavenParts.length === 0) {
      setShowCopyOptions(false);
      return;
    }
    const mavenFormat = mavenParts.join(",");
    copyToClipboard(mavenFormat)
      .catch((err) => {
        console.error("Failed to copy Maven format: ", err);
      })
      .finally(() => {
        setShowCopyOptions(false);
        window.clearCheckboxes?.();
      });
  };
  return (
    <>
      <span>
        <div className="text-xs flex flex-wrap items-center gap-2">
          <div className="flex items-center">
            <label className="mr-2 text-gray-700">Потоки:</label>
            <Input
              id="rp-threads"
              type="number"
              value={threadsValue}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9]/g, "");
                const normalized =
                  v === "" ? "" : String(Math.max(1, parseInt(v, 10)));
                setThreadsValue(normalized);
                const cookieKey = testPlanId
                  ? `tp_threads_${testPlanId}`
                  : "tp_threads_global";
                const days = testPlanId ? 7 : 3650;
                if (normalized !== "") setCookie(cookieKey, normalized, days);
              }}
              className="w-16 h-6 text-xs"
              min="1"
            />
          </div>
          <div className="flex items-center">
            <label className="mr-2 text-gray-700">ID тест-плана:</label>
            <Input
              type="text"
              id="rp-testplan"
              defaultValue={testPlanId}
              className="w-[285px] h-6 text-xs"
            />
          </div>
          <div className="flex items-center">
            <label className="mr-2 text-gray-700">Ветка:</label>
            <Input
              id="rp-branch"
              type="text"
              value={branchValue}
              onChange={(e) => {
                const v = e.target.value;
                setBranchValue(v);
                const cookieKey = testPlanId
                  ? `tp_branch_${testPlanId}`
                  : "tp_branch_global";
                const days = testPlanId ? 7 : 3650;
                setCookie(cookieKey, v, days);
              }}
              className="w-[120px] h-6 text-xs"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-gray-700 whitespace-nowrap">Стенд:</label>
            <Select
              value={selectedEnv}
              onValueChange={(value) => {
                setSelectedEnv(value);
                const el = document.getElementById("rp-env");
                if (el) el.setAttribute("data-value", value);
                const cookieKey = testPlanId
                  ? `tp_env_${testPlanId}`
                  : "tp_env_global";
                const days = testPlanId ? 7 : 3650;
                setCookie(cookieKey, value, days);
              }}
            >
              <SelectTrigger
                id="rp-env"
                className="w-36 h-6 text-xs truncate"
                data-value={selectedEnv || pluginItems[0]?.value}
              >
                <SelectValue placeholder={pluginItems[0]?.label || ""} />
              </SelectTrigger>
              <SelectContent
                style={{ minWidth: "180px" }}
                className="max-h-60 overflow-auto"
              >
                {pluginItems.map(({ value, label }) => (
                  <SelectItem key={`plugin-${value}`} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdditionalParams(!showAdditionalParams)}
                className="h-8 w-8 rounded-md text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-800 focus-visible:ring-2 focus-visible:ring-gray-300"
                title={
                  showAdditionalParams
                    ? "Скрыть дополнительные параметры"
                    : "Показать дополнительные параметры"
                }
              >
                <FilePlus className="h-4 w-4" />
              </Button>
              <Textarea
                id="rp-additional-params"
                value={additionalParams}
                onChange={(e) => {
                  const value = e.target.value;
                  setAdditionalParams(value);
                  const cookieKey = testPlanId
                    ? `tp_additional_params_${testPlanId}`
                    : "tp_additional_params_global";
                  const days = testPlanId ? 7 : 3650;
                  setCookie(cookieKey, value, days);
                }}
                className="hidden"
                style={{ display: "none" }}
              />
            </div>
          </div>
          <div className="h-4 w-px bg-gray-300 mx-1" />
          <div className="flex items-center relative">
            <Button
              id="rp-start"
              disabled={window.actualCheckedNodes?.size === 0}
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md text-green-800 transition-all hover:bg-gray-100 hover:text-green-900 focus-visible:ring-2 focus-visible:ring-green-300"
              title="Запустить"
            >
              <Play className="h-4 w-4 fill-green-600 stroke-1" />
            </Button>
            <div id="rp-sync">
              <Button
                onClick={handleRunSync}
                className="h-7 w-7 rounded-md text-green-600 transition-all hover:bg-gray-100 hover:text-green-800 focus-visible:ring-2 focus-visible:ring-green-300"
                variant="ghost"
                size="icon"
                title="Синхронизировать"
              >
                <FolderSync className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-md text-gray-700 transition-all hover:bg-gray-100 hover:text-gray-800 focus-visible:ring-2 focus-visible:ring-gray-300"
                title="Скопировать"
                disabled={window.actualCheckedNodes?.size === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCopyOptions(!showCopyOptions);
                }}
              >
                <Copy className="h-4 w-4 fill-gray-200 stroke-1" />
              </Button>
              {showCopyOptions && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 w-32">
                  <button
                    className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-100"
                    onClick={copyJUnit5Format}
                  >
                    JUnit 5
                  </button>
                  <button
                    className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-100"
                    onClick={copyMavenFormat}
                  >
                    Maven
                  </button>
                </div>
              )}
            </div>
            {testPlanId && (
              <>
                <Button
                  className="h-7 w-7 rounded-md text-blue-600 transition-all hover:bg-gray-100 hover:text-blue-800 focus-visible:ring-2 focus-visible:ring-blue-300"
                  variant="ghost"
                  size="icon"
                  title="Изменить статус"
                  disabled={window.actualCheckedNodes?.size === 0}
                  onClick={() => setShowChangeStatusModal(true)}
                >
                  <ChartPie className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-md text-red-800 transition-all hover:bg-gray-100 hover:text-red-900 focus-visible:ring-2 focus-visible:ring-red-300"
                  title="Удалить"
                  disabled={window.actualCheckedNodes?.size === 0}
                  onClick={() => setShowDeleteModal(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </span>
      {showAdditionalParams &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={() => setShowAdditionalParams(false)}
          >
            <div
              className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">
                Дополнительные параметры запуска
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Параметры
                  </label>
                  <Textarea
                    value={additionalParams}
                    onChange={(e) => {
                      const value = e.target.value;
                      setAdditionalParams(value);
                      const cookieKey = testPlanId
                        ? `tp_additional_params_${testPlanId}`
                        : "tp_additional_params_global";
                      const days = testPlanId ? 7 : 3650;
                      setCookie(cookieKey, value, days);
                    }}
                    className="w-full h-32 text-sm resize-none"
                    rows={6}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAdditionalParams(false)}
                >
                  Отмена
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowAdditionalParams(false)}
                >
                  Готово
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
      {showChangeStatusModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => !isChangingStatus && setShowChangeStatusModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">
              Смена статуса выбранных тестов
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Статус
                </label>
                <select
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={changeStatusValue}
                  onChange={(e) => setChangeStatusValue(e.target.value)}
                >
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                  <option value="skipped">Skipped</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Сообщение
                </label>
                <textarea
                  className="w-full border rounded px-2 py-1 text-sm resize-y min-h-[80px]"
                  value={changeStatusMessage}
                  onChange={(e) => setChangeStatusMessage(e.target.value)}
                  placeholder="Опционально: укажите причину/комментарий"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="needUpdating"
                  type="checkbox"
                  className="h-4 w-4"
                  checked={needUpdating}
                  onChange={(e) => setNeedUpdating(e.target.checked)}
                />
                <label htmlFor="needUpdating" className="text-sm text-gray-800">
                  Требуется актуализация
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowChangeStatusModal(false)}
                disabled={isChangingStatus}
              >
                Отмена
              </Button>
              <Button
                onClick={async () => {
                  if (
                    !testPlanId ||
                    !window.actualCheckedNodes ||
                    window.actualCheckedNodes.size === 0
                  )
                    return;
                  try {
                    setIsChangingStatus(true);
                    const trResp = await fetchJson(
                      `${API}/testplan/${testPlanId}/testrun`,
                      { method: "POST" }
                    );
                    const newRunId = trResp?.test_run_id;
                    if (!newRunId)
                      throw new Error("Не удалось создать тест-ран");
                    const results = [];
                    for (const node of window.actualCheckedNodes) {
                      const [numStr, testId] = String(node).split("|");
                      if (!testId) continue;
                      const payload = {
                        test: { test_id: testId },
                        status: changeStatusValue,
                        number: String(numStr ?? ""),
                      };
                      const msg = (changeStatusMessage || "").trim();
                      if (msg) {
                        payload.message = msg;
                      }
                      results.push(payload);
                    }
                    if (results.length === 0)
                      throw new Error("Нет выбранных тестов");
                    const query = needUpdating ? `?need_updating=true` : "";
                    await fetchJson(`${API}/testrun/${newRunId}${query}`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(results),
                    });
                    setShowChangeStatusModal(false);
                    setChangeStatusMessage("");
                    setChangeStatusValue("passed");
                    setNeedUpdating(false);
                    window.clearCheckboxes?.();
                  } catch (e) {
                    console.error("Смена статуса не удалась:", e);
                    alert("Не удалось изменить статус. См. консоль.");
                  } finally {
                    setIsChangingStatus(false);
                  }
                }}
                disabled={isChangingStatus}
              >
                {isChangingStatus ? "Изменение..." : "Изменить"}
              </Button>
            </div>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => !isDeleting && setShowDeleteModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4 text-red-600">
              Удаление результатов тестов
            </h3>
            <div className="space-y-3">
              <p className="text-sm text-gray-700">
                Вы действительно хотите удалить все результаты выбранных тестов
                из всех запусков в этом тестплане?
              </p>
              <p className="text-sm text-red-600 font-medium">
                Выбрано тестов: {window.actualCheckedNodes?.size || 0}
              </p>
              <p className="text-xs text-gray-500">
                Это действие нельзя отменить. Все результаты и связанные файлы
                будут удалены.
              </p>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Отмена
              </Button>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={async () => {
                  if (window.actualCheckedNodes?.size === 0) return;
                  setIsDeleting(true);
                  try {
                    const testIds = Array.from(window.actualCheckedNodes).map(
                      (nodeId) => {
                        const parts = nodeId.split("|");
                        return parts[1];
                      }
                    );
                    const uniqueTestIds = [...new Set(testIds)];
                    const result = await fetchJson(
                      `${API}/testplan/${testPlanId}/delete_results`,
                      {
                        method: "DELETE",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${getCookie("access_token")}`,
                        },
                        body: JSON.stringify({ test_ids: uniqueTestIds }),
                      }
                    );
                    setShowDeleteModal(false);
                    window.clearCheckboxes?.();
                  } catch (e) {
                    console.error("Удаление не удалось:", e);
                    alert("Не удалось удалить результаты. См. консоль.");
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                disabled={isDeleting}
              >
                {isDeleting ? "Удаление..." : "Удалить"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
const ResultTree = ({
  results,
  onResultSelect,
  selectedResult,
  testPlanId,
}) => {
  return (
    <div className="flex flex-col h-full min-h-0 border border-gray-200 rounded bg-white">
      <div
        className="flex flex-wrap items-center justify-between px-4 py-2 border-b bg-gray-50 flex-shrink-0 gap-2"
        id="runner-panel"
        hidden
      >
        <TestRunnerPanel testPlanId={testPlanId} />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <TreeMemo
            items={results}
            getEpic={(r) => r.epic}
            getStory={(r) => r.story}
            getFeature={(r) => r.feature}
            onSelect={onResultSelect}
            selected={selectedResult}
            showStatusBar={true}
            pageType="results"
          />
        </ScrollArea>
      </div>
    </div>
  );
};
const TestResultDetail = ({ result }) => {
  if (!result) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Выберите тест для просмотра результатов</p>
        </div>
      </div>
    );
  }
  const [activeTab, setActiveTab] = useState("current");
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadedTestId, setLoadedTestId] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const fileUrl = previewFile
    ? `${BACKEND_URL}/api/file/${result.test_run_id}/${previewFile.file_id}`
    : "";
  const statusKey = normalizeStatusKey(result.status);
  useEffect(() => {
    if (
      activeTab === "history" &&
      !loadingHistory &&
      loadedTestId !== result.test_id
    ) {
      setLoadingHistory(true);
      const encodedTestId = encodeURIComponent(result.test_id);
      const planId = window.location.pathname.split("/")[3];
      const historyUrl = planId
        ? `${API}/testplan/${planId}/${encodedTestId}/history`
        : `${API}/test/${encodedTestId}/history`;
      fetchJson(historyUrl)
        .then((data) => {
          setHistory(data.history);
          setLoadedTestId(result.test_id);
          setLoadingHistory(false);
        })
        .catch((err) => {
          console.error("Error fetching test history:", err);
          setHistory([]);
          setLoadedTestId(null);
          setLoadingHistory(false);
        });
    }
    if (activeTab === "current") {
      setLoadedTestId(null);
    }
  }, [activeTab, result.test_id, loadingHistory, loadedTestId]);
  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-white">
      <div className="border-b">
        <div className="flex">
          <button
            className={`px-4 py-2 text-sm font-medium relative ${
              activeTab === "current"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("current")}
          >
            Текущий результат
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium relative ${
              activeTab === "history"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("history")}
          >
            История запусков
          </button>
        </div>
      </div>
      <div className="p-6 space-y-6 flex-1 overflow-auto w-full">
        {activeTab === "current" ? (
          <>
            <div className="border-b pb-4">
              <div className="flex items-center justify-between mb-2 break-all">
                <h2 className="text-xl font-mono font-bold text-gray-800">
                  {result.name}
                </h2>
                <StatusBadge status={result.status} />
              </div>
              {result.test_id && (
                <p
                  className="text-sm text-gray-600 break-all cursor-pointer hover:underline"
                  onClick={() => copyToClipboard(result.test_id)}
                >
                  ID: {result.test_id}
                </p>
              )}
              {(() => {
                const ownerVal = Array.isArray(result.params_test)
                  ? result.params_test.find(
                      (x) =>
                        x &&
                        typeof x === "object" &&
                        Object.prototype.hasOwnProperty.call(x, "owner")
                    )?.owner
                  : undefined;
                const value = ownerVal ? String(ownerVal) : "Не указан";
                const badgeClass =
                  value === "Не указан"
                    ? "bg-gray-100 text-gray-600"
                    : "bg-blue-100 text-blue-700";
                return (
                  <div className="mt-1">
                    <span className="text-sm font-semibold text-gray-600 mr-2">
                      Владелец:
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}
                    >
                      {value}
                    </span>
                  </div>
                );
              })()}
            </div>
            {result.message && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  Сообщение
                </h3>
                <code className="block p-3 p-3 bg-red-50 border border-red-200 rounded text-xs text-gray-800 break-all max-w-full min-w-0 font-mono whitespace-pre-wrap">
                  {renderStacktrace(result.message)}
                </code>
              </div>
            )}
            {result.stacktrace && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  Трейс
                </h3>
                <div className="relative group">
                  <div
                    className="overflow-auto rounded border border-gray-200 bg-white"
                    style={{ maxHeight: "400px" }}
                  >
                    <code className="block p-3 text-xs font-mono whitespace-pre-wrap break-all">
                      {renderStacktrace(result.stacktrace)}
                    </code>
                  </div>
                  <Button
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/80 hover:bg-white border border-gray-300 shadow-sm text-gray-700 text-xs py-1 px-2 h-auto"
                    onClick={async (e) => {
                      try {
                        await copyToClipboard(result.stacktrace);
                      } catch (err) {
                        console.error("Failed to copy stacktrace:", err);
                      }
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Копировать
                  </Button>
                </div>
              </div>
            )}
            {result.links && result.links.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  Ссылки
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.links.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded inline-flex items-center gap-1"
                    >
                      {/\.mp4(?:$|[?#])/i.test(link.url || "") && (
                        <Clapperboard className="w-4 h-4 text-gray-600 mr-1" />
                      )}
                      <span>{link.name || link.url}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  Время начала
                </h3>
                <p className="text-sm text-gray-600">
                  {result.date_start
                    ? new Date(result.date_start).toLocaleString("ru-RU")
                    : "–"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  Длительность
                </h3>
                <p className="text-sm text-gray-600">
                  {result.date_start && result.date_end
                    ? (() => {
                        const diffMs =
                          new Date(result.date_end) -
                          new Date(result.date_start);
                        const diffSeconds = diffMs / 1000;
                        if (diffSeconds < 60) {
                          return `${diffSeconds.toFixed(2)} сек`;
                        } else {
                          const diffMinutes = diffSeconds / 60;
                          return `${diffMinutes.toFixed(1)} мин`;
                        }
                      })()
                    : "–"}
                </p>
              </div>
            </div>
            {result.steps && result.steps.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  Шаги выполнения
                </h3>
                <TestSteps steps={result.steps} />
              </div>
            )}
            {Array.isArray(result.params) && result.params.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  Параметры
                </h3>
                <div className="space-y-2">
                  {result.params.map((paramSet, idx) => (
                    <div key={idx} className="rounded-md bg-gray-50 p-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {Object.entries(paramSet).map(([k, v]) => (
                          <div key={k} className="flex items-start gap-2">
                            <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                              {k}
                            </span>
                            <span className="text-xs text-gray-800 font-mono break-all">
                              {String(v)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {result.tags && result.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  Теги
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {result.files?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1.5">
                  Файлы
                </h3>
                <ul className="space-y-1">
                  {result.files.map((file) => (
                    <li key={file.file_id}>
                      <button
                        onClick={() => {
                          const name = file.filename || "";
                          const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(
                            name
                          );
                          const isText =
                            /\.(txt|log|json|xml|ya?ml|css|js|ts|jsx|tsx|md)$/i.test(
                              name
                            );
                          if (isImage || isText) {
                            setPreviewFile(file);
                            return;
                          }
                          const url = `${BACKEND_URL}/api/file/${result.test_run_id}/${file.file_id}`;
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = file.filename || "file";
                          a.style.display = "none";
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                        }}
                        className="flex items-center justify-between w-full text-left text-xs text-gray-800 hover:text-blue-600 hover:bg-gray-50 px-1 py-0.5 rounded transition-all duration-100 group"
                      >
                        <div className="flex items-center truncate flex-1">
                          {(() => {
                            const name = file.filename || "";
                            const isImg = /\.(png|jpe?g|gif|webp|svg)$/i.test(
                              name
                            );
                            const isTxt =
                              /\.(txt|log|json|xml|ya?ml|css|js|ts|jsx|tsx|md)$/i.test(
                                name
                              );
                            if (isImg) {
                              return (
                                <svg
                                  className="h-4 w-4 text-green-500 mr-2 flex-shrink-0"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M8.5 11.5l2.5 3 3.5-4.5L21 18H3l5.5-6.5z"
                                  />
                                  <circle
                                    cx="8"
                                    cy="9"
                                    r="1.25"
                                    fill="currentColor"
                                  />
                                </svg>
                              );
                            }
                            if (isTxt) {
                              return (
                                <svg
                                  className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                              );
                            }
                            return (
                              <svg
                                className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M7 3h6l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"
                                />
                              </svg>
                            );
                          })()}
                          <span className="truncate">{file.filename}</span>
                        </div>
                        <span className="opacity-0 group-hover:opacity-100 text-gray-400 transition-opacity duration-150 ml-2">
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 min-h-0 overflow-auto whitespace-pre-wrap break-all">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              История запусков теста
            </h2>
            {loadingHistory ? (
              <div className="flex items-center justify-center h-32">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Нет данных об истории запусков
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {history.map((item, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">
                              {item.test_plan_name}
                            </h3>
                            <Badge variant="outline">
                              {item.test_plan_env}
                            </Badge>
                          </div>
                        </div>
                        <StatusBadge status={item.status} />
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Начало:</span>{" "}
                            {item.date_start
                              ? new Date(item.date_start).toLocaleString(
                                  "ru-RU"
                                )
                              : "–"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Длительность:</span>{" "}
                            {item.date_start && item.date_end
                              ? (() => {
                                  const diffMs =
                                    new Date(item.date_end) -
                                    new Date(item.date_start);
                                  const diffSeconds = diffMs / 1000;
                                  if (diffSeconds < 60) {
                                    return `${diffSeconds.toFixed(2)} сек`;
                                  } else {
                                    const diffMinutes = diffSeconds / 60;
                                    return `${diffMinutes.toFixed(1)} мин`;
                                  }
                                })()
                              : "–"}
                          </p>
                        </div>
                      </div>
                      {item.message && (
                        <div className="mt-2">
                          <p className="text-sm bg-red-50 border border-red-200 rounded p-2 text-gray-800">
                            {item.message}
                          </p>
                        </div>
                      )}
                      {Array.isArray(item.params) && item.params.length > 0 && (
                        <div className="mt-3">
                          <div className="text-sm font-semibold text-gray-700 mb-1">
                            Параметры
                          </div>
                          <div className="space-y-2">
                            {item.params.map((paramSet, idx2) => (
                              <div
                                key={idx2}
                                className="rounded-md bg-gray-50 p-2"
                              >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                  {Object.entries(paramSet).map(([k, v]) => (
                                    <div
                                      key={k}
                                      className="flex items-start gap-2"
                                    >
                                      <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                                        {k}
                                      </span>
                                      <span className="text-xs text-gray-800 font-mono break-all">
                                        {String(v)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <FilePreviewModal
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        fileUrl={fileUrl}
        filename={previewFile?.filename || ""}
      />
    </div>
  );
};
const FilePreviewModal = ({ fileUrl, filename, isOpen, onClose }) => {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(filename);
  const isText = /\.(txt|log|json|xml|ya?ml|css|js|ts|jsx|tsx|md)$/i.test(
    filename
  );
  useEffect(() => {
    if (!isOpen) return;
    if (isImage || !isText) return;
    setIsLoading(true);
    setError("");
    fetch(fileUrl, {
      headers: {
        Accept: "text/plain",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Не удалось загрузить файл");
        return res.text();
      })
      .then((text) => {
        setContent(text);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [fileUrl, filename, isOpen, isImage, isText]);
  if (!isOpen) return null;
  return (
    <div
      className="fixed top-0 left-0 w-screen h-screen z-50 flex items-center justify-center bg-black bg-opacity-70"
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        overflow: "auto",
      }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-[95vw] h-[95vh] flex flex-col text-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="text-base sm:text-lg font-medium text-gray-800 truncate pr-2">
            {filename}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const a = document.createElement("a");
                a.href = fileUrl;
                a.download = filename || "file";
                a.style.display = "none";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
              className="inline-flex items-center px-2 py-1 text-xs sm:text-sm border rounded text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Скачать
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition p-1"
              aria-label="Закрыть"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden bg-gray-50">
          {isImage ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <img
                src={fileUrl}
                alt={filename}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                  const parent = e.target.parentElement;
                  parent.innerHTML =
                    '<p class="text-red-500">Не удалось загрузить изображение</p>';
                }}
              />
            </div>
          ) : isText ? (
            isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-gray-500">Загрузка...</p>
              </div>
            ) : error ? (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-red-500">{error}</p>
              </div>
            ) : (
              <pre className="w-full h-full text-xs font-mono whitespace-pre-wrap bg-gray-50 p-4 overflow-auto">
                {content}
              </pre>
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-600">
                  Файл не поддерживается для просмотра.
                </p>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-blue-600 underline"
                >
                  Скачать файл
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
const useResizablePanel = (initialWidth = 50) => {
  const [leftWidth, setLeftWidth] = useState(initialWidth);
  const [isDragging, setIsDragging] = useState(false);
  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const containerWidth = window.innerWidth - 256;
      const newLeftWidth = Math.min(
        Math.max(((e.clientX - 256) / containerWidth) * 100, 20),
        80
      );
      setLeftWidth(newLeftWidth);
    },
    [isDragging]
  );
  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove]);
  const handleMouseDown = (e) => {
    setIsDragging(true);
    e.preventDefault();
  };
  return { leftWidth, handleMouseDown, isDragging };
};
const TestDetailWithHistory = ({ test }) => {
  const [activeTab, setActiveTab] = useState("current");
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadedTestId, setLoadedTestId] = useState(null);
  const flakyInfo = useMemo(() => {
    if (!Array.isArray(history) || history.length === 0) {
      return null;
    }
    const itemsWithStatus = history.filter(
      (item) => typeof item?.status === "string" && item.status.trim() !== ""
    );
    if (itemsWithStatus.length === 0) {
      return null;
    }
    const unstableCount = itemsWithStatus.filter(
      (item) => item.status.toLowerCase() === "failed"
    ).length;
    const percentRaw = (unstableCount / itemsWithStatus.length) * 100;
    const formattedPercent =
      percentRaw < 10 ? percentRaw.toFixed(1) : percentRaw.toFixed(0);
    if (percentRaw <= 5) {
      return {
        label: "Отлично",
        badgeClass: "bg-green-50 border border-green-200 text-green-700",
        percentClass: "text-green-600",
        percentValue: formattedPercent,
      };
    }
    if (percentRaw <= 20) {
      return {
        label: "Умеренно нестабилен",
        badgeClass: "bg-yellow-50 border border-yellow-200 text-yellow-700",
        percentClass: "text-yellow-600",
        percentValue: formattedPercent,
      };
    }
    return {
      label: "Плохая стабильность",
      badgeClass: "bg-red-50 border border-red-200 text-red-700",
      percentClass: "text-red-600",
      percentValue: formattedPercent,
    };
  }, [history]);
  useEffect(() => {
    if (
      activeTab === "history" &&
      !loadingHistory &&
      loadedTestId !== test.test_id
    ) {
      setLoadingHistory(true);
      const encodedTestId = encodeURIComponent(test.test_id);
      fetchJson(`${API}/test/${encodedTestId}/history`)
        .then((data) => {
          setHistory(data.history);
          setLoadedTestId(test.test_id);
          setLoadingHistory(false);
        })
        .catch((err) => {
          console.error("Error fetching test history:", err);
          setHistory([]);
          setLoadedTestId(null);
          setLoadingHistory(false);
        });
    }
    if (activeTab === "current") {
      setLoadedTestId(null);
    }
  }, [activeTab, test.test_id, loadingHistory, loadedTestId]);
  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-white whitespace-pre-wrap break-all">
      <div className="border-b">
        <div className="flex">
          <button
            className={`px-4 py-2 text-sm font-medium relative ${
              activeTab === "current"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("current")}
          >
            Текущий тест
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium relative ${
              activeTab === "history"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("history")}
          >
            История запусков
          </button>
        </div>
      </div>
      <div className="p-6 space-y-6 flex-1 overflow-auto w-full">
        {activeTab === "current" ? (
          <>
            <div className="border-b pb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {test.name}
                  </h1>
                  {test.template && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                      Параметризованный
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600">
                ID:{" "}
                <span
                  className="cursor-pointer hover:underline"
                  onClick={() => copyToClipboard(test.test_id)}
                >
                  {test.test_id || "—"}
                </span>
              </p>
              {(() => {
                const ownerVal = Array.isArray(test.params_test)
                  ? test.params_test.find(
                      (x) =>
                        x &&
                        typeof x === "object" &&
                        Object.prototype.hasOwnProperty.call(x, "owner")
                    )?.owner
                  : undefined;
                const value = ownerVal ? String(ownerVal) : "Не указан";
                const badgeClass =
                  value === "Не указан"
                    ? "bg-gray-100 text-gray-600"
                    : "bg-blue-100 text-blue-700";
                return (
                  <div className="mt-1">
                    <span className="text-sm font-semibold text-gray-600 mr-2">
                      Владелец:
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}
                    >
                      {value}
                    </span>
                  </div>
                );
              })()}
            </div>
            <div className="space-y-4">
              {[
                { label: "Epic", value: test.epic, fallback: "Не указан" },
                { label: "Story", value: test.story, fallback: "Не указан" },
                {
                  label: "Feature",
                  value: test.feature,
                  fallback: "Не указан",
                },
              ].map(({ label, value, fallback }) => (
                <div key={label}>
                  <label className="text-sm font-semibold text-gray-600 block mb-2">
                    {label}:
                  </label>
                  <p className="text-sm text-gray-900">{value || fallback}</p>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t">
              <label className="text-sm font-semibold text-gray-600 block mb-3">
                Теги:
              </label>
              <div className="flex flex-wrap gap-2">
                {test.tags &&
                  test.tags.length > 0 &&
                  test.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="px-3 py-1">
                      {tag}
                    </Badge>
                  ))}
              </div>
            </div>
            {test.tms_links && test.tms_links.length > 0 && (
              <div className="pt-4 border-t">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  Связи
                </h3>
                <div className="flex flex-wrap gap-2">
                  {test.tms_links.map((link, index) => {
                    const linkId = link.split("/").pop();
                    return (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded"
                      >
                        {linkId}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              История запусков теста
            </h2>
            {loadingHistory ? (
              <div className="flex items-center justify-center h-32">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Нет данных об истории запусков
              </div>
            ) : (
              <div className="space-y-4">
                {flakyInfo && (
                  <div>
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${flakyInfo.badgeClass}`}
                    >
                      <span className="text-sm normal-case font-medium">
                        {flakyInfo.label}
                      </span>
                      <span
                        className={`normal-case font-normal ${flakyInfo.percentClass}`}
                      >
                        {flakyInfo.percentValue}%
                      </span>
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-4">
                  {history.map((item, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">
                              {item.test_plan_name}
                            </h3>
                            <Badge variant="outline">
                              {item.test_plan_env}
                            </Badge>
                          </div>
                        </div>
                        <StatusBadge status={item.status} />
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Начало:</span>{" "}
                            {item.date_start
                              ? new Date(item.date_start).toLocaleString(
                                  "ru-RU"
                                )
                              : "–"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Длительность:</span>{" "}
                            {item.date_start && item.date_end
                              ? (() => {
                                  const diffMs =
                                    new Date(item.date_end) -
                                    new Date(item.date_start);
                                  const diffSeconds = diffMs / 1000;
                                  if (diffSeconds < 60) {
                                    return `${diffSeconds.toFixed(2)} сек`;
                                  } else {
                                    const diffMinutes = diffSeconds / 60;
                                    return `${diffMinutes.toFixed(1)} мин`;
                                  }
                                })()
                              : "–"}
                          </p>
                        </div>
                      </div>
                      {item.message && (
                        <div className="mt-2">
                          <p className="text-sm bg-red-50 border border-red-200 rounded p-2 text-gray-800">
                            {item.message}
                          </p>
                        </div>
                      )}
                      {Array.isArray(item.params) && item.params.length > 0 && (
                        <div className="mt-3">
                          <div className="text-sm font-semibold text-gray-700 mb-1">
                            Параметры
                          </div>
                          <div className="space-y-2">
                            {item.params.map((paramSet, idx2) => (
                              <div
                                key={idx2}
                                className="rounded-md bg-gray-50 p-2"
                              >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                  {Object.entries(paramSet).map(([k, v]) => (
                                    <div
                                      key={k}
                                      className="flex items-start gap-2"
                                    >
                                      <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                                        {k}
                                      </span>
                                      <span className="text-xs text-gray-800 font-mono break-all">
                                        {String(v)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
const TestsPage = () => {
  const navigate = useNavigate();
  const fetchTests = useCallback(() => fetchJson(`${API}/test`), []);
  const {
    data: tests,
    loading,
    refetch: refetchTests,
  } = useFetch(fetchTests, [], []);
  const [selectedTest, setSelectedTest] = useState(null);
  const { leftWidth, handleMouseDown, isDragging } = useResizablePanel(45);
  const [checkedNodes, setCheckedNodes] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTestsForPlan, setSelectedTestsForPlan] = useState([]);
  const [syncInfo, setSyncInfo] = useState({
    update: true,
    date_update_tests: null,
  });
  const fetchSyncInfo = useCallback(async () => {
    try {
      const info = await fetchJson(`${API}/info`);
      setSyncInfo(info);
    } catch (error) {
      console.error("Failed to fetch sync info:", error);
      setSyncInfo({ update: false, date_update_tests: "Ошибка загрузки" });
    }
  }, []);
  useEffect(() => {
    fetchSyncInfo();
    const handleTestsUpdate = () => {
      fetchSyncInfo();
      refetchTests();
    };
    window.addEventListener("tests-updated", handleTestsUpdate);
    return () => {
      window.removeEventListener("tests-updated", handleTestsUpdate);
    };
  }, [fetchSyncInfo, refetchTests]);
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape" && selectedTest) {
        event.preventDefault();
        setSelectedTest(null);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [selectedTest]);
  const handleCreateTestPlan = () => {
    const selected = (tests || []).filter((t) => {
      const id = `${t.number}|${t.test_id}`;
      return checkedNodes.has(id);
    });
    if (selected.length === 0) {
      return;
    }
    setSelectedTestsForPlan(selected);
    setIsModalOpen(true);
  };
  const handleSyncClick = () => {
    console.log("Synchronize button clicked.");
  };
  if (loading) return <Loader />;
  return (
    <div className="h-full flex">
      <div
        className="bg-white border-r flex flex-col h-full min-h-0"
        style={{ width: `${leftWidth}%` }}
      >
        <TestTree
          tests={tests || []}
          onTestSelect={setSelectedTest}
          selectedTest={selectedTest}
          pageType="tests"
          checkedNodes={checkedNodes}
          onCreatePlan={handleCreateTestPlan}
          onCheck={setCheckedNodes}
          syncInfo={syncInfo}
          onUpdateSyncInfo={setSyncInfo}
        />
      </div>
      <div
        className={`w-1 cursor-col-resize hover:bg-blue-400 transition-colors ${
          isDragging ? "bg-blue-500" : "bg-gray-200"
        }`}
        onMouseDown={handleMouseDown}
      />
      <div
        className="bg-white overflow-hidden flex flex-col h-full min-h-0"
        style={{ width: `${100 - leftWidth}%` }}
      >
        {selectedTest ? (
          <TestDetailWithHistory test={selectedTest} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Выберите тест для просмотра деталей</p>
            </div>
          </div>
        )}
      </div>
      <CreateTestPlanModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTestsForPlan([]);
        }}
        onCreated={(newPlan) => {
          setIsModalOpen(false);
          setSelectedTestsForPlan([]);
          setSelectedTest(null);
          navigate(`/tw/test-plans/${newPlan.test_plan_id}`);
        }}
        initialTests={selectedTestsForPlan}
      />
    </div>
  );
};
function sha1Fallback(bytes) {
  function rotl(n, s) {
    return (n << s) | (n >>> (32 - s));
  }
  function toUint32(n) {
    return n >>> 0;
  }
  const ml = bytes.length * 8;
  const withOne = new Uint8Array(bytes.length + 1);
  withOne.set(bytes);
  withOne[bytes.length] = 0x80;
  let l = withOne.length;
  while (l % 64 !== 56) l++;
  const padded = new Uint8Array(l + 8);
  padded.set(withOne);
  const dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 8, Math.floor(ml / 0x100000000));
  dv.setUint32(padded.length - 4, ml >>> 0);
  let h0 = 0x67452301,
    h1 = 0xefcdab89,
    h2 = 0x98badcfe,
    h3 = 0x10325476,
    h4 = 0xc3d2e1f0;
  const w = new Uint32Array(80);
  for (let i = 0; i < padded.length; i += 64) {
    for (let j = 0; j < 16; j++) w[j] = dv.getUint32(i + j * 4);
    for (let j = 16; j < 80; j++)
      w[j] = rotl(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
    let a = h0,
      b = h1,
      c = h2,
      d = h3,
      e = h4;
    for (let j = 0; j < 80; j++) {
      let f, k;
      if (j < 20) {
        f = (b & c) | (~b & d);
        k = 0x5a827999;
      } else if (j < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (j < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }
      const t = (rotl(a, 5) + f + e + k + w[j]) >>> 0;
      e = d;
      d = c;
      c = rotl(b, 30) >>> 0;
      b = a;
      a = t;
    }
    h0 = toUint32(h0 + a);
    h1 = toUint32(h1 + b);
    h2 = toUint32(h2 + c);
    h3 = toUint32(h3 + d);
    h4 = toUint32(h4 + e);
  }
  const out = new Uint8Array(20);
  const outDv = new DataView(out.buffer);
  outDv.setUint32(0, h0);
  outDv.setUint32(4, h1);
  outDv.setUint32(8, h2);
  outDv.setUint32(12, h3);
  outDv.setUint32(16, h4);
  return out;
}
async function uuidv5(name, namespaceUuid) {
  const ns = namespaceUuid.replace(/-/g, "");
  const nsBytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++)
    nsBytes[i] = parseInt(ns.slice(i * 2, i * 2 + 2), 16);
  const encoder = new TextEncoder();
  const nameBytes = encoder.encode(name);
  const toHash = new Uint8Array(nsBytes.length + nameBytes.length);
  toHash.set(nsBytes, 0);
  toHash.set(nameBytes, nsBytes.length);
  let fullHash;
  if (window.crypto?.subtle?.digest) {
    const hashBuffer = await window.crypto.subtle.digest("SHA-1", toHash);
    fullHash = new Uint8Array(hashBuffer);
  } else {
    fullHash = sha1Fallback(toHash);
  }
  const hash = fullHash.slice(0, 16);
  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  const hex = [...hash].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(
    12,
    16
  )}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
const UUID_NAMESPACE_URL = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
const TestRunsPage = () => {
  const { planId, runId, testUuid } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [testPlans, setTestPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planDetails, setPlanDetails] = useState(null);
  const [planMetrics, setPlanMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeletePlanModal, setShowDeletePlanModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [isDeletingPlan, setIsDeletingPlan] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPlans, setTotalPlans] = useState(0);
  const pageSize = 10;
  const statusOptions = [
    { value: "passed", label: "Passed" },
    { value: "failed", label: "Failed" },
    { value: "waiting", label: "Waiting" },
    { value: "started", label: "Started" },
    { value: "skipped", label: "Skipped" },
  ];
  const getCookie = (name) => {
    const match = document.cookie.match(
      new RegExp(
        "(?:^|; )" +
          name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, "\\$1") +
          "=([^;]*)"
      )
    );
    return match ? decodeURIComponent(match[1]) : undefined;
  };
  const setCookie = (name, value, days) => {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = "expires=" + d.toUTCString();
    document.cookie = `${name}=${encodeURIComponent(
      value
    )}; ${expires}; path=/`;
  };
  const [statusFilters, setStatusFilters] = useState(() => {
    try {
      const saved = getCookie("tp_list_status_filters");
      if (saved) {
        const arr = JSON.parse(saved);
        if (
          Array.isArray(arr) &&
          arr.every((v) => typeof v === "string") &&
          arr.length > 0
        ) {
          return arr;
        }
      }
    } catch {}
    return statusOptions.map((opt) => opt.value);
  });
  const [nameFilterDraft, setNameFilterDraft] = useState("");
  const [nameFilterApplied, setNameFilterApplied] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [tagFilter, setTagFilter] = useState("");
  const [needUpdateOnly, setNeedUpdateOnly] = useState(false);
  const [isTagFilterOpen, setIsTagFilterOpen] = useState(false);
  useEffect(() => {
    try {
      setCookie(
        "tp_list_status_filters",
        JSON.stringify(statusFilters || []),
        3650
      );
    } catch {}
  }, [statusFilters]);
  const { leftWidth, handleMouseDown, isDragging } = useResizablePanel(45);
  const [planRuns, setPlanRuns] = useState([]);
  const [runsLoading, setRunsLoading] = useState(false);
  useEffect(() => {
    const fetchRuns = async () => {
      if (!planId) return;
      setRunsLoading(true);
      try {
        const data = await fetchJson(`${API}/testplan/${planId}/testruns`);
        setPlanRuns(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Error fetching plan runs:", e);
        setPlanRuns([]);
      } finally {
        setRunsLoading(false);
      }
    };
    fetchRuns();
  }, [planId]);
  const [checkedNodesCount, setCheckedNodesCount] = useState(
    window.actualCheckedNodes?.size || 0
  );
  useEffect(() => {
    const handleActualCheckedNodesChanged = () => {
      requestAnimationFrame(() => {
        setCheckedNodesCount(window.actualCheckedNodes?.size || 0);
      });
    };
    window.addEventListener(
      "actualCheckedNodesChanged",
      handleActualCheckedNodesChanged
    );
    return () => {
      window.removeEventListener(
        "actualCheckedNodesChanged",
        handleActualCheckedNodesChanged
      );
    };
  }, []);
  const prevPlanRunRef = useRef({ planId: null, runId: null });
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (planId) {
          const switchingToNewContext =
            prevPlanRunRef.current.planId !== planId ||
            prevPlanRunRef.current.runId !== runId;
          if (switchingToNewContext) {
            setPlanDetails(null);
            setSelectedResult(null);
          }
          const url = runId
            ? `${API}/testplan/${planId}/from/${runId}`
            : `${API}/testplan/${planId}`;
          const data = await fetchJson(url);
          setSelectedPlan(data);
          setPlanDetails(data);
        } else {
          const url =
            `${API}/testplan?page=${currentPage}&size=${pageSize}` +
            (nameFilterApplied
              ? `&name_filter=${encodeURIComponent(nameFilterApplied)}`
              : "");
          const data = await fetchJson(url);
          setTestPlans(Array.isArray(data.test_plans) ? data.test_plans : []);
          setTotalPlans(data.total_count || 0);
          setSelectedPlan(null);
          setPlanDetails(null);
          setSelectedResult(null);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        if (!planId) {
          setTestPlans([]);
          setTotalPlans(0);
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
    prevPlanRunRef.current = { planId, runId };
  }, [planId, runId, currentPage, navigate, nameFilterApplied]);
  const lastProcessedHashRef = useRef(null);
  useEffect(() => {
    lastProcessedHashRef.current = null;
  }, [planId, runId]);
  useEffect(() => {
    if (!planDetails) return;
    const hashUuid = (location.hash || "").replace(/^#/, "") || testUuid || "";
    if (!hashUuid || hashUuid === lastProcessedHashRef.current) return;
    lastProcessedHashRef.current = hashUuid;
    let cancelled = false;
    const pick = async () => {
      const results = Array.isArray(planDetails.results)
        ? planDetails.results
        : [];
      for (const r of results) {
        try {
          const u = await uuidv5(
            `${r.test_id}-${r.number}`,
            UUID_NAMESPACE_URL
          );
          if (u === hashUuid) {
            if (!cancelled) setSelectedResult(r);
            break;
          }
        } catch (e) {}
      }
    };
    pick();
    return () => {
      cancelled = true;
    };
  }, [location.hash, testUuid, planDetails]);
  useEffect(() => {
    const onHashChange = () => {};
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  useEffect(() => {
    const handler = (e) => {
      const incomingId = e.detail?.test_plan_id;
      if (selectedPlan && selectedPlan.test_plan_id === incomingId) {
        const url = runId
          ? `${API}/testplan/${incomingId}/from/${runId}`
          : `${API}/testplan/${incomingId}`;
        fetchJson(url).then((data) => {
          const curr = new URL(window.location.href);
          const currPlan = curr.pathname.split("/")[3];
          const currRun = curr.pathname.split("/")[4];
          if (
            currPlan === incomingId &&
            ((runId && currRun === runId) || (!runId && !currRun))
          ) {
            setPlanDetails(data);
          }
        });
        setRunsLoading(true);
        fetchJson(`${API}/testplan/${incomingId}/testruns`)
          .then((runsData) => {
            if (Array.isArray(runsData)) {
              setPlanRuns(runsData);
            }
          })
          .catch(() => {})
          .finally(() => setRunsLoading(false));
      }
    };
    window.addEventListener("testplan-updated", handler);
    return () => window.removeEventListener("testplan-updated", handler);
  }, [selectedPlan, runId]);
  const [selectedResult, setSelectedResult] = useState(null);
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape" && selectedResult) {
        event.preventDefault();
        setSelectedResult(null);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [selectedResult]);
  const deletePlan = async (planIdToDelete) => {
    try {
      await fetchJson(`${API}/testplan/${planIdToDelete}`, {
        method: "DELETE",
      });
      setTestPlans((prev = []) =>
        prev.filter((p) => p.test_plan_id !== planIdToDelete)
      );
      if (selectedPlan?.test_plan_id === planIdToDelete) {
        setSelectedPlan(null);
        setPlanDetails(null);
        setSelectedResult(null);
        navigate("/tw/test-plans", { replace: true });
      }
      setShowDeletePlanModal(false);
      setPlanToDelete(null);
    } catch (e) {
      console.error("Error deleting plan:", e);
      alert("Не удалось удалить тест-план");
    } finally {
      setIsDeletingPlan(false);
    }
  };
  const selectPlan = (plan) => {
    setSelectedPlan(plan);
    setSelectedResult(null);
    navigate(`/tw/test-plans/${plan.test_plan_id}`);
  };
  const matchesTagFilter = (test, filterExpression) => {
    if (!filterExpression.trim()) return true;
    const tags = test.tags || [];
    let expression = filterExpression;
    const tagWithNotRegex = /!([a-zA-Z0-9_\-]+)/g;
    expression = expression.replace(tagWithNotRegex, (match, tag) => {
      return !tags.includes(tag) ? "true" : "false";
    });
    const tagRegex = /([a-zA-Z0-9_\-]+)/g;
    expression = expression.replace(tagRegex, (match) => {
      if (match === "true" || match === "false") return match;
      return tags.includes(match) ? "true" : "false";
    });
    expression = expression.replace(/&/g, "&&").replace(/\|/g, "||");
    try {
      return eval(expression);
    } catch (e) {
      return true;
    }
  };
  const filteredResults = useMemo(() => {
    let base = (planDetails?.results || []).filter((result) =>
      statusFilters.includes(result.status?.toLowerCase())
    );
    if (needUpdateOnly) {
      base = base.filter((r) => {
        const p = r?.params;
        if (!p || !Array.isArray(p)) return false;
        for (const item of p) {
          if (item && typeof item === "object" && item.need_updating === true) {
            return true;
          }
        }
        return false;
      });
    }
    if (!tagFilter.trim()) return base;
    return base.filter((r) => matchesTagFilter(r, tagFilter));
  }, [planDetails, statusFilters, tagFilter, needUpdateOnly]);
  function MultiStatusSelect({ value, onChange, testResults = [] }) {
    const toggleOption = (option) => {
      if (value.includes(option)) {
        onChange(value.filter((v) => v !== option));
      } else {
        onChange([...value, option]);
      }
    };
    const getStatusCount = (status) => {
      if (!testResults || testResults.length === 0) return 0;
      return testResults.filter(
        (test) => test.status && test.status.toLowerCase() === status
      ).length;
    };
    return (
      <div className="flex flex-wrap gap-1">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => toggleOption(option.value)}
            className={`inline-flex items-center gap-1 cursor-pointer px-2 py-1 rounded text-xs font-medium transition-all duration-150 ${
              value.includes(option.value)
                ? `${
                    STATUS_CONFIG[option.value]?.bar || "bg-blue-500"
                  } text-white shadow-sm`
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span className="whitespace-nowrap">{option.label}</span>
            <span
              className={`text-xs font-normal ${
                value.includes(option.value) ? "text-white/80" : "text-gray-500"
              }`}
            >
              ({getStatusCount(option.value)})
            </span>
          </button>
        ))}
      </div>
    );
  }
  const enrichedResults = useMemo(() => {
    return filteredResults.map((result) => ({
      ...result,
      epic: result.epic,
      story: result.story,
      feature: result.feature,
    }));
  }, [filteredResults]);
  const PaginationLink = ({
    className,
    isActive,
    size = "icon",
    children,
    ...props
  }) => (
    <a
      aria-current={isActive ? "page" : undefined}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
  PaginationLink.displayName = "PaginationLink";
  const PaginationPrevious = ({ className, ...props }) => (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("gap-1 pl-2.5", className)}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span>Назад</span>
    </PaginationLink>
  );
  PaginationPrevious.displayName = "PaginationPrevious";
  const PaginationNext = ({ className, ...props }) => (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("gap-1 pr-2.5", className)}
      {...props}
    >
      <span>Вперёд</span>
      <ChevronRight className="h-4 w-4" />
    </PaginationLink>
  );
  PaginationNext.displayName = "PaginationNext";
  const totalPages = Math.ceil(totalPlans / pageSize);
  if (loading) return <Loader />;
  if (!selectedPlan) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-8 px-3 py-1 text-xs flex items-center gap-2"
              >
                <Filter className="w-4 h-4" /> Фильтр
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3" align="start">
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-700 mb-1">
                    Имя тест-плана
                  </label>
                  <Input
                    type="text"
                    value={nameFilterDraft}
                    onChange={(e) => setNameFilterDraft(e.target.value)}
                    className="h-8 text-xs"
                    placeholder="Введите имя..."
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    variant="ghost"
                    className="h-8 px-2 text-xs"
                    onClick={() => {
                      setCurrentPage(1);
                      setNameFilterDraft("");
                      setNameFilterApplied("");
                      setIsFilterOpen(false);
                    }}
                  >
                    Сбросить
                  </Button>
                  <Button
                    className="h-8 px-3 text-xs"
                    onClick={() => {
                      setCurrentPage(1);
                      setNameFilterApplied(nameFilterDraft.trim());
                      setIsFilterOpen(false);
                    }}
                  >
                    Применить
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <span className="text-xs text-gray-500">Всего: {totalPlans}</span>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 ml-auto text-xs h-8 px-3 py-1"
          >
            <PlayCircle className="w-4 h-4" />
            Новый тест-план
          </Button>
        </div>
        <CreateTestPlanModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreated={(newPlan) => {
            setTestPlans((prev) => [newPlan, ...prev]);
            setSelectedPlan(newPlan);
            navigate(`/tw/test-plans/${newPlan.test_plan_id}`);
            setTotalPlans((prev) => prev + 1);
          }}
          initialTests={[]}
        />
        <div className="grid gap-2">
          {(testPlans || []).map((plan) => (
            <Card
              key={plan.test_plan_id}
              onClick={() => selectPlan(plan)}
              className="cursor-pointer hover:shadow-md transition-all duration-200"
            >
              <CardHeader className="py-3 px-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-base font-semibold text-gray-800 leading-tight truncate">
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1.5">
                      <Badge
                        variant="outline"
                        className="mr-2 text-[10px] h-5 px-2"
                      >
                        {plan.env}
                      </Badge>
                      {plan.created_at && (
                        <span className="text-xs text-gray-400 ml-2">
                          {new Date(plan.created_at).toLocaleString("ru-RU", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                      <span className="text-xs text-gray-500 truncate max-w-xs ml-2">
                        <span
                          className="cursor-pointer hover:underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(plan.test_plan_id);
                          }}
                        >
                          {plan?.test_plan_id}
                        </span>
                      </span>
                    </CardDescription>
                    <div className="mt-2.5 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div className="flex h-full">
                        {plan.statuses?.length > 0 &&
                          plan.statuses.map((statusObj) => {
                            const barColor = getStatusBarClass(
                              statusObj.status
                            );
                            const total = plan.statuses.reduce(
                              (sum, s) => sum + s.count,
                              0
                            );
                            const percentage =
                              total > 0 ? (statusObj.count / total) * 100 : 0;
                            return (
                              <div
                                key={statusObj.status}
                                className={`h-full ${barColor}`}
                                style={{
                                  width: `${percentage}%`,
                                  minWidth: percentage > 0 ? "2px" : "0",
                                }}
                                title={`${statusObj.count} ${getStatusLabel(
                                  statusObj.status
                                )}`}
                              />
                            );
                          })}
                      </div>
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-500 mt-1">
                      {plan.statuses?.length > 0 &&
                        plan.statuses.map((statusObj) => (
                          <span key={statusObj.status}>
                            {getStatusLabel(statusObj.status)}:{" "}
                            <strong>{statusObj.count}</strong>
                          </span>
                        ))}
                    </div>
                  </div>
                  <div className="flex space-x-1.5">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 hover:bg-blue-50 hover:border-blue-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(
                          `/tw/test-plan-report/${plan.test_plan_id}`,
                          "_blank"
                        );
                      }}
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 hover:bg-red-50 hover:border-red-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPlanToDelete(plan);
                        setShowDeletePlanModal(true);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
        {totalPlans > pageSize && (
          <div className="mt-2">
            <Pagination>
              <PaginationContent>
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(currentPage - 1);
                      }}
                    />
                  </PaginationItem>
                )}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum =
                    Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href="#"
                        isActive={pageNum === currentPage}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(pageNum);
                        }}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                {currentPage < totalPages && (
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(currentPage + 1);
                      }}
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        )}
        {showDeletePlanModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={() => !isDeletingPlan && setShowDeletePlanModal(false)}
          >
            <div
              className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4 text-red-600">
                Удаление тест-плана
              </h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-700">
                  Вы действительно хотите удалить тест-план?
                </p>
                <p className="text-sm text-red-600 font-medium">
                  Тест-план: {planToDelete?.name}
                </p>
                <p className="text-xs text-gray-500">
                  Это действие нельзя отменить. Тест-план и все связанные данные
                  будут удалены.
                </p>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowDeletePlanModal(false)}
                  disabled={isDeletingPlan}
                >
                  Отмена
                </Button>
                <Button
                  className="bg-red-500 hover:bg-red-600 text-white"
                  onClick={async () => {
                    if (!planToDelete) return;
                    setIsDeletingPlan(true);
                    try {
                      await deletePlan(planToDelete.test_plan_id);
                    } catch (e) {
                      console.error("Ошибка при удалении тест-плана:", e);
                    }
                  }}
                  disabled={isDeletingPlan}
                >
                  {isDeletingPlan ? "Удаление..." : "Удалить"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="px-4 py-2 border-b bg-white flex-shrink-0">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => {
                navigate("/tw/test-plans", { replace: true });
              }}
              className="mt-6"
            >
              ← Назад
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedPlan?.name}
              </h1>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline">{selectedPlan?.env}</Badge>
                <span className="text-sm text-gray-500">
                  <span
                    className="cursor-pointer hover:underline"
                    onClick={() => copyToClipboard(selectedPlan.test_plan_id)}
                  >
                    {selectedPlan?.test_plan_id}
                  </span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            {selectedPlan?.test_plan_id && (
              <div className="flex items-center space-x-2">
                <Select
                  value={runId ?? "__current__"}
                  onValueChange={(value) => {
                    if (value === "__current__") {
                      navigate(`/tw/test-plans/${selectedPlan.test_plan_id}`, {
                        replace: true,
                      });
                    } else {
                      navigate(
                        `/tw/test-plans/${selectedPlan.test_plan_id}/${value}`,
                        { replace: true }
                      );
                    }
                    setSelectedResult(null);
                  }}
                >
                  <SelectTrigger className="h-8 text-xs min-w-[16rem] max-w-[50vw]">
                    <SelectValue
                      placeholder={
                        runsLoading
                          ? "Загрузка запусков..."
                          : "Текущий результат"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="tw-runs-select-panel max-h-80 overflow-auto w-auto max-w-[70vw]">
                    <SelectItem key="__current__" value="__current__">
                      Текущий запуск
                    </SelectItem>
                    {planRuns.map((r) => {
                      const dateLabel = (() => {
                        try {
                          return new Date(r.date_start).toLocaleString();
                        } catch {
                          return r.date_start;
                        }
                      })();
                      const paramsPretty = (() => {
                        const rows = [];
                        const arr = Array.isArray(r.params_testrun)
                          ? r.params_testrun
                          : [];
                        for (const obj of arr) {
                          if (obj && typeof obj === "object") {
                            for (const [k, v] of Object.entries(obj)) {
                              rows.push({ key: String(k), value: String(v) });
                            }
                          }
                        }
                        return rows;
                      })();
                      return (
                        <ParamsTooltipWrapper params={paramsPretty}>
                          <SelectItem key={r.test_run_id} value={r.test_run_id}>
                            <div className="flex items-center justify-between w-full gap-4">
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="truncate text-xs">
                                  {dateLabel}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 ml-2">
                                {(r.statuses || []).map((s) => {
                                  const barClass =
                                    getStatusBarClass(s.status) ||
                                    "bg-gray-300";
                                  return (
                                    <div
                                      key={`${r.test_run_id}-${s.status}`}
                                      className="relative flex items-center justify-center w-5 h-5 rounded-sm text-[10px] font-semibold text-white"
                                      title={`${getStatusLabel(s.status)}: ${
                                        s.count
                                      }`}
                                    >
                                      <span
                                        className={`absolute inset-0 rounded-sm ${barClass}`}
                                      />
                                      <span className="relative leading-none">
                                        {s.count}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </SelectItem>
                        </ParamsTooltipWrapper>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <MultiStatusSelect
                value={statusFilters}
                onChange={setStatusFilters}
                testResults={planDetails?.results || []}
              />
              <Popover open={isTagFilterOpen} onOpenChange={setIsTagFilterOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-8 px-3 py-1 text-xs flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" /> Фильтр
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-3" align="start">
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">
                        Фильтр по тегам
                      </label>
                      <Input
                        type="text"
                        value={tagFilter}
                        onChange={(e) => setTagFilter(e.target.value)}
                        className="h-8 text-xs"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Используйте & (И), | (ИЛИ), ! (НЕ). Например:
                        smoke&!slow
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        id="needUpdateOnly"
                        type="checkbox"
                        className="h-4 w-4"
                        checked={needUpdateOnly}
                        onChange={(e) => setNeedUpdateOnly(e.target.checked)}
                      />
                      <label
                        htmlFor="needUpdateOnly"
                        className="text-xs text-gray-800"
                      >
                        Требуется актуализация
                      </label>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button
                        variant="ghost"
                        className="h-8 px-2 text-xs"
                        onClick={() => {
                          setTagFilter("");
                          setNeedUpdateOnly(false);
                          setIsTagFilterOpen(false);
                        }}
                      >
                        Сбросить
                      </Button>
                      <Button
                        className="h-8 px-3 text-xs"
                        onClick={() => {
                          setIsTagFilterOpen(false);
                        }}
                      >
                        Применить
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden min-h-0">
        <div
          id="left-block"
          className="bg-white border-r flex flex-col min-h-0"
          style={{ width: `${leftWidth}%` }}
        >
          <ResultTree
            results={enrichedResults}
            onResultSelect={async (r) => {
              setSelectedResult(r);
              try {
                const u = await uuidv5(
                  `${r.test_id}-${r.number}`,
                  UUID_NAMESPACE_URL
                );
                if (u) {
                  window.location.hash = `#${u}`;
                }
              } catch (e) {}
            }}
            selectedResult={selectedResult}
            testPlanId={selectedPlan?.test_plan_id}
          />
        </div>
        <div
          className={`w-1 cursor-col-resize hover:bg-blue-400 transition-colors ${
            isDragging ? "bg-blue-500" : "bg-gray-200"
          }`}
          onMouseDown={handleMouseDown}
        />
        <div className="bg-white flex flex-col overflow-hidden flex-1 min-h-0">
          <div className="flex-1 min-h-0 overflow-auto">
            <TestResultDetail result={selectedResult} />
          </div>
        </div>
      </div>
    </div>
  );
};
const Navigation = ({ activeTab, setActiveTab, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const collapsed = true;
  useEffect(() => {
    if (location.pathname.startsWith("/tw/test-plans")) setActiveTab("runs");
    else if (location.pathname === "/tw/tests") setActiveTab("tests");
    else if (location.pathname === "/tw/charts") setActiveTab("charts");
    else if (location.pathname === "/tw/errors") setActiveTab("errors");
  }, [location.pathname, setActiveTab]);
  const navItems = [
    { id: "tests", label: "Тесты", icon: FlaskConical, path: "/tw/tests" },
    {
      id: "runs",
      label: "Тест-планы",
      icon: PlayCircle,
      path: "/tw/test-plans",
    },
  ];
  return (
    <div
      className={`no-print flex flex-col h-full bg-gray-900 text-white transition-all duration-200 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <div className="flex items-center px-3 py-3 border-b border-gray-700">
        <div
          className={`font-bold text-lg tracking-wide transition-opacity duration-150 ${
            collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          TestWatch
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto mt-2 overflow-x-hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                navigate(item.path);
              }}
              title={item.label}
              className={`flex items-center w-full gap-2 px-3 py-2 my-1 rounded-md transition
                ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800"
                }
                ${collapsed ? "justify-center" : "justify-start"}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="ml-1 font-medium">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
const CreateTestPlanModal = ({
  isOpen,
  onClose,
  onCreated,
  initialTests = [],
}) => {
  const [name, setName] = useState("");
  const [env, setEnv] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !env.trim()) {
      alert("Имя и env обязательны");
      return;
    }
    setIsCreating(true);
    try {
      const payload = {
        name: name.trim(),
        env: env.trim(),
        tests: initialTests.map((test) => test.test_id),
      };
      const createdPlan = await fetchJson(`${API}/testplan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      onCreated?.(createdPlan);
      setName("");
      setEnv("");
      onClose();
    } catch (err) {
      console.error("Ошибка создания тест-плана:", err);
      alert("Не удалось создать тест-план");
    } finally {
      setIsCreating(false);
      window.clearCheckboxes();
    }
  };
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4">Создать тест-план</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Имя
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Среда
              </label>
              <Input
                value={env}
                onChange={(e) => setEnv(e.target.value)}
                required
              />
            </div>
            {initialTests.length > 0 && (
              <div className="text-sm text-gray-600">
                Будет добавлено тестов: <strong>{initialTests.length}</strong>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isCreating}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Создание..." : "Создать"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
const TestPlanReportPage = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [planDetails, setPlanDetails] = useState(null);
  const [planMetrics, setPlanMetrics] = useState(null);
  const [planHistory, setPlanHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchPlanDetails = async () => {
      try {
        setLoading(true);
        const data = await fetchJson(`${API}/testplan/${planId}`);
        setPlanDetails(data);
      } catch (err) {
        console.error("Error fetching plan details:", err);
        setError("Не удалось загрузить данные отчета");
      } finally {
        setLoading(false);
      }
    };
    const fetchPlanHistory = async () => {
      try {
        const historyData = await fetchJson(
          `${API}/testplan/${planId}/history`
        );
        setPlanHistory(historyData);
      } catch (err) {
        console.error("Error fetching plan history:", err);
      }
    };
    if (planId) {
      fetchPlanDetails();
      fetchPlanHistory();
      fetchJson(`${API}/testplan/${planId}/metrics`)
        .then(setPlanMetrics)
        .catch(() => setPlanMetrics(null));
    }
  }, [planId]);
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-500" />
          <p className="text-gray-600">Загрузка отчета...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8 bg-white rounded-lg shadow">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Ошибка загрузки
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate("/tw/test-plans")}>
            Назад к тест планам
          </Button>
        </div>
      </div>
    );
  }
  if (!planDetails) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600">Отчет не найден</p>
        </div>
      </div>
    );
  }
  const statusCounts = planDetails.results.reduce((acc, result) => {
    const status = normalizeStatusKey(result.status);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const chartData = Object.entries(statusCounts)
    .filter(([status]) => status !== "default")
    .map(([status, count]) => ({
      name: getStatusLabel(status),
      value: count,
      color: getStatus(status).bar,
      status,
    }));
  const totalTests = planDetails.results.length;
  const passedTests = statusCounts["passed"] || 0;
  const failedTests = statusCounts["failed"] || 0;
  const errorTests = statusCounts["error"] || 0;
  const skippedTests = statusCounts["skipped"] || 0;
  const successRate =
    totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
  const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) return "0с";
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const parts = [];
    if (d) parts.push(`${d}д`);
    if (h) parts.push(`${h}ч`);
    if (m) parts.push(`${m}м`);
    if (s && parts.length === 0) parts.push(`${s}с`);
    return parts.join(" ");
  };
  const historyChartData = planHistory
    ? planHistory
        .map((run, index) => {
          const statusData = {};
          run.statuses.forEach((status) => {
            statusData[status.status] = status.count;
          });
          return {
            name: `#${planHistory.length - index}`,
            date: run.date_start,
            ...statusData,
          };
        })
        .reverse()
    : [];
  const allStatuses = planHistory
    ? [
        ...new Set(
          planHistory.flatMap((run) =>
            run.statuses.map((status) => status.status)
          )
        ),
      ].filter((status) => status !== "started" && status !== "waiting")
    : [];
  const statusColors = {
    passed: "#10b981",
    failed: "#ef4444",
    skipped: "#9ca3af",
    error: "#f97316",
    waiting: "#3b82f6",
    started: "#eab308",
  };
  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {planDetails.name}
              </h1>
              <div className="flex items-center space-x-4">
                <Badge variant="outline">{planDetails.env}</Badge>
                <span className="text-sm text-gray-500">
                  {planDetails.test_plan_id}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex space-x-2 no-print">
                <Button onClick={() => window.print()}>
                  <Printer className="w-4 h-4 mr-2" />
                  Печать
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(
                      `${API}/testplan/${planDetails.test_plan_id}/allure_results`,
                      "_blank"
                    );
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Allure results
                </Button>
                <Button onClick={() => window.close()}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Закрыть отчет
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Статистика</CardTitle>
              </CardHeader>
              <CardContent>
                {planMetrics ? (
                  <div className="grid grid-cols-1 gap-4">
                    <div className="rounded-sm border border-gray-200 p-4 bg-gray-50">
                      <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                        Длительность тестплана
                      </div>
                      <div className="text-xs font-semibold text-gray-900">
                        {formatDuration(
                          planMetrics.total_test_runs_duration_sec
                        )}
                      </div>
                    </div>
                    <div className="rounded-sm border border-gray-200 p-4 bg-gray-50">
                      <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                        Длительность прохождения тест-плана
                      </div>
                      <div className="text-xs font-semibold text-gray-900">
                        {formatDuration(planMetrics.test_plan_duration_sec)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Нет данных</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Распределение по статусам</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <RechartsPieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={75}
                      innerRadius={50}
                      cx="50%"
                      cy="50%"
                      paddingAngle={2}
                      isAnimationActive={false}
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={statusColors[entry.status] || "#8884d8"}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => [
                        value,
                        props.payload.name,
                      ]}
                    />
                    <Legend
                      verticalAlign="top"
                      align="center"
                      layout="horizontal"
                      formatter={(value, entry) => {
                        const { payload } = entry;
                        return payload.name;
                      }}
                      wrapperStyle={{
                        height: "20%",
                        margin: "0 auto",
                      }}
                    />
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="20"
                      fontWeight="bold"
                      fill="#374151"
                      dy="10"
                    >
                      {chartData.reduce((sum, entry) => sum + entry.value, 0)}
                    </text>
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="12"
                      fill="#6b7280"
                      dy="30"
                    >
                      Всего
                    </text>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Тренд по запускам</CardTitle>
            </CardHeader>
            <CardContent>
              {planHistory && planHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart
                    data={historyChartData}
                    margin={{
                      top: 34,
                      right: 8,
                      left: 0,
                      bottom: 20,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={18}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [value, getStatusLabel(name)]}
                      labelFormatter={(value) => `Запуск ${value}`}
                    />
                    <Legend
                      verticalAlign="top"
                      align="center"
                      layout="horizontal"
                      formatter={(value) => getStatusLabel(value)}
                    />
                    {allStatuses.map((status) => (
                      <Line
                        key={status}
                        type="monotone"
                        dataKey={status}
                        stroke={statusColors[status] || "#8884d8"}
                        strokeWidth={2}
                        isAnimationActive={false}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500">Нет данных для отображения</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Результаты тестов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">
                      Название теста
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                      Статус
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Сообщение
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {planDetails.results.map((result, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-1 text-xs font-medium text-gray-900 break-words">
                        {result.name}
                      </td>
                      <td className="px-3 py-1 whitespace-nowrap text-xs">
                        <StatusBadge status={result.status} />
                      </td>
                      <td className="px-3 py-1 text-xs text-gray-500 break-all min-w-0">
                        {result.message && (
                          <div className="" title={result.message}>
                            {result.message}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("access_token", data.access_token);
        window.location.reload();
      } else {
        setError("Неверное имя пользователя или пароль");
      }
    } catch (err) {
      setError("Ошибка подключения к серверу");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <div
              className="h-10 w-10 bg-contain bg-center bg-no-repeat"
              style={{ backgroundImage: "url(/favicon.png)" }}
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            TestWatch
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Имя пользователя
              </label>
              <div className="mt-1">
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none rounded-md shadow-sm relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Пароль
              </label>
              <div className="mt-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-md shadow-sm relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                />
              </div>
            </div>
          </div>
          <div>
            <Button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4"
            >
              {loading ? (
                <RefreshCw className="animate-spin h-5 w-5" />
              ) : (
                <>Войти</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
function InnerApp() {
  const [activeTab, setActiveTab] = useState("tests");
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectRef = useRef(1000);
  const currentOpenPlanId = useRef(null);
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("access_token");
  });
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsAuthenticated(false);
  };
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);
  useEffect(() => {
    if (location.pathname.startsWith("/tw/test-plan")) setActiveTab("runs");
    else if (location.pathname === "/tw/tests") setActiveTab("tests");
    else if (location.pathname === "/tw/charts") setActiveTab("charts");
    else if (location.pathname === "/tw/errors") setActiveTab("errors");
  }, [location.pathname]);
  const getWsUrl = () => {
    const u = new URL(BACKEND_URL);
    const host = u.host;
    const protocol = u.protocol === "https:" ? "wss" : "ws";
    return `${protocol}://${host.replace(/\/+$/, "")}/ws`;
  };
  const initSocket = useCallback(() => {
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }
    const url = getWsUrl();
    const ws = new WebSocket(url);
    wsRef.current = ws;
    ws.onopen = () => {
      setWsConnected(true);
      reconnectRef.current = 1000;
      try {
        ws.send(JSON.stringify({ type: "pong", ts: Date.now() }));
      } catch (e) {}
    };
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.type === "ping") {
          try {
            ws.send(JSON.stringify({ type: "pong", ts: Date.now() }));
          } catch (e) {}
          return;
        }
        if (data.test_plan_id && data.action === "updated") {
          window.dispatchEvent(
            new CustomEvent("testplan-updated", {
              detail: { test_plan_id: data.test_plan_id },
            })
          );
        }
        if (data.action === "tests-updated") {
          window.dispatchEvent(new CustomEvent("tests-updated"));
        }
      } catch (e) {
        console.warn("Invalid WS message", e);
      }
    };
    ws.onclose = () => {
      setWsConnected(false);
      const baseDelay = Math.min(reconnectRef.current, 30000);
      const jitter = Math.floor(Math.random() * 300);
      setTimeout(() => {
        initSocket();
      }, baseDelay + jitter);
      reconnectRef.current = Math.min(reconnectRef.current * 2, 30000);
    };
    ws.onerror = () => {
      ws.close();
    };
  }, []);
  useEffect(() => {
    initSocket();
    return () => {
      wsRef.current?.close();
    };
  }, [initSocket]);
  const renderContent = () => {
    switch (activeTab) {
      case "tests":
        return <TestsPage />;
      case "runs":
        return <TestRunsPage />;
      default:
        return <TestsPage />;
    }
  };
  if (!isAuthenticated) {
    return <Login />;
  }
  return (
    <div className="App h-screen flex bg-gray-50">
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />
      <div className="flex-1 overflow-auto flex flex-col">
        <Routes>
          <Route path="/tw/" element={<Navigate to="/tw/tests" replace />} />
          <Route path="/tw/tests" element={<TestsPage />} />
          <Route path="/tw/test-plans" element={<TestRunsPage />} />
          <Route path="/tw/test-plans/:planId" element={<TestRunsPage />} />
          <Route
            path="/tw/test-plans/:planId/test/:testUuid"
            element={<TestRunsPage />}
          />
          <Route
            path="/tw/test-plans/:planId/:runId"
            element={<TestRunsPage />}
          />
          <Route
            path="/tw/test-plan-report/:planId"
            element={<TestPlanReportPage />}
          />
          <Route path="*" element={<Navigate to="/tw/tests" replace />} />
        </Routes>
      </div>
      <div
        className={`pep no-print fixed bottom-4 right-4 px-3 py-1 rounded-full text-xs ${
          wsConnected
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {wsConnected ? "🟢 v1.4" : "🔴 v1.4"}
        <PepeEasterEgg />
      </div>
    </div>
  );
}
function App() {
  return (
    <BrowserRouter>
      <InnerApp />
    </BrowserRouter>
  );
}
export default App;
