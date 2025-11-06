"use client";

import { useMemo, useState } from "react";
import { SparseLLM } from "@/lib/sparse-llm";

const model = new SparseLLM();

const SAMPLE_PROMPTS = [
  "Design a sparse language model that activates only routing experts for reasoning about matrix factorization.",
  "Explain how a router can keep emotional neurons dormant unless sentiment words appear.",
  "Plan steps for calibrating sparse experts when analyzing a technical research abstract.",
];

const formatPercent = (value: number) =>
  `${(value * 100).toFixed(1).replace(/\.0$/, "")}%`;

const formatRatio = (numerator: number, denominator: number) =>
  denominator === 0 ? "0" : `${numerator}/${denominator}`;

type FeatureStat = {
  id: string;
  label: string;
  value: number;
};

export function SparsePlayground() {
  const [prompt, setPrompt] = useState<string>(SAMPLE_PROMPTS[0]);

  const trace = useMemo(() => model.infer(prompt), [prompt]);

  return (
    <div className="flex min-h-screen w-full flex-col gap-10 bg-slate-950 pb-16 pt-10 text-slate-50">
      <header className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 text-left">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-300">
          Sparse Transformer Fabric
        </span>
        <h1 className="text-balance text-4xl font-semibold text-slate-100 sm:text-5xl">
          Truly sparse LLM router that fires only the neurons demanded by the
          current token.
        </h1>
        <p className="max-w-3xl text-pretty text-lg leading-7 text-slate-300">
          Inspect the activation trace of a structured sparse architecture.
          Input text is decomposed into features, routed through expert layers,
          and only the most relevant neurons execute at every stage. Everything
          else stays cold.
        </p>
      </header>

      <section className="mx-auto grid w-full max-w-5xl gap-8 px-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-100">
              Prompt
            </h2>
            <span className="text-xs uppercase tracking-wide text-slate-400">
              Live routed inference
            </span>
          </div>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Describe how sparse experts should fire…"
            className="min-h-[160px] w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-base leading-6 text-slate-50 shadow-inner outline-none transition focus:border-emerald-400 focus:shadow-[0_0_0_1px_rgba(16,185,129,0.4)]"
          />

          <div className="flex flex-wrap gap-3 pt-2">
            {SAMPLE_PROMPTS.map((sample) => (
              <button
                key={sample}
                onClick={() => setPrompt(sample)}
                className="rounded-full border border-slate-800 bg-slate-950/60 px-4 py-2 text-sm text-slate-300 transition hover:border-emerald-400/70 hover:text-emerald-200"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        <aside className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-lg font-semibold text-slate-100">
            Energy Budget
          </h2>

          <div className="flex flex-col gap-3 text-sm text-slate-300">
            <MetricRow
              label="Neurons fired"
              value={formatRatio(
                trace.energy.neuronsFired,
                trace.energy.totalNeurons,
              )}
              emphasis
            />
            <MetricRow
              label="Sparsity"
              value={formatPercent(trace.energy.sparsityRatio)}
            />
            <MetricRow
              label="Average top-k per layer"
              value={trace.energy.averageTopK.toFixed(2)}
            />
            <MetricRow label="Tokens processed" value={trace.tokens.length} />
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Activation narrative
            </p>
            <p className="mt-2 text-sm text-slate-300">
              {trace.narrativeSummary}
            </p>
          </div>

          {trace.globalFeatureProfile.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Dominant feature flux
              </p>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-slate-300">
                {trace.globalFeatureProfile.map((feature: FeatureStat) => (
                  <li
                    key={feature.id}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2"
                  >
                    <span>{feature.label}</span>
                    <span className="font-mono text-emerald-300">
                      {feature.value.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6">
        <h2 className="text-lg font-semibold text-emerald-200">
          Token-level sparse firing
        </h2>
        <div className="mt-4 flex flex-col gap-6">
          {trace.tokenActivations.length === 0 ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 text-sm text-slate-300">
              Provide text in the prompt field to inspect the sparse activation
              trace.
            </div>
          ) : (
            trace.tokenActivations.map(({ token, layers }) => (
              <TokenActivationCard
                key={`${token.value}-${token.index}`}
                token={token.value}
                index={token.index}
                layers={layers}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

type MetricRowProps = {
  label: string;
  value: number | string;
  emphasis?: boolean;
};

function MetricRow({ label, value, emphasis = false }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/40 px-3 py-2">
      <span className="text-xs uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <span
        className={`font-mono text-sm ${
          emphasis ? "text-emerald-300" : "text-slate-200"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

type TokenActivationCardProps = {
  token: string;
  index: number;
  layers: ReturnType<SparseLLM["infer"]>["tokenActivations"][number]["layers"];
};

function TokenActivationCard({
  token,
  index,
  layers,
}: TokenActivationCardProps) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950/70 via-slate-950/40 to-slate-900/40 p-6 shadow-lg shadow-emerald-500/5">
      <div className="flex flex-col gap-2 border-b border-slate-800 pb-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 text-slate-200">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 font-mono text-sm text-emerald-300">
            {index}
          </span>
          <span className="text-xl font-semibold text-emerald-100">
            {token}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-400">
          {layers.map((layer) => (
            <span
              key={layer.layerId}
              className="rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1"
            >
              {layer.layerLabel} · {formatPercent(1 - layer.sparsity)}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {layers.map((layer) => (
          <div
            key={layer.layerId}
            className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/40 p-4"
          >
            <div className="flex items-center justify-between text-sm">
              <h3 className="font-semibold text-slate-100">
                {layer.layerLabel}
              </h3>
              <span className="text-xs text-slate-400">
                Sparsity {formatPercent(layer.sparsity)}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {layer.description}
            </p>
            <ul className="flex flex-col gap-3">
              {layer.activated.map((neuron) => (
                <li
                  key={neuron.neuronId}
                  className="flex flex-col gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{neuron.label}</span>
                    <span className="font-mono text-xs text-emerald-200">
                      act {neuron.activation.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200/80">{neuron.role}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-emerald-200/70">
                    {neuron.dominantFeatures.map((feature) => (
                      <span
                        key={feature.id}
                        className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 font-mono"
                      >
                        {feature.id} · {feature.weight.toFixed(2)}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

