export const storage = {
  getItem: async (k: string) => (typeof window === "undefined" ? null : window.localStorage.getItem(k)),
  setItem: async (k: string, v: string) => window.localStorage.setItem(k, v),
  removeItem: async (k: string) => window.localStorage.removeItem(k),
};
