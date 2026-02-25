import ElectionsInstagramFeed from "@/components/events/ElectionsInstagramFeed";
import { getAuth } from "@/db/dbreq";
import { hasPermission } from "@/db/permissions";

export default async function ElectionsPage() {
  const selfUser = await getAuth();
  if (hasPermission(selfUser, "tester")) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-2 pb-6">
        <ElectionsInstagramFeed />
      </main>
    );
  } else {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-2 pb-6">
        <div className="rounded-xl border border-divider bg-content1 p-5 text-sm text-foreground-600">
          Nem vagy jogosult megtekinteni ezt a tartalmat.
        </div>
      </main>
    );
  }
}
