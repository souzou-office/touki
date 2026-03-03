"use client";

import { Check, Loader2, Circle, AlertCircle } from "lucide-react";

type Status = "idle" | "uploading" | "parsing" | "analyzing" | "complete" | "error";

interface ParseProgressProps {
  status: Status;
  progress: number;
  error?: string;
}

interface Step {
  label: string;
  statusThreshold: Status[];
}

const STEPS: Step[] = [
  {
    label: "ファイル読み込み",
    statusThreshold: ["uploading", "parsing", "analyzing", "complete"],
  },
  {
    label: "テキスト抽出",
    statusThreshold: ["parsing", "analyzing", "complete"],
  },
  {
    label: "AI解析中",
    statusThreshold: ["analyzing", "complete"],
  },
  {
    label: "完了",
    statusThreshold: ["complete"],
  },
];

function getStepState(
  step: Step,
  stepIndex: number,
  status: Status
): "complete" | "active" | "pending" {
  if (status === "error") {
    // On error, find which step was active at the time of error.
    // We infer based on the status order: uploading=0, parsing=1, analyzing=2, complete=3
    const statusOrder: Status[] = ["uploading", "parsing", "analyzing", "complete"];
    // The error could occur at any step, but we don't know which.
    // We treat steps whose thresholds include statuses before the error as complete,
    // and the rest as pending. Since status is "error", we just show all as pending
    // except the ones that were already done. We'll use the progress value to guess.
    // A simpler approach: mark none as active, and use progress to determine completed steps.
    const completedSteps = Math.floor((stepIndex / STEPS.length) * 100);
    if (completedSteps < 100) {
      return "pending";
    }
    return "pending";
  }

  if (status === "idle") return "pending";

  // Check if this step's threshold includes the current status
  const isReached = step.statusThreshold.includes(status);

  if (!isReached) return "pending";

  // Check if the next step is also reached, which means this one is complete
  const nextStep = STEPS[stepIndex + 1];
  if (nextStep && nextStep.statusThreshold.includes(status)) {
    return "complete";
  }

  return "active";
}

function getActiveStepIndex(status: Status): number {
  switch (status) {
    case "uploading":
      return 0;
    case "parsing":
      return 1;
    case "analyzing":
      return 2;
    case "complete":
      return 3;
    default:
      return -1;
  }
}

function StepIcon({ state }: { state: "complete" | "active" | "pending" }) {
  switch (state) {
    case "complete":
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 shrink-0">
          <Check className="w-4 h-4" strokeWidth={3} />
        </div>
      );
    case "active":
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 shrink-0">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      );
    case "pending":
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-400 shrink-0">
          <Circle className="w-4 h-4" />
        </div>
      );
  }
}

export default function ParseProgress({
  status,
  progress,
  error,
}: ParseProgressProps) {
  const activeIndex = getActiveStepIndex(status);

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Overall progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
          <span>進捗</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`
              h-full rounded-full transition-all duration-500 ease-out
              ${status === "error" ? "bg-red-500" : status === "complete" ? "bg-green-500" : "bg-blue-500"}
            `}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      </div>

      {/* Step indicators */}
      <div className="space-y-0">
        {STEPS.map((step, index) => {
          let state: "complete" | "active" | "pending";

          if (status === "error") {
            // On error, mark steps before the active one as complete,
            // the active one as active (it will show the error), and rest as pending
            if (index < activeIndex) state = "complete";
            else if (index === activeIndex) state = "active";
            else state = "pending";
          } else {
            state = getStepState(step, index, status);
          }

          const isLast = index === STEPS.length - 1;

          return (
            <div key={step.label} className="relative flex items-start gap-3">
              {/* Vertical connector line */}
              {!isLast && (
                <div
                  className={`
                    absolute left-4 top-8 w-px h-6 -translate-x-px
                    ${
                      state === "complete"
                        ? "bg-green-300"
                        : "bg-gray-200"
                    }
                  `}
                />
              )}

              <StepIcon state={status === "error" && index === activeIndex ? "active" : state} />

              <div className={`pt-1.5 pb-6 ${isLast ? "pb-0" : ""}`}>
                <p
                  className={`
                    text-sm font-medium leading-none
                    ${
                      state === "complete"
                        ? "text-green-700"
                        : state === "active"
                          ? "text-blue-700"
                          : "text-gray-400"
                    }
                  `}
                >
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Error message */}
      {status === "error" && error && (
        <div className="mt-6 flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
