"use client";

import { useTheme } from "../components/ThemeProvider";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      onClick={toggleTheme}
      variant="outline"
      size="icon"
      className="absolute top-2 right-2 transition-colors duration-300"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="h-[1.2rem] w-[1.2rem] transition-transform duration-300 rotate-0 scale-100" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem] transition-transform duration-300 rotate-180 scale-100" />
      )}
    </Button>
  );
}
