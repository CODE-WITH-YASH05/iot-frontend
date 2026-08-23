import { useCallback, useState } from "react";

import { addressApi } from "../api/Address.api";

export function useAddress() {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ============================================================
  // ERROR MESSAGE
  // ============================================================

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

  // ============================================================
  // GET ALL ADDRESSES
  // ============================================================

  const getAddresses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await addressApi.getAddresses();

      console.log("ADDRESS API RESPONSE:", response);

      const data = response?.data?.data ?? [];

      console.log("ADDRESS DATA:", data);

      setAddresses(Array.isArray(data) ? data : []);

      return data;
    } catch (err) {
      console.error("Failed to fetch addresses:", err);

      setError(getErrorMessage(err));

      throw err;
    } finally {
      setLoading(false);
    }
  }, [getErrorMessage]);

  // ============================================================
  // GET SINGLE ADDRESS
  // ============================================================

  const getAddress = useCallback(
    async (addressId) => {
      if (!addressId) {
        throw new Error("Address ID is required.");
      }

      try {
        setLoading(true);
        setError(null);

        const response = await addressApi.getAddress(addressId);

        const data = response?.data?.data ?? null;

        setSelectedAddress(data);

        return data;
      } catch (err) {
        console.error("Failed to fetch address:", err);

        setError(getErrorMessage(err));

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getErrorMessage],
  );

  // ============================================================
  // CREATE ADDRESS
  // ============================================================

  const addAddress = useCallback(
    async (payload) => {
      try {
        setLoading(true);
        setError(null);

        console.log("CREATE ADDRESS PAYLOAD:", payload);

        const response = await addressApi.createAddress(payload);

        console.log("CREATE ADDRESS RESPONSE:", response);

        const newAddress = response?.data?.data ?? null;

        if (newAddress) {
          setAddresses((prev) => [
            newAddress,
            ...prev.filter((address) => address.id !== newAddress.id),
          ]);

          setSelectedAddress(newAddress);
        }

        return newAddress;
      } catch (err) {
        console.error("Failed to create address:", err);

        setError(getErrorMessage(err));

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getErrorMessage],
  );

  // ============================================================
  // UPDATE ADDRESS
  // ============================================================

  const updateAddress = useCallback(
    async (addressId, payload) => {
      try {
        setLoading(true);
        setError(null);

        console.log("UPDATE ADDRESS:", addressId, payload);

        const response = await addressApi.updateAddress(addressId, payload);

        console.log("UPDATE ADDRESS RESPONSE:", response);

        const updatedAddress = response?.data?.data ?? null;

        if (updatedAddress) {
          setAddresses((prev) =>
            prev.map((address) =>
              address.id === updatedAddress.id ? updatedAddress : address,
            ),
          );

          setSelectedAddress(updatedAddress);
        }

        return updatedAddress;
      } catch (err) {
        console.error("Failed to update address:", err);

        setError(getErrorMessage(err));

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getErrorMessage],
  );

  // ============================================================
  // DELETE ADDRESS
  // ============================================================

  const deleteAddress = useCallback(
    async (addressId) => {
      try {
        setLoading(true);
        setError(null);

        await addressApi.deleteAddress(addressId);

        setAddresses((prev) =>
          prev.filter((address) => address.id !== addressId),
        );

        if (selectedAddress?.id === addressId) {
          setSelectedAddress(null);
        }

        return true;
      } catch (err) {
        console.error("Failed to delete address:", err);

        setError(getErrorMessage(err));

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getErrorMessage, selectedAddress],
  );

  // ============================================================
  // SET DEFAULT ADDRESS
  // ============================================================

  const setDefaultAddress = useCallback(
    async (addressId) => {
      try {
        setLoading(true);
        setError(null);

        const response = await addressApi.setDefaultAddress(addressId);

        const defaultAddress = response?.data?.data ?? null;

        if (defaultAddress) {
          setAddresses((prev) =>
            prev.map((address) => ({
              ...address,
              is_default: address.id === defaultAddress.id,
            })),
          );

          setSelectedAddress(defaultAddress);
        }

        return defaultAddress;
      } catch (err) {
        console.error("Failed to set default address:", err);

        setError(getErrorMessage(err));

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getErrorMessage],
  );

  // ============================================================
  // CLEAR ERROR
  // ============================================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ============================================================
  // DEFAULT ADDRESS
  // ============================================================

  const defaultAddress =
    addresses.find((address) => address.is_default === true) ?? null;

  // ============================================================
  // RETURN
  // ============================================================

  return {
    addresses,
    selectedAddress,
    defaultAddress,

    loading,
    error,

    getAddresses,
    getAddress,

    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,

    clearError,
  };
}
