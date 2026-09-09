import React, { useEffect, useMemo, useState } from "react";
<<<<<<< HEAD
import { motion } from "framer-motion";

import { adminUsersApi } from "../../api/users.api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const usersPerPage = 10;

  // =========================================================
  // ERROR MESSAGE
  // =========================================================

  const getErrorMessage = (error) => {
    const data = error?.response?.data;

    if (!data) {
      return error?.message || "Something went wrong.";
    }

    if (typeof data === "string") {
      return data;
    }

    if (data.detail) {
      return String(data.detail);
    }

    if (data.message) {
      return String(data.message);
    }

    if (typeof data === "object") {
      const messages = [];

      Object.entries(data).forEach(([field, value]) => {
        if (Array.isArray(value)) {
          messages.push(`${field}: ${value.join(", ")}`);
        } else {
          messages.push(`${field}: ${String(value)}`);
        }
      });

      if (messages.length) {
        return messages.join(" | ");
      }
    }

    return "Something went wrong.";
  };

  // =========================================================
  // FETCH USERS
  // =========================================================

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await adminUsersApi.getUsers();

      console.log("ADMIN USERS RESPONSE:", response);
      console.log("ADMIN USERS DATA:", response?.data);

      const responseData = response?.data;

      const userData =
        responseData?.data?.data ??
        responseData?.data ??
        responseData?.results ??
        responseData ??
        [];

      if (!Array.isArray(userData)) {
        throw new Error("Invalid users response from server.");
      }

      setUsers(userData);
    } catch (error) {
      console.error("FETCH USERS ERROR:", error);

      setUsers([]);

      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchUsers();
  }, []);

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) => {
      const name = (
        user?.name ||
        user?.full_name ||
        `${user?.first_name || ""} ${user?.last_name || ""}`
      )
        .toLowerCase()
        .trim();

      const email = user?.email?.toLowerCase() || "";

      const phone = user?.phone?.toLowerCase() || "";

      return (
        name.includes(query) || email.includes(query) || phone.includes(query)
      );
    });
  }, [users, searchQuery]);

  // =========================================================
  // PAGINATION
  // =========================================================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / usersPerPage),
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const currentUsers = filteredUsers.slice(
    (safeCurrentPage - 1) * usersPerPage,
    safeCurrentPage * usersPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // =========================================================
  // STATUS
  // =========================================================

  const handleStatusChange = async (user) => {
    if (!user?.id || isUpdating) {
=======

import { Link } from "react-router-dom";

import { motion } from "framer-motion";

import { useAdminUsers } from "../hooks/useAdminUsers";

export default function AdminUsers() {
  // ========================================================
  // HOOK
  // ========================================================

  const {
    users,
    summary,
    loading,
    error,
    getUsers,
    activateUser,
    deactivateUser,
  } = useAdminUsers();

  // ========================================================
  // LOCAL STATE
  // ========================================================

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [actionUserId, setActionUserId] = useState(null);

  // ========================================================
  // FETCH USERS
  // ========================================================

  useEffect(() => {
    getUsers().catch(() => {});
  }, [getUsers]);

  // ========================================================
  // FILTER USERS
  // ========================================================

  const filteredUsers = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return users.filter((user) => {
      // ----------------------------------------------------
      // STATUS FILTER
      // ----------------------------------------------------

      if (statusFilter === "active" && !user.is_active) {
        return false;
      }

      if (statusFilter === "inactive" && user.is_active) {
        return false;
      }

      // ----------------------------------------------------
      // SEARCH
      // ----------------------------------------------------

      if (!searchValue) {
        return true;
      }

      const name = user.name?.toLowerCase() || "";

      const email = user.email?.toLowerCase() || "";

      const phone = user.phone?.toLowerCase() || "";

      const username = user.username?.toLowerCase() || "";

      return (
        name.includes(searchValue) ||
        email.includes(searchValue) ||
        phone.includes(searchValue) ||
        username.includes(searchValue)
      );
    });
  }, [users, search, statusFilter]);

  // ========================================================
  // ACTIVATE
  // ========================================================

  const handleActivate = async (user) => {
    const confirmed = window.confirm(`Activate ${user.name || user.email}?`);

    if (!confirmed) {
>>>>>>> 06aea52236f876a0fbdf68067e6cd707bc6354bd
      return;
    }

    try {
<<<<<<< HEAD
      setIsUpdating(true);
      setError("");

      const newStatus = !Boolean(user.is_active);

      await adminUsersApi.updateStatus(user.id, newStatus);

      setUsers((previousUsers) =>
        previousUsers.map((item) =>
          item.id === user.id
            ? {
                ...item,
                is_active: newStatus,
              }
            : item,
        ),
      );
    } catch (error) {
      console.error("UPDATE USER STATUS ERROR:", error);

      setError(getErrorMessage(error));
    } finally {
      setIsUpdating(false);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async () => {
    if (!selectedUser?.id) {
=======
      setActionUserId(user.id);

      await activateUser(user.id);
    } catch (err) {
      console.error("Failed to activate user:", err);

      window.alert("Failed to activate user.");
    } finally {
      setActionUserId(null);
    }
  };

  // ========================================================
  // DEACTIVATE
  // ========================================================

  const handleDeactivate = async (user) => {
    if (user.is_superuser) {
      window.alert("Super admin cannot be deactivated.");

      return;
    }

    const confirmed = window.confirm(`Deactivate ${user.name || user.email}?`);

    if (!confirmed) {
>>>>>>> 06aea52236f876a0fbdf68067e6cd707bc6354bd
      return;
    }

    try {
<<<<<<< HEAD
      setIsDeleting(true);
      setError("");

      await adminUsersApi.deleteUser(selectedUser.id);

      setUsers((previousUsers) =>
        previousUsers.filter((user) => user.id !== selectedUser.id),
      );

      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("DELETE USER ERROR:", error);

      setError(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-gray-500">Loading users...</p>
=======
      setActionUserId(user.id);

      await deactivateUser(user.id);
    } catch (err) {
      console.error("Failed to deactivate user:", err);

      window.alert("Failed to deactivate user.");
    } finally {
      setActionUserId(null);
    }
  };

  // ========================================================
  // REFRESH
  // ========================================================

  const handleRefresh = async () => {
    try {
      await getUsers();
    } catch (err) {
      console.error("Failed to refresh users:", err);
    }
  };

  // ========================================================
  // LOADING
  // ========================================================

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" />

            <p className="text-sm font-medium text-gray-500">
              Loading users...
            </p>
          </div>
>>>>>>> 06aea52236f876a0fbdf68067e6cd707bc6354bd
        </div>
      </div>
    );
  }

<<<<<<< HEAD
  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div>
        <h2 className="text-2xl font-bold text-gray-900">Users</h2>

        <p className="text-sm text-gray-500 mt-1">Manage registered users</p>
      </div>

      {/* ERROR */}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-red-500">
              error
            </span>

            <p className="text-sm text-red-600">{error}</p>
          </div>

          <button
            type="button"
            onClick={fetchUsers}
            className="text-sm font-semibold text-red-600"
          >
            Retry
          </button>
        </div>
      )}

      {/* SEARCH */}

      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            search
          </span>

          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search users by name, email or phone..."
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      {/* TABLE */}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  User
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Email
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Phone
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Joined
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {currentUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-16 text-center">
                    <span className="material-symbols-outlined text-gray-300 text-5xl">
                      group
                    </span>

                    <p className="mt-3 text-gray-500 font-medium">
                      No users found
                    </p>
                  </td>
                </tr>
              ) : (
                currentUsers.map((user) => {
                  const name =
                    user?.name ||
                    user?.full_name ||
                    `${user?.first_name || ""} ${
                      user?.last_name || ""
                    }`.trim() ||
                    "User";

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* USER */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-semibold">
                            {name.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {name}
                            </p>

                            <p className="text-xs text-gray-400">
                              ID: {user.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* EMAIL */}

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {user.email || "N/A"}
                      </td>

                      {/* PHONE */}

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {user.phone || "N/A"}
                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(user)}
                          disabled={isUpdating}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                            user.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>

                      {/* JOINED */}

                      <td className="px-5 py-4 text-sm text-gray-500">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString(
                              "en-IN",
                            )
                          : "N/A"}
                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                            title="Delete user"
                          >
                            <span className="material-symbols-outlined text-base">
                              delete
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}

        {filteredUsers.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {(safeCurrentPage - 1) * usersPerPage + 1} to{" "}
              {Math.min(safeCurrentPage * usersPerPage, filteredUsers.length)}{" "}
              of {filteredUsers.length}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={safeCurrentPage === 1}
                onClick={() => setCurrentPage(safeCurrentPage - 1)}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40"
              >
                Previous
              </button>

              <span className="px-3 py-2 text-sm text-gray-600">
                {safeCurrentPage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={safeCurrentPage === totalPages}
                onClick={() => setCurrentPage(safeCurrentPage + 1)}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DELETE MODAL */}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="bg-white rounded-2xl p-6 max-w-md w-full mx-4"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-red-600 text-3xl">
                  warning
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Delete User
              </h3>

              <p className="text-gray-500 text-sm mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-900">
                  {selectedUser?.email}
                </span>
                ?
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-semibold"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
=======
  // ========================================================
  // PAGE
  // ========================================================

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600">
                group
              </span>

              <span className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                Admin Management
              </span>
            </div>

            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              Users
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage customers, accounts, addresses and user status.
            </p>
          </div>

          {/* REFRESH */}

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span
              className={`material-symbols-outlined text-lg ${
                loading ? "animate-spin" : ""
              }`}
            >
              refresh
            </span>
            Refresh
          </button>
        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-red-500">
                error
              </span>

              <div>
                <p className="font-semibold text-red-700">
                  Failed to load users
                </p>

                <p className="mt-1 text-sm text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================
            SUMMARY CARDS
        ================================================== */}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* TOTAL */}

          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>

                <p className="mt-2 text-3xl font-black text-gray-900">
                  {summary.total_users}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
                <span className="material-symbols-outlined text-indigo-600">
                  group
                </span>
              </div>
            </div>
          </motion.div>

          {/* ACTIVE */}

          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.05,
            }}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Active Users
                </p>

                <p className="mt-2 text-3xl font-black text-green-600">
                  {summary.active_users}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
                <span className="material-symbols-outlined text-green-600">
                  person_check
                </span>
              </div>
            </div>
          </motion.div>

          {/* INACTIVE */}

          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.1,
            }}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Inactive Users
                </p>

                <p className="mt-2 text-3xl font-black text-red-600">
                  {summary.inactive_users}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
                <span className="material-symbols-outlined text-red-600">
                  person_off
                </span>
>>>>>>> 06aea52236f876a0fbdf68067e6cd707bc6354bd
              </div>
            </div>
          </motion.div>
        </div>
<<<<<<< HEAD
      )}
=======

        {/* ==================================================
            FILTER BAR
        ================================================== */}

        <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* SEARCH */}

            <div className="relative w-full lg:max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                search
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, phone..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* STATUS FILTER */}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  statusFilter === "all"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("active")}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  statusFilter === "active"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Active
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("inactive")}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  statusFilter === "inactive"
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Inactive
              </button>
            </div>
          </div>
        </div>

        {/* ==================================================
            RESULT COUNT
        ================================================== */}

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-bold text-gray-900">
              {filteredUsers.length}
            </span>{" "}
            of <span className="font-bold text-gray-900">{users.length}</span>{" "}
            users
          </p>
        </div>

        {/* ==================================================
            USER TABLE
        ================================================== */}

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {filteredUsers.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <span className="material-symbols-outlined text-3xl text-gray-400">
                  person_search
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-900">
                No users found
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Try changing your search or filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                      User
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                      Contact
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                      Role
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500">
                      Addresses
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => {
                    const isActionLoading = actionUserId === user.id;

                    return (
                      <tr key={user.id} className="transition hover:bg-gray-50">
                        {/* USER */}

                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-indigo-100">
                              {user.profile_image ? (
                                <img
                                  src={user.profile_image}
                                  alt={user.name || "User"}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-black text-indigo-600">
                                  {(user.name || user.email || "U")
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>
                              )}
                            </div>

                            <div>
                              <p className="font-bold text-gray-900">
                                {user.name || "Unnamed User"}
                              </p>

                              {user.username && (
                                <p className="text-xs text-gray-400">
                                  @{user.username}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* CONTACT */}

                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {user.email}
                            </p>

                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              {user.is_email_verified && (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                                  <span className="material-symbols-outlined text-sm">
                                    verified
                                  </span>
                                  Email
                                </span>
                              )}

                              {user.phone && (
                                <span className="text-xs text-gray-500">
                                  {user.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* ROLE */}

                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700">
                            {user.role?.name || "No Role"}
                          </span>
                        </td>

                        {/* ADDRESSES */}

                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-gray-800">
                            {user.address_count ?? 0}
                          </span>
                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-4 text-center">
                          {user.is_active ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                              Inactive
                            </span>
                          )}
                        </td>

                        {/* ACTIONS */}

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {/* VIEW */}

                            <Link
                              to={`/admin/users/${user.id}`}
                              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                            >
                              <span className="material-symbols-outlined text-base">
                                visibility
                              </span>
                              View
                            </Link>

                            {/* STATUS */}

                            {user.is_active ? (
                              <button
                                type="button"
                                disabled={isActionLoading || user.is_superuser}
                                onClick={() => handleDeactivate(user)}
                                className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {isActionLoading ? (
                                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-300 border-t-red-600" />
                                ) : (
                                  <span className="material-symbols-outlined text-base">
                                    block
                                  </span>
                                )}
                                Deactivate
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={isActionLoading}
                                onClick={() => handleActivate(user)}
                                className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-3 py-2 text-xs font-bold text-green-600 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {isActionLoading ? (
                                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-green-300 border-t-green-600" />
                                ) : (
                                  <span className="material-symbols-outlined text-base">
                                    check_circle
                                  </span>
                                )}
                                Activate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
>>>>>>> 06aea52236f876a0fbdf68067e6cd707bc6354bd
    </div>
  );
}
