import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  PlayCircle,
  Filter,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ResultTree } from "../components/result/ResultTree";
import { TestResultDetail } from "../components/result/TestResultDetail";
import { CreateTestPlanModal } from "../components/modals/CreateTestPlanModal";
import { ParamsTooltipWrapper } from "../components/ui/ParamsTooltipWrapper";
import { Loader } from "../components/ui/Loader";
import { useResizablePanel } from "../hooks/useResizablePanel";
import { API, STATUS_CONFIG, normalizeStatusKey, getStatusLabel, getStatusBarClass, UUID_NAMESPACE_URL } from "../utils/constants";
import { fetchJson, getCookie, setCookie, uuidv5 } from "../utils/helpers";

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

function MultiStatusSelect({ value, onChange, testResults = [] }) {
  const statusOptions = [
    { value: "passed", label: "Passed" },
    { value: "failed", label: "Failed" },
    { value: "waiting", label: "Waiting" },
    { value: "started", label: "Started" },
    { value: "skipped", label: "Skipped" },
  ];
  
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

export const TestRunsPage = () => {
  const { planId, runId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [testPlans, setTestPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planDetails, setPlanDetails] = useState(null);
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
  const [errorFilter, setErrorFilter] = useState("");
  const [errorFilterInvert, setErrorFilterInvert] = useState(false);
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

  const [selectedResult, setSelectedResult] = useState(null);

  const lastProcessedHashRef = useRef(null);
  useEffect(() => {
    lastProcessedHashRef.current = null;
  }, [planId, runId]);

  useEffect(() => {
    if (!planDetails) return;
    const hashUuid = (location.hash || "").replace(/^#/, "");
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
  }, [location.hash, planDetails]);

  useEffect(() => {
    const onHashChange = () => {
      const hashUuid = (window.location.hash || "").replace(/^#/, "");
      if (!hashUuid) {
        setSelectedResult(null);
        return;
      }
      if (planDetails?.results) {
        const pick = async () => {
          for (const r of planDetails.results) {
            try {
              const u = await uuidv5(
                `${r.test_id}-${r.number}`,
                UUID_NAMESPACE_URL
              );
              if (u === hashUuid) {
                setSelectedResult(r);
                break;
              }
            } catch (e) {}
          }
        };
        pick();
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [planDetails]);

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

  const matchesMessageFilter = (test, filterExpression) => {
    const needle = String(filterExpression || "")
      .trim()
      .toLowerCase();
    if (!needle) return true;
    const message = String(test?.message || "").toLowerCase();
    return message.includes(needle);
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
    if (tagFilter.trim()) {
      base = base.filter((r) => matchesTagFilter(r, tagFilter));
    }
    if (errorFilter.trim()) {
      base = base.filter((r) => {
        const ok = matchesMessageFilter(r, errorFilter);
        return errorFilterInvert ? !ok : ok;
      });
    }
    return base;
  }, [
    planDetails,
    statusFilters,
    tagFilter,
    errorFilter,
    errorFilterInvert,
    needUpdateOnly,
  ]);

  const enrichedResults = useMemo(() => {
    return filteredResults.map((result) => ({
      ...result,
      epic: result.epic,
      story: result.story,
      feature: result.feature,
    }));
  }, [filteredResults]);

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
                            const { copyToClipboard } = require("../utils/helpers");
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
            <div className="flex justify-center">
              <div className="flex items-center gap-1">
                {currentPage > 1 && (
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(currentPage - 1);
                    }}
                  />
                )}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum =
                    Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <PaginationLink
                      key={pageNum}
                      href="#"
                      isActive={pageNum === currentPage}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(pageNum);
                      }}
                    >
                      {pageNum}
                    </PaginationLink>
                  );
                })}
                {currentPage < totalPages && (
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(currentPage + 1);
                    }}
                  />
                )}
              </div>
            </div>
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
                    onClick={() => {
                      const { copyToClipboard } = require("../utils/helpers");
                      copyToClipboard(selectedPlan.test_plan_id);
                    }}
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
                        <ParamsTooltipWrapper params={paramsPretty} key={r.test_run_id}>
                          <SelectItem value={r.test_run_id}>
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
                      <div className="mt-2">
                        <label className="block text-xs text-gray-700 mb-1">
                          Фильтр по ошибке
                        </label>
                        <Input
                          type="text"
                          value={errorFilter}
                          onChange={(e) => setErrorFilter(e.target.value)}
                          className="h-8 text-xs"
                        />
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            id="errorFilterInvert"
                            type="checkbox"
                            className="h-4 w-4"
                            checked={errorFilterInvert}
                            onChange={(e) =>
                              setErrorFilterInvert(e.target.checked)
                            }
                          />
                          <label
                            htmlFor="errorFilterInvert"
                            className="text-xs text-gray-800"
                          >
                            Инвертировать фильтр по ошибке
                          </label>
                        </div>
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
                          setErrorFilter("");
                          setErrorFilterInvert(false);
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
