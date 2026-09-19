"use client";

import { useId, useState } from "react";
import {
  decisionOutcome,
  evaluateGate,
  gateSteps,
  sampleTools,
  type Decision,
  type GateStep,
} from "@/content/aethra";

type LocalRule = Decision | null;

const RULE_OPTIONS: { value: LocalRule; label: string }[] = [
  { value: null, label: "None" },
  { value: "ALLOW", label: "Allow" },
  { value: "ASK", label: "Ask" },
  { value: "DENY", label: "Deny" },
];

const decisionText: Record<Decision, string> = {
  ALLOW: "text-phosphor",
  ASK: "text-ember",
  DENY: "text-deny",
};

const decisionBorder: Record<Decision, string> = {
  ALLOW: "border-phosphor/60",
  ASK: "border-ember/60",
  DENY: "border-deny/60",
};

/**
 * A working model of Aethra's permission kernel. Pick a tool, change the
 * rules, and watch where the decision is made.
 */
export function PermissionGate() {
  const id = useId();
  const [toolName, setToolName] = useState(sampleTools[0].name);
  const [cloudDisabled, setCloudDisabled] = useState(false);
  const [localRule, setLocalRule] = useState<LocalRule>(null);

  const tool = sampleTools.find((t) => t.name === toolName) ?? sampleTools[0];
  const result = evaluateGate({ tool, cloudDisabled, localRule });
  const decidedAt = gateSteps.findIndex((step) => step.id === result.decidedAt);

  const answer = (step: GateStep, state: "passed" | "decided" | "skipped"): string => {
    if (state === "skipped") return "Not reached";
    switch (step.id) {
      case "registry":
        return state === "decided" ? "No: unknown tool, denied" : "Yes, registered";
      case "cloud":
        return state === "decided" ? "Yes: disabled on every device" : "No";
      case "local":
        return state === "decided" ? `Yes: the rule says ${localRule?.toLowerCase()}` : "No rule";
      case "default":
        return `${tool.risk.toLowerCase()} risk, default ${tool.defaultAction.toLowerCase()}`;
    }
  };

  return (
    <div className="grid gap-6 rounded-[4px] border border-line bg-abyss-raised/80 p-5 md:p-8 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-5">
        <fieldset>
          <legend className="eyebrow text-bone-soft">The model asks to run</legend>
          <div className="mt-4 space-y-2">
            {sampleTools.map((option) => (
              <label
                key={option.name}
                className="flex cursor-pointer items-start gap-3 rounded-[3px] border border-line px-3 py-2.5 transition-colors has-[:checked]:border-phosphor/60 has-[:checked]:bg-phosphor/[0.06] hover:border-line-strong"
              >
                <input
                  type="radio"
                  name={`${id}-tool`}
                  value={option.name}
                  checked={toolName === option.name}
                  onChange={() => setToolName(option.name)}
                  className="mt-1 accent-[var(--color-phosphor)]"
                />
                <span>
                  <span className="readout block text-bone">{option.name}</span>
                  <span className="block text-sm text-bone-soft">{option.description}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-6 space-y-5">
          <label className="flex cursor-pointer items-center gap-3 text-bone">
            <input
              type="checkbox"
              checked={cloudDisabled}
              onChange={(event) => setCloudDisabled(event.target.checked)}
              className="size-4 accent-[var(--color-phosphor)]"
            />
            A cloud admin has disabled this tool
          </label>

          <fieldset>
            <legend className="eyebrow text-bone-soft">Local rule on this machine</legend>
            <div className="mt-3 inline-flex rounded-full border border-line p-1">
              {RULE_OPTIONS.map((option) => (
                <label
                  key={option.label}
                  className="readout cursor-pointer rounded-full px-3.5 py-1.5 text-bone-soft transition-colors has-[:checked]:bg-bone has-[:checked]:text-abyss has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-phosphor"
                >
                  <input
                    type="radio"
                    name={`${id}-rule`}
                    checked={localRule === option.value}
                    onChange={() => setLocalRule(option.value)}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </div>

      <div className="lg:col-span-7">
        <p className="readout text-bone-soft">permissionService.evaluateTool(name, args)</p>
        <ol className="mt-4 space-y-2">
          {gateSteps.map((step, index) => {
            const state = index < decidedAt ? "passed" : index === decidedAt ? "decided" : "skipped";
            return (
              <li
                key={step.id}
                data-state={state}
                className="grid grid-cols-[2rem_1fr] items-start gap-3 rounded-[3px] border border-line px-3 py-3 transition-all duration-500 data-[state=decided]:border-bone/40 data-[state=decided]:bg-bone/[0.05] data-[state=skipped]:opacity-35"
                style={{ transitionDelay: `${index * 70}ms` }}
              >
                <span className="readout pt-0.5 text-bone-soft">{index + 1}</span>
                <span>
                  <span className="block text-bone">{step.question}</span>
                  <span
                    className={`readout mt-1 block ${state === "decided" ? decisionText[result.decision] : "text-bone-soft"}`}
                  >
                    {answer(step, state)}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>

        <div aria-live="polite" className="mt-6 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-start sm:gap-5">
          <span
            className={`display-tight inline-flex shrink-0 items-center rounded-full border px-4 py-1.5 text-xl ${decisionText[result.decision]} ${decisionBorder[result.decision]}`}
          >
            {result.decision}
          </span>
          <p className="leading-relaxed text-bone">{decisionOutcome[result.decision]}</p>
        </div>
      </div>
    </div>
  );
}
