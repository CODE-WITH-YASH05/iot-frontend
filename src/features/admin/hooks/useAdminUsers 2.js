import { useCallback, useMemo, useState } from "react";

import adminUsersApi from "../api/AdminUsers.api";

const EMPTY_PARAMS = Object.freeze({
  // Intentionally empty.
});

const EMPTY_SUMMARY = {
  total_users: 0,
  active_users: 0,
  inactive_users: 0,
};

export function useAdminUsers({
  autoFetch = false,
  params = EMPTY_PARAMS,
} = {}) {
  // ========================================================
  // STATE
  // ========================================================

  const [users, setUsers] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);

  const [userAddresses, setUserAddresses] = useState([]);

  const [summary, setSummary] = useState(EMPTY_SUMMARY);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  // ========================================================
  // STABLE PARAMS
  // ========================================================

  const paramsKey = useMemo(() => JSON.stringify(params ?? {}), [params]);

  const stableParams = useMemo(() => {
    try {
      return JSON.parse(paramsKey);
    } catch {
      return {};
    }
  }, [paramsKey]);

  // ========================================================
  // ERROR HANDLER
  // ========================================================

  const getErrorMessage = useCallback((err) => {
    const responseData = err?.response?.data;

    if (responseData?.message) {
      return responseData.message;
    }

    if (responseData?.detail) {
      return responseData.detail;
    }

    if (responseData && typeof responseData === "object") {
      const firstValue = Object.values(responseData)[0];

      if (Array.isArray(firstValue)) {
        return firstValue[0];
      }

      if (typeof firstValue === "string") {
        return firstValue;
      }
    }

    return err?.message || "Something went wrong.";
  }, []);

  // ========================================================
  // GET ALL USERS
  // ========================================================

  const getUsers = useCallback(
    async (requestParams = {}) => {
      try {
        setLoading(true);
        setError(null);

        const finalParams = {
          ...stableParams,
          ...requestParams,
        };

        console.log("ADMIN USERS FETCH:", finalParams);

        const response = await adminUsersApi.getUsers(finalParams);

        const responseData = response?.data?.data ?? {};

        const userList = Array.isArray(responseData.users)
          ? responseData.users
          : [];

        const userSummary = responseData.summary ?? EMPTY_SUMMARY;

        setUsers(userList);

        setSummary(userSummary);

        return {
          users: userList,
          summary: userSummary,
        };
      } catch (err) {
        console.error("Failed to fetch admin users:", err);

        const message = getErrorMessage(err);

        setError(message);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [stableParams, getErrorMessage],
  );

  // ========================================================
  // GET SINGLE USER
  // ========================================================

  const getUser = useCallback(
    async (userId) => {
      if (!userId) {
        throw new Error("User ID is required.");
      }

      try {
        setLoading(true);
        setError(null);

        const response = await adminUsersApi.getUser(userId);

        const user = response?.data?.data ?? null;

        setSelectedUser(user);

        return user;
      } catch (err) {
        console.error("Failed to fetch admin user:", err);

        const message = getErrorMessage(err);

        setError(message);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getErrorMessage],
  );

  // ========================================================
  // GET USER ADDRESSES
  // ========================================================

  const getUserAddresses = useCallback(
    async (userId) => {
      if (!userId) {
        throw new Error("User ID is required.");
      }

      try {
        setLoading(true);
        setError(null);

        const response = await adminUsersApi.getUserAddresses(userId);

        const addresses = response?.data?.data ?? [];

        const addressList = Array.isArray(addresses) ? addresses : [];

        setUserAddresses(addressList);

        return addressList;
      } catch (err) {
        console.error("Failed to fetch user addresses:", err);

        const message = getErrorMessage(err);

        setError(message);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getErrorMessage],
  );

  // ========================================================
  // UPDATE USER STATUS
  // ========================================================

  const updateUserStatus = useCallback(
    async (userId, isActive) => {
      if (!userId) {
        throw new Error("User ID is required.");
      }

      if (typeof isActive !== "boolean") {
        throw new Error("isActive must be a boolean.");
      }

      try {
        setLoading(true);
        setError(null);

        const response = await adminUsersApi.updateUserStatus(userId, isActive);

        const updatedUser = response?.data?.data ?? null;

        // ---------------------------------------------
        // Update selected user
        // ---------------------------------------------

        setSelectedUser((previous) => {
          if (!previous || previous.id !== userId) {
            return previous;
          }

          return {
            ...previous,
            ...(updatedUser ?? {}),
            is_active: isActive,
          };
        });

        // ---------------------------------------------
        // Update user list
        // ---------------------------------------------

        setUsers((previousUsers) =>
          previousUsers.map((user) =>
            user.id === userId
              ? {
                  ...user,
                  ...(updatedUser ?? {}),
                  is_active: isActive,
                }
              : user,
          ),
        );

        // ---------------------------------------------
        // Recalculate summary safely
        // ---------------------------------------------

        setSummary((previous) => {
          const targetUser = users.find((user) => user.id === userId);

          if (!targetUser) {
            return previous;
          }

          const oldStatus = Boolean(targetUser.is_active);

          if (oldStatus === isActive) {
            return previous;
          }

          return {
            ...previous,

            active_users: isActive
              ? previous.active_users + 1
              : Math.max(0, previous.active_users - 1),

            inactive_users: isActive
              ? Math.max(0, previous.inactive_users - 1)
              : previous.inactive_users + 1,
          };
        });

        return updatedUser;
      } catch (err) {
        console.error("Failed to update user status:", err);

        const message = getErrorMessage(err);

        setError(message);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [users, getErrorMessage],
  );

  // ========================================================
  // ACTIVATE USER
  // ========================================================

  const activateUser = useCallback(
    async (userId) => {
      return updateUserStatus(userId, true);
    },
    [updateUserStatus],
  );

  // ========================================================
  // DEACTIVATE USER
  // ========================================================

  const deactivateUser = useCallback(
    async (userId) => {
      return updateUserStatus(userId, false);
    },
    [updateUserStatus],
  );

  // ========================================================
  // CLEAR SELECTED USER
  // ========================================================

  const clearSelectedUser = useCallback(() => {
    setSelectedUser(null);
    setUserAddresses([]);
  }, []);

  // ========================================================
  // CLEAR ERROR
  // ========================================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ========================================================
  // RETURN
  // ========================================================

  return {
    // Data
    users,
    selectedUser,
    userAddresses,
    summary,

    // Status
    loading,
    error,

    // Fetch
    getUsers,
    getUser,
    getUserAddresses,

    // User status
    activateUser,
    deactivateUser,
    updateUserStatus,

    // Utilities
    clearSelectedUser,
    clearError,

    // Configuration
    autoFetch,
  };
}
