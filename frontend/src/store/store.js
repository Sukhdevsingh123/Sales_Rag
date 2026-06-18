// import { create } from "zustand";
// import {
//   uploadPDF,
//   askQuestion,
//   login,
//   getCurrentUser,
//   getAllUsers,
//   createUser,
//   deleteUser,
//   updateUser,
// } from "../api/api";

// export const selectActiveConv = (state) =>
//   state.conversations.find((c) => c.id === state.activeConvId);

// const getInitialTheme = () => {
//   const savedTheme = localStorage.getItem("salesiq-theme");
//   return savedTheme === "light" ? "light" : "dark";
// };

// const createId = () => {
//   if (
//     typeof globalThis.crypto !== "undefined" &&
//     typeof globalThis.crypto.randomUUID === "function"
//   ) {
//     return globalThis.crypto.randomUUID();
//   }

//   return "id-" + Date.now() + "-" + Math.random().toString(36).slice(2, 11);
// };

// export const useStore = create((set, get) => ({
//   // Auth state
//   isAuthenticated: !!localStorage.getItem("token"),
//   user: null,
//   users: [],
//   loading: false,
//   error: null,

//   sidebarOpen: true,
//   rightOpen: true,
//   theme: getInitialTheme(),

//   docs: [],

//   model: "GPT-4o",

//   analytics: {
//     totalQueries: 0,
//     avgMs: 0,
//     docsSearched: 0,
//     accuracy: 95,
//   },

//   conversations: [],

//   activeConvId: null,

//   // ============ Auth Methods ============

//   login: async (email, password) => {
//     set({ loading: true, error: null });
//     try {
//       const data = await login(email, password);
//       localStorage.setItem("token", data.access_token);
//       set({
//         isAuthenticated: true,
//         user: data.user,
//         loading: false,
//       });
//       return { success: true };
//     } catch (err) {
//       const errorMsg = err.response?.data?.detail || "Login failed";
//       set({
//         error: errorMsg,
//         loading: false,
//       });
//       return { success: false, error: errorMsg };
//     }
//   },

//   logout: () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("salesiq-data");
//     set({
//       isAuthenticated: false,
//       user: null,
//       conversations: [],
//       activeConvId: null,
//     });
//   },

//   initAuth: async () => {
//     if (!localStorage.getItem("token")) return;

//     set({ loading: true });
//     try {
//       const user = await getCurrentUser();
//       set({ user, isAuthenticated: true, loading: false });
//     } catch (err) {
//       localStorage.removeItem("token");
//       set({ isAuthenticated: false, user: null, loading: false });
//     }
//   },

//   // ============ User Management Methods (Admin) ============

//   fetchAllUsers: async () => {
//     set({ loading: true, error: null });
//     try {
//       const users = await getAllUsers();
//       set({ users, loading: false });
//       return users;
//     } catch (err) {
//       set({
//         error: err.response?.data?.detail || "Failed to fetch users",
//         loading: false,
//       });
//       return [];
//     }
//   },

//   createNewUser: async (email, fullName, password, role) => {
//     set({ loading: true, error: null });
//     try {
//       const newUser = await createUser(email, fullName, password, role);
//       set((state) => ({
//         users: [...state.users, newUser],
//         loading: false,
//       }));
//       return { success: true, user: newUser };
//     } catch (err) {
//       const errorMsg = err.response?.data?.detail || "Failed to create user";
//       set({ error: errorMsg, loading: false });
//       return { success: false, error: errorMsg };
//     }
//   },

//   removeUser: async (userId) => {
//     set({ loading: true, error: null });
//     try {
//       await deleteUser(userId);
//       set((state) => ({
//         users: state.users.filter((u) => u.id !== userId),
//         loading: false,
//       }));
//       return { success: true };
//     } catch (err) {
//       const errorMsg = err.response?.data?.detail || "Failed to delete user";
//       set({ error: errorMsg, loading: false });
//       return { success: false, error: errorMsg };
//     }
//   },

//   updateUserRole: async (userId, fullName, role, isActive) => {
//     set({ loading: true, error: null });
//     try {
//       const updated = await updateUser(userId, {
//         full_name: fullName,
//         role,
//         is_active: isActive,
//       });
//       set((state) => ({
//         users: state.users.map((u) =>
//           u.id === userId ? updated : u
//         ),
//         loading: false,
//       }));
//       return { success: true, user: updated };
//     } catch (err) {
//       const errorMsg = err.response?.data?.detail || "Failed to update user";
//       set({ error: errorMsg, loading: false });
//       return { success: false, error: errorMsg };
//     }
//   },

//   // ============ Document Management ============

//   init: () => {
//     const saved = localStorage.getItem("salesiq-data");

//     if (saved) {
//       try {
//         const data = JSON.parse(saved);

//         set({
//           docs: data.docs || [],
//           conversations: data.conversations || [],
//           activeConvId: data.activeConvId || null,
//         });
//       } catch (err) {
//         console.log(err);
//       }
//     }

//     if (get().conversations.length === 0) {
//       get().newChat();
//     }
//   },

//   persist: () => {
//     const state = get();

//     localStorage.setItem(
//       "salesiq-data",
//       JSON.stringify({
//         docs: state.docs,
//         conversations: state.conversations,
//         activeConvId: state.activeConvId,
//       })
//     );
//   },

//   setSidebarOpen: (value) => set({ sidebarOpen: value }),

//   setRightOpen: (value) => set({ rightOpen: value }),

//   setModel: (model) => set({ model }),

//   setTheme: (theme) => {
//     localStorage.setItem("salesiq-theme", theme);
//     set({ theme });
//   },

//   toggleTheme: () => {
//     const nextTheme = get().theme === "dark" ? "light" : "dark";
//     localStorage.setItem("salesiq-theme", nextTheme);
//     set({ theme: nextTheme });
//   },

//   newChat: () => {
//     const id = Date.now().toString();

//     const conversation = {
//       id,
//       title: "New Conversation",
//       createdAt: Date.now(),
//       messages: [],
//     };

//     set((state) => ({
//       conversations: [conversation, ...state.conversations],
//       activeConvId: id,
//     }));

//     get().persist();
//   },

//   selectConv: (id) => set({ activeConvId: id }),

//   renameConv: (id, title) => {
//     set((state) => ({
//       conversations: state.conversations.map((conv) =>
//         conv.id === id
//           ? {
//               ...conv,
//               title,
//             }
//           : conv
//       ),
//     }));

//     get().persist();
//   },

//   removeDoc: (id) => {
//     set((state) => ({
//       docs: state.docs.filter((d) => d.id !== id),
//     }));

//     get().persist();
//   },

//   uploadFile: async (file) => {
//     const result = await uploadPDF(file);

//     const doc = {
//       id: Date.now(),
//       name: file.name,
//       pages: result.pages || result.total_pages || 0,
//       uploadedAt: Date.now(),
//       status: "indexed",
//     };

//     set((state) => ({
//       docs: [...state.docs, doc],
//     }));

//     get().persist();

//     return result;
//   },

//   sendMessage: async (question) => {
//     const convId = get().activeConvId;

//     if (!convId) return;

//     const startTime = Date.now();

//     const userMessage = {
//       id: createId(),
//       role: "user",
//       content: question,
//     };

//     const pendingMessage = {
//       id: createId(),
//       role: "assistant",
//       content: "",
//       pending: true,
//     };

//     set((state) => ({
//       conversations: state.conversations.map((conv) =>
//         conv.id === convId
//           ? {
//               ...conv,
//               messages: [...conv.messages, userMessage, pendingMessage],
//             }
//           : conv
//       ),
//     }));

//     try {
//       const response = await askQuestion(question);

//       const finalMessage = {
//         id: createId(),
//         role: "assistant",
//         content: response.answer || "No answer returned",
//         pending: false,

//         sources: (response.sources || []).map((s, index) => ({
//           file_name: s.file_name || "Document",

//           page: s.page || "-",

//           section: s.section || "Unknown",

//           score: s.score || 0,

//           chunk_id: s.chunk_id || index + 1,
//         })),

//         meta: {
//           ms: Date.now() - startTime,
//           tokens: response.tokens || 0,
//         },
//       };

//       set((state) => ({
//         conversations: state.conversations.map((conv) =>
//           conv.id === convId
//             ? {
//                 ...conv,

//                 title:
//                   conv.messages.length === 0
//                     ? question.slice(0, 40)
//                     : conv.title,

//                 messages: conv.messages.map((m) =>
//                   m.pending ? finalMessage : m
//                 ),
//               }
//             : conv
//         ),

//         analytics: {
//           ...state.analytics,
//           totalQueries: state.analytics.totalQueries + 1,
//           avgMs: Math.round(
//             (state.analytics.avgMs * state.analytics.totalQueries + (Date.now() - startTime)) /
//               (state.analytics.totalQueries + 1)
//           ),
//           docsSearched: response.sources?.length || 0,
//         },
//       }));
//     } catch (err) {
//       set((state) => ({
//         conversations: state.conversations.map((conv) =>
//           conv.id === convId
//             ? {
//                 ...conv,
//                 messages: conv.messages.map((m) =>
//                   m.pending
//                     ? {
//                         ...m,
//                         content: "Something went wrong while generating the answer.",
//                         pending: false,
//                       }
//                     : m
//                 ),
//               }
//             : conv
//         ),
//       }));
//       throw err;
//     } finally {
//       get().persist();
//     }
//   },
// }));


import { create } from "zustand";
import {
  uploadPDF,
  askQuestion,
  login,
  getCurrentUser,
  getAllUsers,
  createUser,
  deleteUser,
  updateUser,
} from "../api/api";

export const selectActiveConv = (state) =>
  state.conversations.find((c) => c.id === state.activeConvId);

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem("salesiq-theme");
  return savedTheme === "light" ? "light" : "dark";
};

const createId = () => {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }

  return "id-" + Date.now() + "-" + Math.random().toString(36).slice(2, 11);
};

export const useStore = create((set, get) => ({
  // Auth state
  isAuthenticated: !!localStorage.getItem("token"),
  user: null,
  users: [],
  loading: false,
  error: null,

  sidebarOpen: true,
  rightOpen: true,
  theme: getInitialTheme(),

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

  // ============ Auth Methods ============

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.access_token);
      set({
        isAuthenticated: true,
        user: data.user,
        loading: false,
      });
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Login failed";
      set({
        error: errorMsg,
        loading: false,
      });
      return { success: false, error: errorMsg };
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("salesiq-data");
    set({
      isAuthenticated: false,
      user: null,
      conversations: [],
      activeConvId: null,
    });
  },

  initAuth: async () => {
    if (!localStorage.getItem("token")) return;

    set({ loading: true });
    try {
      const user = await getCurrentUser();
      set({ user, isAuthenticated: true, loading: false });
    } catch (err) {
      localStorage.removeItem("token");
      set({ isAuthenticated: false, user: null, loading: false });
    }
  },

  // ============ User Management Methods (Admin) ============

  fetchAllUsers: async () => {
    set({ loading: true, error: null });
    try {
      const users = await getAllUsers();
      set({ users, loading: false });
      return users;
    } catch (err) {
      set({
        error: err.response?.data?.detail || "Failed to fetch users",
        loading: false,
      });
      return [];
    }
  },

  createNewUser: async (email, fullName, password, role) => {
    set({ loading: true, error: null });
    try {
      const newUser = await createUser(email, fullName, password, role);
      set((state) => ({
        users: [...state.users, newUser],
        loading: false,
      }));
      return { success: true, user: newUser };
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Failed to create user";
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  removeUser: async (userId) => {
    set({ loading: true, error: null });
    try {
      await deleteUser(userId);
      set((state) => ({
        users: state.users.filter((u) => u.id !== userId),
        loading: false,
      }));
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Failed to delete user";
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  updateUserRole: async (userId, fullName, role, isActive) => {
    set({ loading: true, error: null });
    try {
      const updated = await updateUser(userId, {
        full_name: fullName,
        role,
        is_active: isActive,
      });
      set((state) => ({
        users: state.users.map((u) =>
          u.id === userId ? updated : u
        ),
        loading: false,
      }));
      return { success: true, user: updated };
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Failed to update user";
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  // ============ Document Management ============

  init: () => {
    const saved = localStorage.getItem("salesiq-data");

    if (saved) {
      try {
        const data = JSON.parse(saved);

        set({
          docs: data.docs || [],
          conversations: data.conversations || [],
          activeConvId: data.activeConvId || null,
        });
      } catch (err) {
        console.log(err);
      }
    }

    if (get().conversations.length === 0) {
      get().newChat();
    }
  },

  persist: () => {
    const state = get();

    localStorage.setItem(
      "salesiq-data",
      JSON.stringify({
        docs: state.docs,
        conversations: state.conversations,
        activeConvId: state.activeConvId,
      })
    );
  },

  setSidebarOpen: (value) => set({ sidebarOpen: value }),

  setRightOpen: (value) => set({ rightOpen: value }),

  setModel: (model) => set({ model }),

  setTheme: (theme) => {
    localStorage.setItem("salesiq-theme", theme);
    set({ theme });
  },

  toggleTheme: () => {
    const nextTheme = get().theme === "dark" ? "light" : "dark";
    localStorage.setItem("salesiq-theme", nextTheme);
    set({ theme: nextTheme });
  },

  newChat: () => {
    const id = Date.now().toString();

    const conversation = {
      id,
      title: "New Conversation",
      createdAt: Date.now(),
      messages: [],
    };

    set((state) => ({
      conversations: [conversation, ...state.conversations],
      activeConvId: id,
    }));

    get().persist();
  },

  selectConv: (id) => set({ activeConvId: id }),

  renameConv: (id, title) => {
    set((state) => ({
      conversations: state.conversations.map((conv) =>
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
      docs: state.docs.filter((d) => d.id !== id),
    }));

    get().persist();
  },

  uploadFile: async (file) => {
    const result = await uploadPDF(file);

    const doc = {
      id: Date.now(),
      name: file.name,
      pages: result.pages || result.total_pages || 0,
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
    const convId = get().activeConvId;

    if (!convId) return;

    const startTime = Date.now();

    const userMessage = {
      id: createId(),
      role: "user",
      content: question,
    };

    const pendingMessage = {
      id: createId(),
      role: "assistant",
      content: "",
      pending: true,
    };

    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === convId
          ? {
              ...conv,
              messages: [...conv.messages, userMessage, pendingMessage],
            }
          : conv
      ),
    }));

    try {
      await askQuestion(
        question,
        // STREAM TOKENS
        (chunk) => {
          set((state) => ({
            conversations:
              state.conversations.map(
                (conv) =>
                  conv.id === convId
                    ? {
                        ...conv,
                        messages:
                          conv.messages.map(
                            (m) =>
                              m.pending
                                ? {
                                    ...m,
                                    content:
                                      m.content +
                                      chunk
                                  }
                                : m
                          )
                      }
                    : conv
              )
          }));
        },
        // SOURCES
        (sources) => {
          set((state) => ({
            conversations:
              state.conversations.map(
                (conv) =>
                  conv.id === convId
                    ? {
                        ...conv,
                        messages:
                          conv.messages.map(
                            (m) =>
                              m.pending
                                ? {
                                    ...m,
                                    sources:
                                      sources.map(
                                        (
                                          s,
                                          index
                                        ) => ({
                                          file_name:
                                            s.file_name ||
                                            "Document",
                                          page:
                                            s.page ||
                                            "-",
                                          section:
                                            s.section ||
                                            "Unknown",
                                          score:
                                            s.score ||
                                            0,
                                          chunk_id:
                                            s.chunk_id ||
                                            index + 1
                                        })
                                      )
                                  }
                                : m
                          )
                      }
                    : conv
              )
          }));
        }
      );

      set((state) => ({
        conversations: state.conversations.map((conv) =>
          conv.id === convId
            ? {
                ...conv,

                title:
                  conv.messages.length === 0
                    ? question.slice(0, 40)
                    : conv.title,

                messages: conv.messages.map((m) =>
                  m.pending
                    ? {
                        ...m,
                        pending: false,
                        meta: {
                          ms: Date.now() - startTime,
                        },
                      }
                    : m
                ),
              }
            : conv
        ),

        analytics: {
          ...state.analytics,
          totalQueries: state.analytics.totalQueries + 1,
          avgMs: Math.round(
            (state.analytics.avgMs * state.analytics.totalQueries + (Date.now() - startTime)) /
              (state.analytics.totalQueries + 1)
          ),
        },
      }));
    } catch (err) {
      set((state) => ({
        conversations: state.conversations.map((conv) =>
          conv.id === convId
            ? {
                ...conv,
                messages: conv.messages.map((m) =>
                  m.pending
                    ? {
                        ...m,
                        content: "Something went wrong while generating the answer.",
                        pending: false,
                      }
                    : m
                ),
              }
            : conv
        ),
      }));
      throw err;
    } finally {
      get().persist();
    }
  },
}));