import { useEffect } from "react";
import { Toaster } from "sonner";
import { AnimatePresence, motion } from "framer-motion";

import Sidebar from "./components/Sidebar";
import ChatPanel from "./components/ChatPanel";
// import RightPanel from "./components/RightPanel";

import { useStore } from "./store/store";


export default function App() {
  const {
    init,
    sidebarOpen,
    setSidebarOpen,
    theme,
  } = useStore();

  useEffect(() => {
    init();
  }, []);

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden text-[var(--text)]">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="theme-overlay fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          >
            <motion.div
              className="h-full w-[280px]"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ChatPanel />
      {/* <RightPanel /> */}

      <Toaster
        theme={theme}
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--panel-strong)",
            border: "1px solid var(--border)",
            color: "var(--text)",
          },
        }}
      />
    </div>
  );
}
