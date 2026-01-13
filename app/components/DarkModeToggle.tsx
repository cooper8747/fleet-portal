"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export default function DarkModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      aria-label="Toggle Dark Mode"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
    >
      {theme === "dark" ? (
        <Sun size={22} className="text-yellow-300" />
      ) : (
        <Moon size={22} className="text-blue-900" />
      )}
    </button>
  );
}
