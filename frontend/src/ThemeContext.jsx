import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("darkMode");
    return stored === null ? false : stored === "true";
  });

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    document.body.style.transition = "background-color 0.5s, color 0.5s";
    if (darkMode) {
      document.body.style.backgroundColor = "#0b0c17";
      document.body.style.color = "#f9fafb";
    } else {
      document.body.style.backgroundColor = "#f9fafb";
      document.body.style.color = "#1f2937";
    }
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
