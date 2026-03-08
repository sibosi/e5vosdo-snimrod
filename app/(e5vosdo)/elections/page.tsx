import ElectionsInstagramFeed from "@/components/events/ElectionsInstagramFeed";
import { getAuth } from "@/db/dbreq";
import { hasPermission } from "@/db/permissions";

export default async function ElectionsPage() {
  const selfUser = await getAuth();
  if (!hasPermission(selfUser, "tester")) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-2 py-6">
        <h1 className="text-3xl font-bold text-selfprimary-900 md:text-4xl">
          Valami keszul...
        </h1>
      </div>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-2 pb-6">
      <ElectionsInstagramFeed />
    </main>
  );
}
