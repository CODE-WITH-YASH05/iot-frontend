import publicClient from "../../../api/client";

// ==========================================================
// BASE URL
// ==========================================================

const HOME_BASE = "/api/v1/home";

// ==========================================================
// HOME PUBLIC API
// ==========================================================

export const homeApi = {
  /**
   * Public home page configuration.
   * GET /api/v1/home/home-config/
   */
  getHomeConfig() {
    return publicClient.get(`${HOME_BASE}/home-config/`); // Changed from "/" to "/home-config/"
  },
};

export default homeApi;
