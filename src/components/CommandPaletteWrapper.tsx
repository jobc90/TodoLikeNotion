import { getPages } from "@/actions/page.actions";
import { getDatabases } from "@/actions/database.actions";
import CommandPalette from "./CommandPalette";

export default async function CommandPaletteWrapper() {
  let pages: Awaited<ReturnType<typeof getPages>> = [];
  let databases: Awaited<ReturnType<typeof getDatabases>> = [];

  try {
    [pages, databases] = await Promise.all([
      getPages(),
      getDatabases(),
    ]);
  } catch {
    // DB 연결 실패 시 빈 배열로 폴백 (빌드 시점)
  }

  return <CommandPalette pages={pages} databases={databases} />;
}
