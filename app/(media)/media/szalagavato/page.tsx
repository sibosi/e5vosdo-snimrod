import SzalagavatoGallery from "./SzalagavatoGallery";
import { auth } from "@/auth";

export const metadata = {
  title: "Szalagavató 2025 - Galéria",
  description: "Szalagavató 2025 fotógaléria",
};

const SzalagavatoPage = async () => {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user?.email);
  return <SzalagavatoGallery initialAuthenticated={isLoggedIn} />;
};

export default SzalagavatoPage;
