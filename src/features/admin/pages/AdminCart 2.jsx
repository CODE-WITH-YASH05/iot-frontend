import React from "react";

import useAdminCart from "../hooks/useAdminCart";

export default function AdminCart() {
  const {
    carts,
    loading,
    error,
    cartCount,
    totalItems,
    totalValue,
    refresh,
    deleteCart,
    clearCart,
    actionLoading,
  } = useAdminCart();

  if (loading) {
    return <div className="p-8">Loading carts...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Customer Carts</h1>

      {/* ================================================== */}
      {/* STATS */}
      {/* ================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow">
          <p className="text-sm text-gray-500">Total Carts</p>

          <h2 className="text-2xl font-bold">{cartCount}</h2>
        </div>

        <div className="bg-white rounded-xl p-5 shadow">
          <p className="text-sm text-gray-500">Total Items</p>

          <h2 className="text-2xl font-bold">{totalItems}</h2>
        </div>

        <div className="bg-white rounded-xl p-5 shadow">
          <p className="text-sm text-gray-500">Cart Value</p>

          <h2 className="text-2xl font-bold">
            ₹{totalValue.toLocaleString("en-IN")}
          </h2>
        </div>
      </div>

      {/* ================================================== */}
      {/* ERROR */}
      {/* ================================================== */}

      {error && (
        <div className="mb-5 p-4 bg-red-50 text-red-600 rounded-xl">
          {error}
        </div>
      )}

      {/* ================================================== */}
      {/* REFRESH */}
      {/* ================================================== */}

      <button
        onClick={refresh}
        disabled={loading}
        className="mb-5 px-5 py-2 bg-indigo-600 text-white rounded-lg"
      >
        Refresh
      </button>

      {/* ================================================== */}
      {/* CART LIST */}
      {/* ================================================== */}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">User</th>

                <th className="p-4 text-left">Items</th>

                <th className="p-4 text-left">Quantity</th>

                <th className="p-4 text-left">Subtotal</th>

                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {carts.map((cart) => (
                <tr key={cart.id} className="border-t">
                  <td className="p-4">
                    <p className="font-semibold">{cart.user_name}</p>

                    <p className="text-sm text-gray-500">{cart.user_email}</p>
                  </td>

                  <td className="p-4">{cart.item_count}</td>

                  <td className="p-4">{cart.total_quantity}</td>

                  <td className="p-4 font-semibold">
                    ₹{Number(cart.subtotal || 0).toLocaleString("en-IN")}
                  </td>

                  <td className="p-4">
                    <button
                      disabled={actionLoading}
                      onClick={() => clearCart(cart.id)}
                      className="mr-2 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg"
                    >
                      Clear
                    </button>

                    <button
                      disabled={actionLoading}
                      onClick={() => deleteCart(cart.id)}
                      className="px-3 py-2 bg-red-100 text-red-600 rounded-lg"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
