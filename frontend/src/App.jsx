import { useEffect } from "react";
import { Toaster } from "sonner";
import { AnimatePresence, motion } from "framer-motion";

import Sidebar from "./components/Sidebar";
import ChatPanel from "./components/ChatPanel";
import RightPanel from "./components/RightPanel";

import { useStore } from "./store/store";

import "./styles/globals.css";

export default function App() {
  const {
    init,
    sidebarOpen,
    setSidebarOpen,
  } = useStore();

  useEffect(() => {
    init();
  }, []);

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      {/* Desktop Sidebar */}

      <div className="">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm "
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={() =>
              setSidebarOpen(false)
            }
          >
            <motion.div
              className="h-full w-[280px]"
              initial={{
                x: -300,
              }}
              animate={{
                x: 0,
              }}
              exit={{
                x: -300,
              }}
              transition={{
                type: "spring",
                damping: 25,
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <Sidebar />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat */}

      <ChatPanel />

      {/* Analytics */}

      <RightPanel />

      {/* Toast */}

      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background:
              "rgb(22,22,22)",
            border:
              "1px solid rgba(255,255,255,0.1)",
            color: "#fff",
          },
        }}
      />
    </div>
  );
}