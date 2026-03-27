import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Play,
  FolderSync,
  Copy,
  ClipboardPaste,
  ChartPie,
  Trash2,
  FilePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API, COPIED_TESTS_KEY } from "../../utils/constants";
import { fetchJson, getCookie, setCookie, copyToClipboard } from "../../utils/helpers";

export const TestRunnerPanel = ({ testPlanId }) => {
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
  const [canPaste, setCanPaste] = useState(true);
  const [copiedTests, setCopiedTests] = useState([]);
  const [isPasting, setIsPasting] = useState(false);

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
    const junit5Set = new Set();

    for (const node of window.actualCheckedNodes) {
      const parsed = parseTestNode(node);
      if (parsed) {
        junit5Set.add(`${parsed.testClass},${parsed.method}`);
      }
    }
    if (junit5Set.size === 0) {
      setShowCopyOptions(false);
      return;
    }
    const junit5Format = Array.from(junit5Set).join("||");
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

  const buildSelectedTests = () => {
    if (!window.actualCheckedNodes || window.actualCheckedNodes.size === 0) {
      return [];
    }
    const map = window.__TW_NODE_MAP__ || {};
    const collected = [];
    for (const node of window.actualCheckedNodes) {
      const [numPart, testId] = node.split("|");
      const item = map[node] || {};
      const parsedNumber = Number(numPart);
      const test_id = item.test_id || testId;
      let number = Number.isFinite(parsedNumber)
        ? parsedNumber
        : item.number ?? 0;

      collected.push({ test_id, number });
    }
    const filtered = collected.filter((t) => t?.test_id);
    const deduped = [];
    const idxById = new Map();
    for (const t of filtered) {
      const id = t.test_id;
      if (!id) continue;
      const existingIdx = idxById.get(id);
      if (existingIdx === undefined) {
        idxById.set(id, deduped.length);
        deduped.push({
          test_id: id,
          number: t.number,
        });
      } else {
        deduped[existingIdx].number = 1;
      }
    }
    return deduped;
  };

  const copyTestWatchFormat = () => {
    const tests = buildSelectedTests();
    if (tests.length === 0) {
      setShowCopyOptions(false);
      return;
    }
    setCopiedTests(tests);
    try {
      sessionStorage.setItem(COPIED_TESTS_KEY, JSON.stringify(tests));
    } catch (e) {
      console.error("Failed to persist copied tests", e);
    }
    setCanPaste(true);
    setShowCopyOptions(false);
    window.clearCheckboxes?.();
  };

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(COPIED_TESTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setCopiedTests(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load copied tests", e);
    }
  }, []);

  useEffect(() => {
    setCanPaste(!!(testPlanId && copiedTests.length));
  }, [testPlanId, copiedTests]);

  const handlePasteTests = async () => {
    if (!testPlanId) {
      alert("Вставка доступна только внутри тест-плана");
      return;
    }
    setIsPasting(true);
    try {
      if (!copiedTests.length) {
        alert("Нет скопированных тестов для вставки");
        return;
      }
      const tests = copiedTests.filter((t) => t?.test_id);
      if (tests.length === 0) {
        alert("Нет валидных тестов для вставки");
        return;
      }
      try {
        sessionStorage.setItem(COPIED_TESTS_KEY, JSON.stringify(tests));
      } catch (e) {
        console.error("Failed to refresh persisted copied tests", e);
      }
      const trResp = await fetchJson(`${API}/testplan/${testPlanId}/testrun`, {
        method: "POST",
      });
      const body = tests.map((t) => ({
        test: { test_id: t.test_id },
        status: "waiting",
        number: `${Number.isFinite(Number(t.number)) ? Number(t.number) : 0}`,
      }));
      await fetchJson(`${API}/testrun/${trResp.test_run_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      sessionStorage.removeItem(COPIED_TESTS_KEY);
      setCopiedTests([]);
    } catch (e) {
      console.error("Не удалось вставить тесты:", e);
      alert("Не удалось вставить тесты. См. консоль.");
    } finally {
      setIsPasting(false);
    }
  };

  const copyMavenFormat = () => {
    if (!window.actualCheckedNodes || window.actualCheckedNodes.size === 0) {
      setShowCopyOptions(false);
      return;
    }
    const mavenSet = new Set();

    for (const node of window.actualCheckedNodes) {
      const parsed = parseTestNode(node);
      if (parsed) {
        mavenSet.add(`${parsed.testClass}#${parsed.method}`);
      }
    }

    if (mavenSet.size === 0) {
      setShowCopyOptions(false);
      return;
    }
    const mavenFormat = Array.from(mavenSet).join(",");
    copyToClipboard(mavenFormat)
      .catch((err) => {
        console.error("Failed to copy Maven format: ", err);
      })
      .finally(() => {
        setShowCopyOptions(false);
        window.clearCheckboxes?.();
      });
  };

  const { getEntityDisplayName } = require("../../utils/helpers");

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
                  <button
                    className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-100"
                    onClick={copyTestWatchFormat}
                  >
                    TestWatch
                  </button>
                </div>
              )}
            </div>
            {testPlanId && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-md text-gray-700 transition-all hover:bg-gray-100 hover:text-gray-800 focus-visible:ring-2 focus-visible:ring-gray-300"
                title="Вставить тесты"
                disabled={!canPaste || isPasting}
                onClick={handlePasteTests}
              >
                <ClipboardPaste className="h-4 w-4" />
              </Button>
            )}
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

                      const nodeKey = `${String(numStr ?? "")}|${String(testId ?? "")}`;
                      const testNode = window.__TW_NODE_MAP__?.[nodeKey];

                      const payload = {
                        test: {
                          test_id: testId
                        },
                        status: changeStatusValue,
                        number: String(numStr ?? ""),
                        date_start: new Date().toISOString(),
                      };
                      if (numStr && Number(numStr) !== 0 && testNode) {
                        payload.params = [
                          {
                            DisplayName: getEntityDisplayName(testNode)
                          }
                        ];
                      }

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
