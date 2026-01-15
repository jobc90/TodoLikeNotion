import AdminLayout from "@/components/layout/AdminLayout";
import KeyboardShortcutsProvider from "@/components/KeyboardShortcutsProvider";
import CommandPaletteWrapper from "@/components/CommandPaletteWrapper";

export default function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <KeyboardShortcutsProvider>
      <AdminLayout>
        {children}
      </AdminLayout>
    </KeyboardShortcutsProvider>
  );
}
