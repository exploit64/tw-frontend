import React, { useState, useEffect, useMemo } from "react";
import { RefreshCw } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { StatusBadge } from "../ui/StatusBadge";
import { API } from "../../utils/constants";
import { fetchJson, copyToClipboard } from "../../utils/helpers";

export const TestDetailWithHistory = ({ test }) => {
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
                            {item.params.map((paramSet, idx2) => {
                              const filteredEntries = Object.entries(
                                paramSet
                              ).filter(([k]) => k !== "DisplayName");
                              if (filteredEntries.length === 0) return null;

                              return (
                                <div
                                  key={idx2}
                                  className="rounded-md bg-gray-50 p-2"
                                >
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                    {filteredEntries.map(([k, v]) => (
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
                              );
                            })}
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
