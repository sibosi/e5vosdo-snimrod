import { redirect } from "next/navigation";
import { getAuth } from "@/db/dbreq";
import CameraAdmin from "@/components/camera/CameraAdmin";

export default async function CameraPage() {
  const selfUser = await getAuth();

  if (!selfUser) {
    redirect("/");
  }

  if (!selfUser.permissions.includes("admin")) {
    redirect("/");
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="mb-2 text-center text-3xl font-bold">Kamera Modul</h1>
        <p className="text-center text-gray-600 dark:text-gray-400">
          Készítsd el és oszd meg az események pillanatait
        </p>
      </div>

      <CameraAdmin />
    </div>
  );
}
