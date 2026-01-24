import { useGlobalKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

export function KeyboardShortcutsProvider() {
  useGlobalKeyboardShortcuts();
  return null;
}
