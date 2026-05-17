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
      avatarUrl: localStorage.getItem("avatarUrl") || "",
    };
  });

  const saveUser = (data, fallbackName) => {
    const newUser = {
      token: data.token,
      role: data.role,
      name: data.name || fallbackName,
      avatarUrl: data.avatarUrl || "",
    };

    localStorage.setItem("token", newUser.token);
    localStorage.setItem("role", newUser.role);
    localStorage.setItem("name", newUser.name);
    localStorage.setItem("avatarUrl", newUser.avatarUrl);

    setUser(newUser);

    return newUser;
  };

  const login = async (username, password) => {
    const res = await api.post("/auth/login", {
      username,
      password,
    });

    const data = res.data;

    if (data.requires2FA === true || data.requires2FA === "true") {
      return data;
    }

    return saveUser(data, username);
  };

  const verify2faLogin = async (username, code) => {
    const res = await api.post("/auth/2fa/verify-login", {
      username,
      code,
    });

    return saveUser(res.data, username);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("avatarUrl");

    setUser(null);

    navigate("/login", { replace: true });
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    
    if (updates.name !== undefined) localStorage.setItem("name", updates.name);
    if (updates.avatarUrl !== undefined) localStorage.setItem("avatarUrl", updates.avatarUrl);
  };

  return (
    <AuthContext.Provider value={{ user, login, verify2faLogin, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
