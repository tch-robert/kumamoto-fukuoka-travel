export const useUser = () => {
  const roleName = useState<string | null>("roleName", () => null);
  const isInitialized = useState("isInitialized", () => false);

  const initUser = () => {
    if (import.meta.client) {
      const storedName = localStorage.getItem("travel_role_name");
      if (storedName) {
        roleName.value = storedName;
      }
      isInitialized.value = true;
    }
  };

  const setUser = (name: string) => {
    const trimmed = name.trim();
    if (trimmed && import.meta.client) {
      localStorage.setItem("travel_role_name", trimmed);
      roleName.value = trimmed;
    }
  };

  const logout = () => {
    if (import.meta.client) {
      localStorage.removeItem("travel_role_name");
      roleName.value = null;
    }
  };

  return {
    roleName,
    isInitialized,
    initUser,
    setUser,
    logout,
  };
};
