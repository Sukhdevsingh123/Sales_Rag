import { create } from "zustand";
import { uploadPDF, askQuestion } from "../api/api";

const generateId = () => {
  return (
    Date.now().toString() +
    Math.random().toString(36).substring(2, 9)
  );
};

export const selectActiveConv = (state) =>
  state.conversations.find(
    (c) => c.id === state.activeConvId
  );

export const useStore = create((set, get) => ({
  sidebarOpen: true,
  rightOpen: true,

  docs: [],

  model: "GPT-4o",

  analytics: {
    totalQueries: 0,
    avgMs: 0,
    docsSearched: 0,
    accuracy: 95,
  },

  conversations: [],

  activeConvId: null,

  init: () => {
    const saved =
      localStorage.getItem("salesiq-data");

    if (saved) {
      try {
        const data = JSON.parse(saved);

        set({
          docs: data.docs || [],
          conversations:
            data.conversations || [],
          activeConvId:
            data.activeConvId || null,
        });
      } catch (err) {
        console.log(err);
      }
    }

    if (
      get().conversations.length === 0
    ) {
      get().newChat();
    }
  },

  persist: () => {
    const state = get();

    localStorage.setItem(
      "salesiq-data",
      JSON.stringify({
        docs: state.docs,
        conversations:
          state.conversations,
        activeConvId:
          state.activeConvId,
      })
    );
  },

  setSidebarOpen: (value) =>
    set({ sidebarOpen: value }),

  setRightOpen: (value) =>
    set({ rightOpen: value }),

  setModel: (model) =>
    set({ model }),

  newChat: () => {
    const id = Date.now().toString();

    const conversation = {
      id,
      title: "New Conversation",
      createdAt: Date.now(),
      messages: [],
    };

    set((state) => ({
      conversations: [
        conversation,
        ...state.conversations,
      ],
      activeConvId: id,
    }));

    get().persist();
  },

  selectConv: (id) =>
    set({ activeConvId: id }),

  renameConv: (id, title) => {
    set((state) => ({
      conversations:
        state.conversations.map(
          (conv) =>
            conv.id === id
              ? {
                ...conv,
                title,
              }
              : conv
        ),
    }));

    get().persist();
  },

  removeDoc: (id) => {
    set((state) => ({
      docs: state.docs.filter(
        (d) => d.id !== id
      ),
    }));

    get().persist();
  },

  uploadFile: async (file) => {
    const result =
      await uploadPDF(file);

    const doc = {
      id: Date.now(),
      name: file.name,
      pages:
        result.pages ||
        result.total_pages ||
        0,
      uploadedAt: Date.now(),
      status: "indexed",
    };

    set((state) => ({
      docs: [...state.docs, doc],
    }));

    get().persist();

    return result;
  },
  sendMessage: async (question) => {
  let convId = get().activeConvId;

  // Create chat automatically if none exists
  if (!convId) {
    convId = Date.now().toString();

    const conversation = {
      id: convId,
      title: "New Conversation",
      createdAt: Date.now(),
      messages: [],
    };

    set((state) => ({
      conversations: [
        conversation,
        ...state.conversations,
      ],
      activeConvId: convId,
    }));
  }

  const startTime = Date.now();

  const userMessage = {
    id: generateId(),
    role: "user",
    content: question,
  };

  const pendingMessage = {
    id: generateId(),
    role: "assistant",
    content: "",
    pending: true,
  };

  // Add user + loading message
  set((state) => ({
    conversations: state.conversations.map((conv) =>
      conv.id === convId
        ? {
            ...conv,
            messages: [
              ...conv.messages,
              userMessage,
              pendingMessage,
            ],
          }
        : conv
    ),
  }));

  try {
    console.log("Calling /rag/ask API...");
    console.log("Question:", question);

    const response = await askQuestion(question);

    console.log("RAG Response:", response);

    const finalMessage = {
      id: generateId(),
      role: "assistant",
      content:
        response?.answer ||
        "No answer returned",

      pending: false,

      sources: (response?.sources || []).map(
        (s, index) => ({
          file_name:
            s.file_name || "Document",

          page:
            s.page ?? "-",

          section:
            s.section || "Unknown",

          score:
            s.score ?? 0,

          chunk_id:
            s.chunk_id ?? index + 1,
        })
      ),

      meta: {
        ms: Date.now() - startTime,
      },
    };

    set((state) => ({
      conversations: state.conversations.map(
        (conv) =>
          conv.id === convId
            ? {
                ...conv,

                title:
                  conv.title ===
                  "New Conversation"
                    ? question.slice(
                        0,
                        40
                      )
                    : conv.title,

                messages: conv.messages.map(
                  (msg) =>
                    msg.id ===
                    pendingMessage.id
                      ? finalMessage
                      : msg
                ),
              }
            : conv
      ),

      analytics: {
        ...state.analytics,

        totalQueries:
          state.analytics.totalQueries +
          1,

        avgMs:
          state.analytics.avgMs === 0
            ? Date.now() - startTime
            : (
                state.analytics.avgMs +
                (Date.now() -
                  startTime)
              ) / 2,

        docsSearched:
          get().docs.length,
      },
    }));

    get().persist();
  } catch (error) {
    console.error(
      "RAG API Error:",
      error
    );

    set((state) => ({
      conversations: state.conversations.map(
        (conv) =>
          conv.id === convId
            ? {
                ...conv,

                messages: conv.messages.map(
                  (msg) =>
                    msg.id ===
                    pendingMessage.id
                      ? {
                          ...msg,
                          pending: false,
                          content:
                            "Failed to get response from server.",
                        }
                      : msg
                ),
              }
            : conv
      ),
    }));
  }
},
}));
