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
  ALLOW: "text-glow",
  ASK: "text-warm",
  DENY: "text-deny",
};

const decisionRing: Record<Decision, string> = {
  ALLOW: "ring-glow/60",
  ASK: "ring-warm/60",
  DENY: "ring-deny/60",
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
    <div className="grid gap-8 rounded-[16px] bg-night-1 p-5 ring-1 ring-line md:p-8 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-5">
        <fieldset>
          <legend className="t-label text-fg-3">The model asks to run</legend>
          <div className="mt-4 space-y-2">
            {sampleTools.map((option) => (
              <label
                key={option.name}
                className="flex cursor-pointer items-start gap-3 rounded-[10px] px-3 py-2.5 ring-1 ring-line transition-[box-shadow,background-color] hover:ring-line-3 has-[:checked]:bg-glow/[0.05] has-[:checked]:ring-glow/60"
              >
                <input
                  type="radio"
                  name={`${id}-tool`}
                  value={option.name}
                  checked={toolName === option.name}
                  onChange={() => setToolName(option.name)}
                  className="mt-1 accent-[var(--color-glow)]"
                />
                <span>
                  <span className="block font-mono text-[0.8125rem] text-fg">{option.name}</span>
                  <span className="t-small block text-fg-3">{option.description}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-6 space-y-5">
          <label className="t-small flex cursor-pointer items-center gap-3 text-fg">
            <input
              type="checkbox"
              checked={cloudDisabled}
              onChange={(event) => setCloudDisabled(event.target.checked)}
              className="size-4 accent-[var(--color-glow)]"
            />
            A cloud admin has disabled this tool
          </label>

          <fieldset>
            <legend className="t-label text-fg-3">Local rule on this machine</legend>
            <div className="mt-3 inline-flex rounded-full p-1 ring-1 ring-line">
              {RULE_OPTIONS.map((option) => (
                <label
                  key={option.label}
                  className="t-small cursor-pointer rounded-full px-3.5 py-1.5 text-fg-2 transition-colors hover:text-fg has-[:checked]:bg-fg has-[:checked]:text-night has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-glow"
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
        <p className="font-mono text-[0.8125rem] text-fg-3">permissionService.evaluateTool(name, args)</p>
        <ol className="mt-4 space-y-2">
          {gateSteps.map((step, index) => {
            const state = index < decidedAt ? "passed" : index === decidedAt ? "decided" : "skipped";
            return (
              <li
                key={step.id}
                data-state={state}
                className="grid grid-cols-[2rem_1fr] items-start gap-3 rounded-[10px] px-3 py-3 ring-1 ring-line transition-all duration-500 data-[state=decided]:bg-fg/[0.04] data-[state=decided]:ring-fg/40 data-[state=skipped]:opacity-35"
                style={{ transitionDelay: `${index * 70}ms` }}
              >
                <span className="t-label pt-1 text-fg-3">{String(index + 1).padStart(2, "0")}</span>
                <span>
                  <span className="t-small block text-fg">{step.question}</span>
                  <span
                    className={`mt-1 block font-mono text-[0.8125rem] ${state === "decided" ? decisionText[result.decision] : "text-fg-3"}`}
                  >
                    {answer(step, state)}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>

        <div aria-live="polite" className="mt-6 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:gap-5">
          <span
            className={`inline-flex shrink-0 items-center self-start rounded-full px-4 py-1.5 font-mono text-[0.9375rem] ring-1 sm:self-auto ${decisionText[result.decision]} ${decisionRing[result.decision]}`}
          >
            {result.decision}
          </span>
          <p className="t-body text-fg">{decisionOutcome[result.decision]}</p>
        </div>
      </div>
    </div>
  );
}
