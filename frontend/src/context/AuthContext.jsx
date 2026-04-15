import { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");

    if (!token) return null;

    return {
      token,
      role: localStorage.getItem("role"),
      name: localStorage.getItem("name"),
    };
  });

  const login = async (username, password) => {
    const res = await api.post("/auth/login", {
      username,
      password,
    });

    const data = res.data;

    const newUser = {
      token: data.token,
      role: data.role,
      name: data.name || username,
    };

    localStorage.setItem("token", newUser.token);
    localStorage.setItem("role", newUser.role);
    localStorage.setItem("name", newUser.name);

    setUser(newUser);

    return newUser;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");

    setUser(null);

    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);