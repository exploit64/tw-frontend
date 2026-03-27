import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import { TestTree } from "../components/test/TestTree";
import { TestDetailWithHistory } from "../components/test/TestDetailWithHistory";
import { CreateTestPlanModal } from "../components/modals/CreateTestPlanModal";
import { Loader } from "../components/ui/Loader";
import { useFetch } from "../hooks/useFetch";
import { useResizablePanel } from "../hooks/useResizablePanel";
import { API } from "../utils/constants";
import { fetchJson } from "../utils/helpers";

export const TestsPage = () => {
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
      const numberPart = t?.template === true ? 1 : t?.number ?? 0;
      const id = `${numberPart}|${t.test_id}`;
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
