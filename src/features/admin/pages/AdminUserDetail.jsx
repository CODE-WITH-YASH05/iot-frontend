import React, { useEffect } from "react";

import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";

import { useAdminUsers } from "../hooks/useAdminUsers";

export default function AdminUserDetail() {
  const { userId } = useParams();

  const {
    selectedUser,
    userAddresses,
    loading,
    error,
    getUser,
    getUserAddresses,
    activateUser,
    deactivateUser,
  } = useAdminUsers();

  useEffect(() => {
    if (!userId) {
      return;
    }

    getUser(userId).catch(() => {});

    getUserAddresses(userId).catch(() => {});
  }, [userId, getUser, getUserAddresses]);

  // ========================================================
  // LOADING
  // ========================================================

  if (loading && !selectedUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" />

            <p className="text-sm font-medium text-gray-500">
              Loading user details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // ERROR
  // ========================================================

  if (error && !selectedUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
            <span className="material-symbols-outlined mb-3 text-5xl text-red-500">
              error
            </span>

            <h2 className="text-xl font-bold text-gray-900">
              Failed to load user
            </h2>

            <p className="mt-2 text-sm text-red-600">{error}</p>

            <Link
              to="/admin/users"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white"
            >
              <span className="material-symbols-outlined text-base">
                arrow_back
              </span>
              Back to Users
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedUser) {
    return null;
  }

  const user = selectedUser;

  // ========================================================
  // STATUS
  // ========================================================

  const handleStatusChange = async () => {
    try {
      if (user.is_active) {
        if (user.is_superuser) {
          window.alert("Super admin cannot be deactivated.");
          return;
        }

        const confirmed = window.confirm(
          `Deactivate ${user.name || user.email}?`,
        );

        if (!confirmed) {
          return;
        }

        await deactivateUser(user.id);
      } else {
        const confirmed = window.confirm(
          `Activate ${user.name || user.email}?`,
        );

        if (!confirmed) {
          return;
        }

        await activateUser(user.id);
      }
    } catch (err) {
      console.error("Failed to update user status:", err);

      window.alert("Failed to update user status.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              to="/admin/users"
              className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-indigo-600"
            >
              <span className="material-symbols-outlined text-lg">
                arrow_back
              </span>
              Back to Users
            </Link>

            <div className="flex items-center gap-4">
              {/* PROFILE IMAGE */}

              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-indigo-100">
                {user.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt={user.name || "User"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-black text-indigo-600">
                    {(user.name || user.email || "U").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-3xl font-black text-gray-900">
                  {user.name || "Unnamed User"}
                </h1>

                <p className="mt-1 text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>

          {/* STATUS BUTTON */}

          <button
            type="button"
            onClick={handleStatusChange}
            disabled={loading || user.is_superuser}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
              user.is_active
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              {user.is_active ? "block" : "check_circle"}
            </span>

            {user.is_active ? "Deactivate User" : "Activate User"}
          </button>
        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* ==================================================
            PERSONAL INFORMATION
        ================================================== */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2"
          >
            <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                <span className="material-symbols-outlined text-indigo-600">
                  person
                </span>
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Personal Information
                </h2>

                <p className="text-xs text-gray-500">User account details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <InfoItem label="Full Name" value={user.name} />

              <InfoItem
                label="Username"
                value={user.username ? `@${user.username}` : "Not set"}
              />

              <InfoItem label="Email" value={user.email} />

              <InfoItem label="Phone" value={user.phone || "Not set"} />

              <InfoItem label="Gender" value={user.gender || "Not set"} />

              <InfoItem
                label="Date of Birth"
                value={user.date_of_birth || "Not set"}
              />

              <InfoItem
                label="Role"
                value={user.role?.name || user.role_name || "No Role"}
              />

              <InfoItem label="User ID" value={user.id} />
            </div>

            {user.bio && (
              <div className="mt-6 border-t border-gray-100 pt-5">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                  Bio
                </p>

                <p className="text-sm leading-6 text-gray-600">{user.bio}</p>
              </div>
            )}
          </motion.div>

          {/* ==================================================
              ACCOUNT STATUS
          ================================================== */}

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
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                <span className="material-symbols-outlined text-green-600">
                  security
                </span>
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">Account</h2>

                <p className="text-xs text-gray-500">Account status</p>
              </div>
            </div>

            <div className="space-y-4">
              <StatusRow label="Account" active={user.is_active} />

              <StatusRow
                label="Email Verified"
                active={user.is_email_verified}
              />

              <StatusRow
                label="Phone Verified"
                active={user.is_phone_verified}
              />

              <StatusRow label="Staff" active={user.is_staff} />

              <StatusRow label="Super Admin" active={user.is_superuser} />
            </div>
          </motion.div>
        </div>

        {/* ==================================================
            ADDRESSES
        ================================================== */}

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
          className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
                <span className="material-symbols-outlined text-orange-600">
                  location_on
                </span>
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Saved Addresses
                </h2>

                <p className="text-xs text-gray-500">
                  Addresses saved by this user
                </p>
              </div>
            </div>

            <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600">
              {userAddresses.length}{" "}
              {userAddresses.length === 1 ? "Address" : "Addresses"}
            </span>
          </div>

          {userAddresses.length === 0 ? (
            <div className="py-10 text-center">
              <span className="material-symbols-outlined text-5xl text-gray-300">
                location_off
              </span>

              <p className="mt-3 font-semibold text-gray-700">
                No addresses found
              </p>

              <p className="mt-1 text-sm text-gray-400">
                This user has not saved any address.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {userAddresses.map((address) => (
                <div
                  key={address.id}
                  className={`rounded-2xl border-2 p-5 ${
                    address.is_default
                      ? "border-indigo-400 bg-indigo-50/30"
                      : "border-gray-100 bg-gray-50"
                  }`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-indigo-600">
                        home
                      </span>

                      <span className="text-sm font-bold capitalize text-gray-800">
                        {address.address_type || "Address"}
                      </span>
                    </div>

                    {address.is_default && (
                      <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[10px] font-bold text-indigo-700">
                        DEFAULT
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-sm text-gray-600">
                    <p className="font-bold text-gray-900">
                      {address.full_name}
                    </p>

                    <p>{address.phone}</p>

                    <p>{address.address_line_1}</p>

                    {address.address_line_2 && <p>{address.address_line_2}</p>}

                    {address.landmark && <p>Landmark: {address.landmark}</p>}

                    <p>
                      {address.city}, {address.state}
                    </p>

                    <p>
                      {address.country} - {address.postal_code}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-3">
                    <span
                      className={`text-xs font-bold ${
                        address.is_active ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {address.is_active ? "Active" : "Inactive"}
                    </span>

                    <span className="text-xs text-gray-400">
                      {address.created_at
                        ? new Date(address.created_at).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

// ==========================================================
// INFO ITEM
// ==========================================================

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p className="break-all text-sm font-semibold text-gray-800">
        {value || "Not set"}
      </p>
    </div>
  );
}

// ==========================================================
// STATUS ROW
// ==========================================================

function StatusRow({ label, active }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
      <span className="text-sm font-medium text-gray-600">{label}</span>

      <span
        className={`inline-flex items-center gap-1.5 text-xs font-bold ${
          active ? "text-green-600" : "text-gray-400"
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${
            active ? "bg-green-500" : "bg-gray-300"
          }`}
        />

        {active ? "Yes" : "No"}
      </span>
    </div>
  );
}
