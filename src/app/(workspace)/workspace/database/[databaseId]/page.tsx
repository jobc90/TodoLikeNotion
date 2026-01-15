import { notFound } from "next/navigation";
import { getDatabase, getDatabases } from "@/actions/database.actions";
import { getPages } from "@/actions/page.actions";
import WorkspaceLayout from "@/components/layout/WorkspaceLayout";
import DatabaseView from "@/components/database/DatabaseView";

export const dynamic = "force-dynamic";

interface DatabasePageProps {
  params: Promise<{ databaseId: string }>;
}

export default async function DatabasePage({ params }: DatabasePageProps) {
  const { databaseId } = await params;
  const [database, databases, pages] = await Promise.all([
    getDatabase(databaseId),
    getDatabases(),
    getPages(),
  ]);

  if (!database) {
    notFound();
  }

  return (
    <WorkspaceLayout pages={pages} databases={databases}>
      <DatabaseView database={database} />
    </WorkspaceLayout>
  );
}
