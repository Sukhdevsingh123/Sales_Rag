import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Trash2,
  Plus,
  Edit2,
  Shield,
  Mail,
  Check,
  X,
  Moon,
  Sun,
} from "lucide-react";
import { useStore } from "../store/store";
import { toast } from "sonner";

export default function AdminPanel() {
  const navigate = useNavigate();
  const store = useStore();
  const theme = useStore((state) => state.theme);
  const toggleTheme = useStore((state) => state.toggleTheme);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    password: "",
    role: "user",
  });
  const [editForm, setEditForm] = useState({
    fullName: "",
    role: "user",
    isActive: true,
  });

  useEffect(() => {
    if (!store.isAuthenticated) {
      navigate("/login");
      return;
    }

    if (store.user?.role !== "admin") {
      toast.error("Admin access required");
      navigate("/");
      return;
    }

    loadUsers();
  }, []);

  const loadUsers = async () => {
    await store.fetchAllUsers();
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    const result = await store.createNewUser(
      formData.email,
      formData.fullName,
      formData.password,
      formData.role
    );

    if (result.success) {
      toast.success("User created successfully");
      setFormData({ email: "", fullName: "", password: "", role: "user" });
      setShowCreateForm(false);
    } else {
      toast.error(result.error);
    }
  };

  const handleUpdateUser = async (userId) => {
    const result = await store.updateUserRole(
      userId,
      editForm.fullName,
      editForm.role,
      editForm.isActive
    );

    if (result.success) {
      toast.success("User updated successfully");
      setEditingId(null);
    } else {
      toast.error(result.error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === store.user?.id) {
      toast.error("Cannot delete your own account");
      return;
    }

    if (window.confirm("Are you sure you want to delete this user?")) {
      const result = await store.removeUser(userId);
      if (result.success) {
        toast.success("User deleted successfully");
      } else {
        toast.error(result.error);
      }
    }
  };

  const startEdit = (user) => {
    setEditingId(user.id);
    setEditForm({
      fullName: user.full_name,
      role: user.role,
      isActive: user.is_active,
    });
  };

  const ThemeIcon = theme === "dark" ? Sun : Moon;

  return (
    <div className="theme-page min-h-screen p-4 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 p-3">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Admin Panel</h1>
                <p className="theme-muted text-sm">Manage users and permissions</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="theme-input theme-hover inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
              >
                <ThemeIcon className="h-4 w-4" />
                {theme === "dark" ? "Light" : "Dark"}
              </button>

              <button
                onClick={() => navigate("/")}
                className="theme-input theme-hover rounded-lg border px-4 py-2 text-sm font-medium"
              >
                Back
              </button>

              <button
                onClick={() => {
                  store.logout();
                  navigate("/login");
                }}
                className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20"
              >
                Logout
              </button>
            </div>
          </div>
        </motion.div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="theme-surface rounded-lg border p-4 backdrop-blur"
          >
            <div className="text-3xl font-bold">{store.users.length}</div>
            <div className="theme-muted text-sm">Total Users</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="theme-surface rounded-lg border p-4 backdrop-blur"
          >
            <div className="text-3xl font-bold text-emerald-400">
              {store.users.filter((u) => u.role === "admin").length}
            </div>
            <div className="theme-muted text-sm">Admins</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="theme-surface rounded-lg border p-4 backdrop-blur"
          >
            <div className="text-3xl font-bold text-cyan-400">
              {store.users.filter((u) => u.role === "user").length}
            </div>
            <div className="theme-muted text-sm">Regular Users</div>
          </motion.div>
        </div>

        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-8 rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-6"
          >
            <h3 className="mb-4 text-lg font-semibold">Create New User</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="theme-input rounded-lg border px-4 py-2 outline-none focus:border-cyan-400"
                />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  className="theme-input rounded-lg border px-4 py-2 outline-none focus:border-cyan-400"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="theme-input rounded-lg border px-4 py-2 outline-none focus:border-cyan-400"
                />
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="theme-input rounded-lg border px-4 py-2 outline-none focus:border-cyan-400"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="test">Test</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 py-2 font-semibold text-white hover:opacity-90"
                >
                  Create User
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="theme-input theme-hover flex-1 rounded-lg border py-2 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="mb-8 flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-2 font-semibold text-white hover:opacity-90"
          >
            <Plus className="h-5 w-5" />
            Add New User
          </button>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="theme-surface overflow-hidden rounded-lg border backdrop-blur"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="theme-divider border-b" style={{ background: "var(--surface)" }}>
                <tr>
                  <th className="theme-muted px-6 py-4 text-left font-semibold">Email</th>
                  <th className="theme-muted px-6 py-4 text-left font-semibold">Name</th>
                  <th className="theme-muted px-6 py-4 text-left font-semibold">Role</th>
                  <th className="theme-muted px-6 py-4 text-left font-semibold">Status</th>
                  <th className="theme-muted px-6 py-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody style={{ divideColor: "var(--border-soft)" }}>
                {store.users.map((user) => (
                  <tr key={user.id} className="theme-hover transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Mail className="theme-subtle h-4 w-4" />
                        {user.email}
                      </div>
                    </td>
                    <td className="theme-muted px-6 py-4">{user.full_name}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          user.role === "admin"
                            ? "bg-violet-500/20 text-violet-400"
                            : user.role === "test"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-cyan-500/20 text-cyan-400"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_active ? (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <Check className="h-4 w-4" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-400">
                          <X className="h-4 w-4" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {editingId === user.id ? (
                          <>
                            <button
                              onClick={() => handleUpdateUser(user.id)}
                              className="rounded bg-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/30"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="rounded bg-gray-500/20 px-2 py-1 text-xs font-semibold text-gray-400 hover:bg-gray-500/30"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(user)}
                              className="flex items-center gap-1 rounded bg-blue-500/20 px-2 py-1 text-xs font-semibold text-blue-400 hover:bg-blue-500/30"
                            >
                              <Edit2 className="h-3 w-3" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="flex items-center gap-1 rounded bg-red-500/20 px-2 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/30"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {store.users.length === 0 && (
            <div className="theme-muted flex h-32 items-center justify-center">
              No users found
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
