import KeyboardShortcutsProvider from "@/components/KeyboardShortcutsProvider";
import CommandPaletteWrapper from "@/components/CommandPaletteWrapper";

export default function WorkspaceGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <KeyboardShortcutsProvider>
      {children}
      <CommandPaletteWrapper />
    </KeyboardShortcutsProvider>
  );
}
