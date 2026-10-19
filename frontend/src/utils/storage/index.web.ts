// Web preview: sessionStorage (cleared when the browser session ends) instead of persistent localStorage.
export const storage = {
  getItem: async (k: string) => (typeof window === "undefined" ? null : window.sessionStorage.getItem(k)),
  setItem: async (k: string, v: string) => window.sessionStorage.setItem(k, v),
  removeItem: async (k: string) => window.sessionStorage.removeItem(k),
};
