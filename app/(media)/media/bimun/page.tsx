import BimunGallery from "./BimunGallery";
import { auth } from "@/auth";

export const metadata = {
  title: "BIMUN 2026 - Galéria",
  description: "BIMUN 2026 fotógaléria",
};

const BimunPage = async () => {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user?.email);
  return <BimunGallery initialAuthenticated={isLoggedIn} />;
};

export default BimunPage;
