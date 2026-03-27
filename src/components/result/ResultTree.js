import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TreeMemo } from "../ui/Tree";
import { TestRunnerPanel } from "../test/TestRunnerPanel";

export const ResultTree = ({
  results,
  onResultSelect,
  selectedResult,
  testPlanId,
}) => {
  return (
    <div className="flex flex-col h-full min-h-0 border border-gray-200 rounded bg-white">
      <div
        className="flex flex-wrap items-center justify-between px-4 py-2 border-b bg-gray-50 flex-shrink-0 gap-2"
        id="runner-panel"
        hidden
      >
        <TestRunnerPanel testPlanId={testPlanId} />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <TreeMemo
            items={results}
            getEpic={(r) => r.epic}
            getStory={(r) => r.story}
            getFeature={(r) => r.feature}
            onSelect={onResultSelect}
            selected={selectedResult}
            showStatusBar={true}
            pageType="results"
          />
        </ScrollArea>
      </div>
    </div>
  );
};
