import React, { useState, useEffect } from "react";
import { FileText, RefreshCw, Clapperboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "../ui/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { TestSteps } from "../test/TestSteps";
import { FilePreviewModal } from "../modals/FilePreviewModal";
import { BACKEND_URL, API } from "../../utils/constants";
import { fetchJson, copyToClipboard, getEntityDisplayName } from "../../utils/helpers";
import { normalizeStatusKey, getStatus } from "../../utils/constants";

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

export const TestResultDetail = ({ result }) => {
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
                  {getEntityDisplayName(result)}
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
                  {result.params.map((paramSet, idx) => {
                    const filteredParams = Object.fromEntries(
                      Object.entries(paramSet).filter(
                        ([k]) => k !== "DisplayName"
                      )
                    );
                    if (Object.keys(filteredParams).length === 0) return null;

                    return (
                      <div key={idx} className="rounded-md bg-gray-50 p-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {Object.entries(filteredParams).map(([k, v]) => (
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
                    );
                  })}
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
      <FilePreviewModal
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        fileUrl={fileUrl}
        filename={previewFile?.filename || ""}
      />
    </div>
  );
};
