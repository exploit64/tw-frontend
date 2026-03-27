import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FlaskConical, PlayCircle } from "lucide-react";

export const Navigation = ({ activeTab, setActiveTab, onLogout }) => {
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
