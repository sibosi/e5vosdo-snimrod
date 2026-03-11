import ElectionsInstagramFeed from "@/components/events/ElectionsInstagramFeed";
import { getAuth } from "@/db/dbreq";
import { hasPermission } from "@/db/permissions";

export default function ElectionsPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-2 pb-6">
      <ElectionsInstagramFeed />
    </main>
  );
}
