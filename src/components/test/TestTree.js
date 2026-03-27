import React, { useState, useEffect, useMemo } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TreeMemo } from "../ui/Tree";
import { API } from "../../utils/constants";
import { fetchJson } from "../../utils/helpers";
import { TestRunnerPanel } from "./TestRunnerPanel";

export const TestTree = ({
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
