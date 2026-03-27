import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import "./App.css";
import { Navigation } from "./components/ui/Navigation";
import { TestsPage } from "./pages/TestsPage";
import { TestRunsPage } from "./pages/TestRunsPage";
import { TestPlanReportPage } from "./pages/TestPlanReportPage";
import { Login } from "./pages/Login";
import { BACKEND_URL } from "./utils/constants";

// Initialize global state
if (!window.actualCheckedNodes) {
  window.actualCheckedNodes = new Set();
}

window.clearCheckboxes = function () {
  if (window.actualCheckedNodes) {
    window.actualCheckedNodes.clear();
  }
  window.dispatchEvent(new CustomEvent("checkboxes-cleared"));
  window.dispatchEvent(new CustomEvent("actualCheckedNodesChanged"));
};

// Swal integration
window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (event.data.type !== "SWAL") return;
  const options = event.data.payload;
  // Swal will be imported from the original location
  const Swal = require("./Swal").default;
  Swal.fire(options);
});

function InnerApp() {
  const [activeTab, setActiveTab] = useState("tests");
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectRef = useRef(1000);
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

  if (!isAuthenticated) {
    return <Login />;
  }

  // Import PepeEasterEgg and Swal dynamically
  const PepeEasterEgg = require("./PepeEasterEgg").default;
  const Swal = require("./Swal").default;

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
        {wsConnected ? "🟢 v1.7" : "🔴 v1.7"}
        <PepeEasterEgg />
      </div>
    </div>
  );
}

function App() {
  const Swal = require("./Swal").default;
  return (
    <BrowserRouter>
      <InnerApp />
      <Swal.Modal />
    </BrowserRouter>
  );
}

export default App;
