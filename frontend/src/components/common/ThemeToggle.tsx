import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
    >
      {dark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
