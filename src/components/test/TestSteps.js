import React, { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { normalizeStatusKey, getStatus } from "../../utils/constants";

export const TestSteps = ({ steps, level = 0 }) => {
  const [expandedSteps, setExpandedSteps] = useState(new Set());
  if (!Array.isArray(steps) || steps.length === 0) return null;
  const toggleStep = (stepIndex) => {
    const key = `${level}-${stepIndex}`;
    setExpandedSteps((prev) => {
      const clone = new Set(prev);
      clone.has(key) ? clone.delete(key) : clone.add(key);
      return clone;
    });
  };
  return (
    <div className="space-y-1">
      {steps.map((step, index) => {
        const stepKey = `${level}-${index}`;
        const hasSubSteps = Array.isArray(step.steps) && step.steps.length > 0;
        const isExpanded = expandedSteps.has(stepKey);
        const statusKey = normalizeStatusKey(step.status);
        const statusCfg = getStatus(step.status);
        return (
          <div key={stepKey} style={{ paddingLeft: `${level * 16}px` }}>
            <div
              className={`flex items-center space-x-2 py-1 px-3 rounded-md cursor-pointer transition-colors hover:bg-gray-50 ${
                statusKey === "failed"
                  ? "bg-red-50"
                  : statusKey === "passed"
                  ? "bg-green-50"
                  : "bg-gray-50"
              }`}
              onClick={() => hasSubSteps && toggleStep(index)}
            >
              {hasSubSteps ? (
                isExpanded ? (
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-gray-500" />
                )
              ) : (
                <div className="w-3" />
              )}
              {statusCfg.icon}
              <span
                className={`text-xs flex-1 ${
                  statusKey === "failed"
                    ? "text-red-700 font-medium"
                    : statusKey === "passed"
                    ? "text-green-700"
                    : "text-gray-700"
                }`}
              >
                {step.name}
              </span>
            </div>
            {hasSubSteps && isExpanded && (
              <TestSteps steps={step.steps} level={level + 1} />
            )}
          </div>
        );
      })}
    </div>
  );
};
