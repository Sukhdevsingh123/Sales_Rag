import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import {
  Settings,
  ChevronDown,
  Send,
  Paperclip,
  Mic,
  Copy,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Sparkles,
  Search,
  BarChart3,
  Pencil,
  PanelRightOpen,
  Menu,
} from "lucide-react";

import {
  useStore,
  selectActiveConv,
} from "../store/store";

import { toast } from "sonner";

const MODELS = [
  "GPT-4o",
  "Claude 3.5 Sonnet",
  "Gemini 1.5 Pro",
  "Llama 3.1 70B",
];

const QUICK_PROMPTS = [
  "Summarize this document",
  "What are key insights?",
  "Explain this policy",
  "Generate report summary",
];

function Avatar({ role }) {
  if (role === "user") {
    return (
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-xs font-bold text-white">
        U
      </div>
    );
  }

  return (
    <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 text-white">
      <Sparkles className="h-4 w-4" />
    </div>
  );
}

function SourceChip({ source }) {
  return (
    <button
      className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] text-gray-400"
    >
      <FileText className="h-3 w-3" />

      <span>
        {source.file_name}
      </span>

      <span className="text-cyan-400">
        p{source.page}
      </span>
    </button>
  );
}

function Markdown({ children }) {
  return (
    <div className="prose prose-invert max-w-none text-sm">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({
            inline,
            className,
            children,
            ...props
          }) {
            const match =
              /language-(\w+)/.exec(
                className || ""
              );

            if (
              !inline &&
              match
            ) {
              return (
                <SyntaxHighlighter
                  language={
                    match[1]
                  }
                  style={
                    oneDark
                  }
                  PreTag="div"
                >
                  {String(
                    children
                  ).replace(
                    /\n$/,
                    ""
                  )}
                </SyntaxHighlighter>
              );
            }

            return (
              <code
                className="rounded bg-black/30 px-1 py-0.5"
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

function Typing() {
  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        <span className="typing-dot"></span>
        <span className="typing-dot"></span>
        <span className="typing-dot"></span>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-gray-400">
        <Search className="h-3 w-3" />
        Retrieving

        →

        <BarChart3 className="h-3 w-3" />
        Analyzing

        →

        <Sparkles className="h-3 w-3" />
        Generating
      </div>
    </div>
  );
}

function MessageBubble({ message }) {
  const isUser =
    message.role === "user";

  const copyMessage =
    async () => {
      await navigator.clipboard.writeText(
        message.content
      );

      toast.success(
        "Copied"
      );
    };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className={`flex gap-3 ${
        isUser
          ? "flex-row-reverse"
          : ""
      }`}
    >
      <Avatar
        role={message.role}
      />

      <div
        className={`max-w-[80%] ${
          isUser
            ? "items-end"
            : ""
        } flex flex-col`}
      >
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white"
              : "border border-white/5 bg-white/[0.03]"
          }`}
        >
          {message.pending ? (
            <Typing />
          ) : isUser ? (
            <div className="whitespace-pre-wrap">
              {message.content}
            </div>
          ) : (
            <Markdown>
              {message.content}
            </Markdown>
          )}
        </div>

        {!isUser &&
          !message.pending &&
          message.sources?.length >
            0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {message.sources.map(
                (
                  source,
                  index
                ) => (
                  <SourceChip
                    key={
                      index
                    }
                    source={
                      source
                    }
                  />
                )
              )}
            </div>
          )}

        {!isUser &&
          !message.pending && (
            <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
              <button
                onClick={
                  copyMessage
                }
              >
                <Copy className="h-3 w-3" />
              </button>

              <button>
                <ThumbsUp className="h-3 w-3" />
              </button>

              <button>
                <ThumbsDown className="h-3 w-3" />
              </button>

              {message.meta && (
                <span>
                  {
                    message
                      .meta
                      .ms
                  }
                  ms
                </span>
              )}
            </div>
          )}
      </div>
    </motion.div>
  );
}

export default function ChatPanel() {
  const [question, setQuestion] = useState("");
  const messagesEndRef = useRef(null);

  const activeConv = useStore(selectActiveConv);
  const sendMessage = useStore((state) => state.sendMessage);
  const model = useStore((state) => state.model);
  const setModel = useStore((state) => state.setModel);

  const messages = activeConv?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeConv?.id]);

  const handleSend = async (value) => {
      console.log("SEND CLICKED");
    const trimmed = value.trim();
    if (!trimmed) return;

    await sendMessage(trimmed);
    setQuestion("");
  };

  return (
    <main className="flex h-full flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-5 bg-[#09090a]">
        <div>
          <div className="text-base font-semibold text-white">
            {activeConv?.title || "New Conversation"}
          </div>
          <div className="text-xs text-gray-400">
            {messages.length} messages · {model}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Settings className="h-4 w-4" />
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="rounded-lg border border-white/10 bg-[#0f1117] px-3 py-2 text-sm text-white shadow-sm outline-none ring-white/10 transition focus:ring-2"
          >
            {MODELS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            Ask a question about your uploaded document.
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="border-t border-white/5 bg-[#09090a] px-6 py-5">
        <div className="mb-4 flex flex-wrap gap-2 text-sm">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleSend(prompt)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300 transition hover:bg-white/10"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(question);
              }
            }}
            placeholder="Type your question..."
            className="min-h-[96px] flex-1 resize-none rounded-2xl border border-white/10 bg-[#0f1117] p-4 text-sm text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10"
          />

          <button
            type="button"
            onClick={() => handleSend(question)}
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-500 px-5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}
