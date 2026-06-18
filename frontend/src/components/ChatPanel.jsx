import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";

import {
  Settings,
  Send,
  Copy,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Sparkles,
  Search,
  BarChart3,
  Moon,
  Sun,
  Menu,
  PanelRightOpen,
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
    <button className="theme-surface inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] theme-muted">
      <FileText className="h-3 w-3" />

      <span>{source.file_name}</span>

      <span className="text-cyan-400">p{source.page}</span>
    </button>
  );
}

function Markdown({ children, theme }) {
  return (
    <div
      className={`max-w-none text-sm ${
        theme === "dark" ? "prose prose-invert" : "prose prose-slate"
      }`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({
            inline,
            className,
            children,
            ...props
          }) {
            const match = /language-(\w+)/.exec(className || "");

            if (!inline && match) {
              return (
                <SyntaxHighlighter
                  language={match[1]}
                  style={theme === "dark" ? oneDark : oneLight}
                  PreTag="div"
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              );
            }

            return (
              <code className="theme-code rounded px-1 py-0.5" {...props}>
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

      <div className="flex items-center gap-2 text-[11px] theme-muted">
        <Search className="h-3 w-3" />
        Retrieving
        <span>→</span>
        <BarChart3 className="h-3 w-3" />
        Analyzing
        <span>→</span>
        <Sparkles className="h-3 w-3" />
        Generating
      </div>
    </div>
  );
}

// function MessageBubble({ message }) {
//   const theme = useStore((state) => state.theme);
//   const isUser = message.role === "user";

//   const copyMessage = async () => {
//     await navigator.clipboard.writeText(message.content);
//     toast.success("Copied");
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 15 }}
//       animate={{ opacity: 1, y: 0 }}
//       className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
//     >
//       <Avatar role={message.role} />

//       <div className={`flex max-w-[80%] flex-col ${isUser ? "items-end" : ""}`}>
//         <div
//           className={`rounded-2xl px-4 py-3 ${
//             isUser
//               ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white"
//               : "theme-surface border"
//           }`}
//         >
//           {message.pending ? (
//             <Typing />
//           ) : isUser ? (
//             <div className="whitespace-pre-wrap">{message.content}</div>
//           ) : (
//             <Markdown theme={theme}>{message.content}</Markdown>
//           )}
//         </div>

//         {!isUser && !message.pending && message.sources?.length > 0 && (
//           <div className="mt-2 flex flex-wrap gap-1">
//             {message.sources.map((source, index) => (
//               <SourceChip key={index} source={source} />
//             ))}
//           </div>
//         )}

//         {!isUser && !message.pending && (
//           <div className="mt-2 flex items-center gap-3 text-xs theme-subtle">
//             <button onClick={copyMessage}>
//               <Copy className="h-3 w-3" />
//             </button>

//             <button>
//               <ThumbsUp className="h-3 w-3" />
//             </button>

//             <button>
//               <ThumbsDown className="h-3 w-3" />
//             </button>

//             {message.meta && <span>{message.meta.ms} ms</span>}
//           </div>
//         )}
//       </div>
//     </motion.div>
//   );
// }


function MessageBubble({ message }) {
  const theme = useStore((state) => state.theme);
  const isUser = message.role === "user";

  const copyMessage = async () => {
    await navigator.clipboard.writeText(message.content);
    toast.success("Copied");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <Avatar role={message.role} />

      <div
        className={`flex max-w-[80%] flex-col ${
          isUser ? "items-end" : ""
        }`}
      >
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white"
              : "theme-surface border"
          }`}
        >
          {message.pending ? (
            <div>
              <Markdown theme={theme}>
                {message.content}
              </Markdown>

              <div className="mt-3">
                <Typing />
              </div>
            </div>
          ) : isUser ? (
            <div className="whitespace-pre-wrap">
              {message.content}
            </div>
          ) : (
            <Markdown theme={theme}>
              {message.content}
            </Markdown>
          )}
        </div>

        {!isUser &&
          !message.pending &&
          message.sources?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {message.sources.map(
                (source, index) => (
                  <SourceChip
                    key={index}
                    source={source}
                  />
                )
              )}
            </div>
          )}

        {!isUser &&
          !message.pending && (
            <div className="mt-2 flex items-center gap-3 text-xs theme-subtle">
              <button onClick={copyMessage}>
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
                  {message.meta.ms} ms
                </span>
              )}
            </div>
          )}
      </div>
    </motion.div>
  );
}

function ThemeToggle() {
  const theme = useStore((state) => state.theme);
  const toggleTheme = useStore((state) => state.toggleTheme);
  const Icon = theme === "dark" ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-input theme-hover inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
      aria-label="Toggle theme"
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}

export default function ChatPanel() {
  const [question, setQuestion] = useState("");
  const messagesEndRef = useRef(null);

  const activeConv = useStore(selectActiveConv);
  const sendMessage = useStore((state) => state.sendMessage);
  const model = useStore((state) => state.model);
  const setModel = useStore((state) => state.setModel);
  const setSidebarOpen = useStore((state) => state.setSidebarOpen);
  const rightOpen = useStore((state) => state.rightOpen);
  const setRightOpen = useStore((state) => state.setRightOpen);

  const messages = activeConv?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeConv?.id]);

  const handleSend = async (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    await sendMessage(trimmed);
    setQuestion("");
  };

  return (
    <main className="flex h-full flex-1 flex-col overflow-hidden">
      <div className="theme-panel-strong theme-divider flex items-center justify-between border-b px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="theme-input theme-hover inline-flex items-center justify-center rounded-lg border p-2 lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div>
            <div className="text-base font-semibold">
              {activeConv?.title || "New Conversation"}
            </div>
            <div className="text-xs theme-muted">
              {messages.length} messages · {model}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <button
            type="button"
            onClick={() => setRightOpen(!rightOpen)}
            className="theme-input theme-hover hidden items-center justify-center rounded-lg border p-2 xl:inline-flex"
          >
            <PanelRightOpen className="h-4 w-4" />
          </button>

          <div className="hidden items-center gap-2 text-xs theme-muted sm:flex">
            <Settings className="h-4 w-4" />
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="theme-input rounded-lg border px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-cyan-400/20"
            >
              {MODELS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm theme-subtle">
            Ask a question about your uploaded document.
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="theme-panel-strong theme-divider border-t px-4 py-5 sm:px-6">
        <div className="mb-4 flex flex-wrap gap-2 text-sm">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleSend(prompt)}
              className="theme-surface theme-hover rounded-full border px-3 py-2 text-xs theme-muted transition"
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
            className="theme-input min-h-[96px] flex-1 resize-none rounded-2xl border p-4 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10"
          />

          <button
            type="button"
            onClick={() => handleSend(question)}
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-500 px-5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </main>
  );
}

