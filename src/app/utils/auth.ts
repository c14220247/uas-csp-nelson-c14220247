export const setSession = (user: any) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const getSession = () => {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const clearSession = () => {
  localStorage.removeItem("user");
};
