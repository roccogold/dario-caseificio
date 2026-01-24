import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs, textareas, or contenteditable
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrlKey ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shiftKey === undefined ? true : event.shiftKey === shortcut.shiftKey;
        const altMatch = shortcut.altKey === undefined ? true : event.altKey === shortcut.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}

// Global keyboard shortcuts hook
export function useGlobalKeyboardShortcuts() {
  const navigate = useNavigate();

  useKeyboardShortcuts([
    {
      key: "1",
      ctrlKey: true,
      action: () => navigate("/calendario"),
      description: "Vai al Calendario",
    },
    {
      key: "2",
      ctrlKey: true,
      action: () => navigate("/produzioni"),
      description: "Vai alle Produzioni",
    },
    {
      key: "3",
      ctrlKey: true,
      action: () => navigate("/formaggi"),
      description: "Vai ai Formaggi",
    },
    {
      key: "4",
      ctrlKey: true,
      action: () => navigate("/statistiche"),
      description: "Vai alle Statistiche",
    },
    {
      key: "h",
      ctrlKey: true,
      action: () => navigate("/"),
      description: "Vai alla Dashboard",
    },
  ]);
}
