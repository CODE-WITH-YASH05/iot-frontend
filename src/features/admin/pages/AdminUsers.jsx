import React, { useEffect, useMemo, useState } from "react";

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
      return;
    }

    try {
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
      return;
    }

    try {
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
        </div>
      </div>
    );
  }

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
              </div>
            </div>
          </motion.div>
        </div>

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
    </div>
  );
}
