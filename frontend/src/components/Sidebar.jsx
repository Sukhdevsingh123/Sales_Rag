import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Plus,
  Search,
  Upload,
  FileText,
  Trash2,
  MessageSquare,
  Database,
  ChevronLeft,
  Shield,
  LogOut,
} from "lucide-react";

import { useStore } from "../store/store";
import { toast } from "sonner";

const fmtDate = (ts) => {
  const d = new Date(ts);
  const diff = (Date.now() - ts) / 1000;

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

  return d.toLocaleDateString();
};

const StatusDot = ({ status }) => {
  const color =
    status === "indexed"
      ? "bg-emerald-400"
      : status === "processing"
      ? "bg-amber-400"
      : "bg-rose-400";

  return (
    <span className="relative inline-flex h-2 w-2 shrink-0">
      <span
        className={`absolute inset-0 rounded-full ${color} opacity-60 ${
          status === "processing" ? "animate-ping" : ""
        }`}
      />
      <span className={`relative inline-flex h-2 w-2 rounded-full ${color}`} />
    </span>
  );
};

export default function Sidebar() {
  const navigate = useNavigate();
  const {
    docs,
    conversations,
    activeConvId,
    newChat,
    selectConv,
    uploadFile,
    removeDoc,
    setSidebarOpen,
    user,
    logout,
  } = useStore();

  const [query, setQuery] = useState("");
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);

  const filtered = docs.filter((d) =>
    d.name.toLowerCase().includes(query.toLowerCase())
  );

  const totalPages = docs.reduce((a, d) => a + (d.pages || 0), 0);

  const onFiles = async (files) => {
    for (const file of files) {
      toast.promise(uploadFile(file), {
        loading: `Uploading ${file.name}...`,
        success: `${file.name} indexed`,
        error: `${file.name} upload failed`,
      });
    }
  };

  return (
    <aside className="theme-panel theme-divider flex h-full w-[280px] shrink-0 flex-col border-r">
      <div className="flex items-center justify-between px-4 pb-3 pt-4">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500">
            <Zap className="h-5 w-5 text-white" fill="white" />
          </div>

          <div>
            <div className="text-base font-bold">Sales RAG</div>
            <div className="theme-muted text-[10px] uppercase tracking-widest">
              Knowledge Base
            </div>
          </div>
        </div>

        <button
          onClick={() => setSidebarOpen(false)}
          className="theme-hover rounded-lg p-1.5 theme-muted lg:hidden"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      <div className="px-3">
        <button
          onClick={newChat}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-3 py-2.5 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </button>
      </div>

      {(user?.role === "admin" || user?.role === "test") && (
        <div className="mt-5 flex min-h-0 flex-1 flex-col px-3">
          <div className="mb-2 flex items-center justify-between px-1">
            <div className="theme-muted flex items-center gap-1 text-xs font-semibold uppercase">
              <Database className="h-3.5 w-3.5" />
              Documents
            </div>

            <button
              onClick={() => inputRef.current?.click()}
              className="theme-hover rounded-md p-1 theme-muted"
            >
              <Upload className="h-3.5 w-3.5" />
            </button>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && onFiles(Array.from(e.target.files))}
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);

              if (e.dataTransfer.files) {
                onFiles(Array.from(e.dataTransfer.files));
              }
            }}
            onClick={() => inputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-4 text-center transition ${
              drag
                ? "border-cyan-500 bg-cyan-500/10"
                : "theme-input theme-hover"
            }`}
          >
            <Upload className="mx-auto mb-2 h-5 w-5 theme-muted" />
            <div className="text-xs font-medium">Drop PDF here</div>
            <div className="theme-subtle text-[10px]">or click to browse</div>
          </div>

          <div className="relative mt-3">
            <Search className="theme-subtle absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents..."
              className="theme-input w-full rounded-lg border py-2 pl-8 pr-3 text-xs"
            />
          </div>

          <div className="mt-3 flex-1 space-y-1 overflow-y-auto">
            <AnimatePresence>
              {filtered.map((doc) => (
                <motion.div
                  key={doc.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="theme-hover group flex items-center gap-2 rounded-lg px-2 py-2"
                >
                  <div className="grid h-8 w-8 place-items-center rounded-md bg-violet-500/10">
                    <FileText className="h-4 w-4 text-cyan-400" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <StatusDot status={doc.status} />
                      <div className="truncate text-xs">{doc.name}</div>
                    </div>

                    <div className="theme-subtle text-[10px]">
                      {doc.pages} pages · {fmtDate(doc.uploadedAt)}
                    </div>
                  </div>

                  <button
                    onClick={() => removeDoc(doc.id)}
                    className="opacity-0 transition group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="theme-subtle py-6 text-center text-xs">
                No documents found
              </div>
            )}
          </div>

          <div className="theme-surface mt-2 rounded-lg border p-2">
            <div className="theme-subtle flex items-center justify-between text-[10px]">
              <span>
                {docs.length} docs · {totalPages} pages
              </span>
              <span>
                {Math.min(100, Math.round((totalPages / 500) * 100))}%
              </span>
            </div>

            <div className="mt-1 h-1 overflow-hidden rounded-full" style={{ background: "var(--border-soft)" }}>
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-cyan-500"
                style={{
                  width: `${Math.min(100, (totalPages / 500) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="theme-divider space-y-2 border-t px-3 py-3">
        {user?.role === "admin" && (
          <button
            onClick={() => {
              navigate("/admin");
              setSidebarOpen(false);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2.5 text-sm font-semibold text-violet-400 transition hover:bg-violet-500/20"
          >
            <Shield className="h-4 w-4" />
            Admin Panel
          </button>
        )}

        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>

      <div className="theme-divider border-t px-3 py-3">
        <div className="theme-muted mb-2 flex items-center gap-1 text-xs font-semibold uppercase">
          <MessageSquare className="h-3.5 w-3.5" />
          Recent Chats
        </div>

        <div className="max-h-[150px] space-y-1 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => selectConv(conv.id)}
              className={`block w-full rounded-md px-2 py-2 text-left ${
                conv.id === activeConvId ? "bg-violet-500/20" : "theme-hover"
              }`}
            >
              <div className="truncate text-xs font-medium">{conv.title}</div>
              <div className="theme-subtle text-[10px]">{fmtDate(conv.createdAt)}</div>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
