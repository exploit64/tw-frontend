import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { ChevronRight, ChevronDown, ListChevronsUpDown, ListChevronsDownUp } from "lucide-react";
import { groupByHierarchy, collectAllGroupNodeIds, collectAllIds, getEntityDisplayName } from "../../utils/helpers";
import { ITEMS_KEY, getStatusBarClass } from "../../utils/constants";

export const Tree = React.memo(function Tree({
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
            const { normalizeStatusKey } = require("../../utils/constants");
            const status = normalizeStatusKey(item.status);
            acc[status] = (acc[status] || 0) + 1;
            return acc;
          }, {});
        } else {
          const directItems = node[ITEMS_KEY] || [];
          directItems.forEach((item) => {
            const { normalizeStatusKey } = require("../../utils/constants");
            const status = normalizeStatusKey(item.status);
            counts[status] = (counts[status] || 0) + 1;
          });
          Object.entries(node).forEach(([key, value]) => {
            if (key === ITEMS_KEY) return;
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
          const directItems = node[ITEMS_KEY] || [];
          count += directItems.length;
          Object.entries(node).forEach(([key, value]) => {
            if (key === ITEMS_KEY) return;
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

  useEffect(() => {
    const flat = {};
    const collect = (node) => {
      if (!node) return;
      if (Array.isArray(node)) {
        node.forEach((item) => {
          if (!item || typeof item !== "object") return;
          const numberPart =
            pageType === "tests" && item?.template === true
              ? 1
              : item.number ?? 0;
          const key = item.test_id ? `${numberPart}|${item.test_id}` : null;
          if (key) {
            flat[key] = item;
          }
        });
      } else if (typeof node === "object") {
        if (Array.isArray(node[ITEMS_KEY])) collect(node[ITEMS_KEY]);
        Object.entries(node).forEach(([k, v]) => {
          if (k === ITEMS_KEY) return;
          collect(v);
        });
      }
    };
    try {
      collect(items);
      window.__TW_NODE_MAP__ = flat;
      window.dispatchEvent(
        new CustomEvent("twNodeMapUpdated", {
          detail: { count: Object.keys(flat).length || 0 },
        })
      );
    } catch (e) {
      console.error("Failed to build node map", e);
    }
  }, [items, pageType]);

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
    const numberPart =
      pageType === "tests" && item?.template === true ? 1 : item.number ?? 0;
    const id = `${numberPart}|${item.test_id}`;
    const isSelected = isSelectedItem(item);
    const checked = checkedNodes.has(id);
    const padding = level * 20;
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
          {getEntityDisplayName(item)}
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

  const { normalizeStatusKey, getStatus, getStatusLabel } = require("../../utils/constants");

  const renderTreeRecursive = (node, nodeId, level = 0) => {
    if (Array.isArray(node)) {
      return node.map((item) => (
        <LeafRow
          key={`${
            pageType === "tests" && item?.template === true
              ? 1
              : item.number ?? 0
          }|${item.test_id}`}
          item={item}
          level={level}
          pageType={pageType}
        />
      ));
    }
    const directItems = (node[ITEMS_KEY] || []).slice().sort((a, b) => {
      const byName = (getEntityDisplayName(a) || "").localeCompare(
        getEntityDisplayName(b) || "",
        "ru-RU",
        {
          sensitivity: "base",
        }
      );
      if (byName !== 0) return byName;
      return String(a.test_id || "").localeCompare(
        String(b.test_id || ""),
        "ru-RU",
        { sensitivity: "base" }
      );
    });
    const childrenEntries = Object.entries(node)
      .filter(([key]) => key !== ITEMS_KEY)
      .sort(([aKey], [bKey]) =>
        String(aKey).localeCompare(String(bKey), "ru-RU", {
          sensitivity: "base",
        })
      );
    const directItemsRendered = directItems.map((item) => (
      <LeafRow
        key={`${
          pageType === "tests" && item?.template === true ? 1 : item.number ?? 0
        }|${item.test_id}`}
        item={item}
        level={level}
        pageType={pageType}
      />
    ));
    const childrenRendered = childrenEntries.map(([key, value]) => {
      const childNodeId = nodeId ? `${nodeId}-${key}` : key;
      const isExpanded = expandedNodes.has(childNodeId);
      const childIds = collectAllIds(value, pageType);
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
    return (
      <>
        {childrenRendered}
        {directItemsRendered}
      </>
    );
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
});

export const TreeMemo = React.memo(Tree, (prevProps, nextProps) => {
  return (
    prevProps.items === nextProps.items &&
    prevProps.showStatusBar === nextProps.showStatusBar &&
    prevProps.selected === nextProps.selected
  );
});
