import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import {
  ChevronRight,
  ChevronDown,
  FileText,
  ExternalLink,
  Activity,
  Clock,
  Database,
  Target,
} from "lucide-react";

import {
  useStore,
  selectActiveConv,
} from "../store/store";

const COLORS = [
  "#8b5cf6",
  "#06b6d4",
  "#3b82f6",
  "#14b8a6",
  "#ec4899",
];

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  accent,
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-gray-400">
        <Icon className="h-3 w-3" />
        {label}
      </div>

      <div className="mt-1 flex items-baseline gap-1">
        <span
          className={`text-xl font-bold ${
            accent || "text-white"
          }`}
        >
          {value}
        </span>

        {suffix && (
          <span className="text-[10px] text-gray-400">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function SourceCard({
  source,
  expanded,
  onToggle,
}) {
  return (
    <motion.div
      layout
      className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
    >
      <button
        onClick={onToggle}
        className="flex w-full items-start gap-2 text-left"
      >
        <div className="grid h-7 w-7 place-items-center rounded-md bg-violet-500/10">
          <FileText className="h-4 w-4 text-cyan-400" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <div className="truncate text-xs font-medium">
              {source.file_name}
            </div>

            {expanded ? (
              <ChevronDown className="h-3 w-3 text-gray-400" />
            ) : (
              <ChevronRight className="h-3 w-3 text-gray-400" />
            )}
          </div>

          <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-400">
            <span>
              Page {source.page}
            </span>

            <span>•</span>

            <span>
              {source.section}
            </span>
          </div>
        </div>
      </button>

      {/* Score */}

      <div className="mt-3 flex items-center gap-2">
        <div className="h-1.5 flex-1 rounded-full bg-white/5">
          <motion.div
            initial={{
              width: 0,
            }}
            animate={{
              width: `${
                Math.round(
                  (source.score || 0) *
                    100
                )
              }%`,
            }}
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
          />
        </div>

        <span className="text-[10px] text-cyan-400">
          {Math.round(
            (source.score || 0) * 100
          )}
          %
        </span>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: "auto",
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-md border border-white/5 bg-black/20 p-2 text-[11px] text-gray-400">
              Chunk ID:
              {" "}
              {source.chunk_id}
            </div>

            <button className="mt-2 inline-flex items-center gap-1 text-[10px] text-cyan-400 hover:underline">
              View Source
              <ExternalLink className="h-3 w-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function RightPanel() {
  const {
    analytics,
    rightOpen,
    setRightOpen,
    docs,
  } = useStore();

  const conv =
    useStore(selectActiveConv);

  const [expanded, setExpanded] =
    useState({});

  const lastAssistant =
    useMemo(() => {
      const messages =
        conv?.messages || [];

      for (
        let i =
          messages.length - 1;
        i >= 0;
        i--
      ) {
        if (
          messages[i].role ===
            "assistant" &&
          !messages[i].pending
        ) {
          return messages[i];
        }
      }

      return null;
    }, [conv]);

  const sources =
    lastAssistant?.sources || [];

  const coverage =
    useMemo(() => {
      const counts = {};

      (
        conv?.messages || []
      ).forEach((message) => {
        message.sources?.forEach(
          (source) => {
            counts[
              source.file_name
            ] =
              (counts[
                source.file_name
              ] || 0) + 1;
          }
        );
      });

      const result =
        Object.entries(counts).map(
          ([name, value]) => ({
            name,
            value,
          })
        );

      if (
        result.length === 0
      ) {
        return docs
          .slice(0, 5)
          .map((d, i) => ({
            name: d.name,
            value: 5 - i,
          }));
      }

      return result;
    }, [conv, docs]);

  if (!rightOpen) {
    return null;
  }

  return (
    <aside className="hidden xl:flex h-full w-[320px] shrink-0 flex-col border-l border-white/5 bg-[#121212]">
      {/* Header */}

      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="text-sm font-semibold">
          Insights
        </div>

        <button
          onClick={() =>
            setRightOpen(false)
          }
          className="rounded-md p-1 text-gray-400 hover:bg-white/5"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Sources */}

        <div>
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase text-gray-400">
              Retrieved Context
            </div>

            <span className="text-[10px] text-gray-400">
              {sources.length} chunks
            </span>
          </div>

          {sources.length === 0 ? (
            <div className="rounded-xl border border-white/5 p-4 text-center text-xs text-gray-500">
              Sources will appear after query
            </div>
          ) : (
            <div className="space-y-2">
              {sources.map(
                (
                  source,
                  index
                ) => (
                  <SourceCard
                    key={index}
                    source={source}
                    expanded={
                      expanded[
                        index
                      ]
                    }
                    onToggle={() =>
                      setExpanded(
                        (
                          prev
                        ) => ({
                          ...prev,
                          [index]:
                            !prev[
                              index
                            ],
                        })
                      )
                    }
                  />
                )
              )}
            </div>
          )}
        </div>

        {/* Analytics */}

        <div>
          <div className="mb-2 text-xs font-semibold uppercase text-gray-400">
            Query Analytics
          </div>

          <div className="grid grid-cols-2 gap-2">
            <StatCard
              icon={Activity}
              label="Queries"
              value={
                analytics.totalQueries
              }
            />

            <StatCard
              icon={Clock}
              label="Avg Time"
              value={(
                analytics.avgMs /
                1000
              ).toFixed(1)}
              suffix="s"
            />

            <StatCard
              icon={Database}
              label="Docs"
              value={
                analytics.docsSearched
              }
            />

            <StatCard
              icon={Target}
              label="Accuracy"
              value={
                analytics.accuracy
              }
              suffix="%"
              accent="text-cyan-400"
            />
          </div>
        </div>

        {/* Coverage */}

        <div>
          <div className="mb-2 text-xs font-semibold uppercase text-gray-400">
            Coverage
          </div>

          <div className="rounded-xl border border-white/5 p-3">
            <div className="h-[180px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={coverage}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                  >
                    {coverage.map(
                      (
                        _,
                        i
                      ) => (
                        <Cell
                          key={i}
                          fill={
                            COLORS[
                              i %
                                COLORS.length
                            ]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 space-y-1">
              {coverage.map(
                (
                  item,
                  i
                ) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-[11px]"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        background:
                          COLORS[
                            i %
                              COLORS.length
                          ],
                      }}
                    />

                    <span className="flex-1 truncate text-gray-400">
                      {item.name}
                    </span>

                    <span>
                      {item.value}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}