import { useCallback, useEffect, useState } from "react";
import { applyTheme, readTheme } from "./store";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const t = readTheme();
    setTheme(t);
    applyTheme(t);
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      applyTheme(next);
      return next;
    });
  }, []);

  const set = useCallback((next: "light" | "dark") => {
    applyTheme(next);
    setTheme(next);
  }, []);

  return { theme, toggle, set };
}
