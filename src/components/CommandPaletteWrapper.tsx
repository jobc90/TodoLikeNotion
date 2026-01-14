import { getPages } from "@/actions/page.actions";
import { getDatabases } from "@/actions/database.actions";
import CommandPalette from "./CommandPalette";

export default async function CommandPaletteWrapper() {
  const [pages, databases] = await Promise.all([
    getPages(),
    getDatabases(),
  ]);

  return <CommandPalette pages={pages} databases={databases} />;
}
