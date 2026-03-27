import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  RefreshCw,
  AlertTriangle,
  FileText,
  Printer,
  Download,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
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
} from "recharts";
import { API, normalizeStatusKey, getStatusLabel, getStatus } from "../utils/constants";
import { fetchJson, getEntityDisplayName } from "../utils/helpers";

export const TestPlanReportPage = () => {
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
                        Длительность тест-плана
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
                        {getEntityDisplayName(result)}
                      </td>
                      <td className="px-3 py-1 whitespace-nowrap text-xs">
                        <span
                          className={`text-xs px-3 py-1 rounded font-semibold uppercase ${
                            getStatus(result.status).bar
                          } text-white`}
                        >
                          {result.status}
                        </span>
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
