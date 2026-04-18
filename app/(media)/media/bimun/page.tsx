import BimunGallery from "./BimunGallery";
import { auth } from "@/auth";
import { cookies } from "next/headers";
import {
  BIMUN_COOKIE_NAME,
  BIMUN_COOKIE_MAX_AGE,
  generateBimunToken,
  verifyBimunTrustedToken,
} from "@/lib/bimunAuth";

export const metadata = {
  title: "BIMUN 2026 - Galéria",
  description: "BIMUN 2026 fotógaléria",
};

interface BimunPageProps {
  searchParams?: Promise<{
    trustedToken?: string | string[];
  }>;
}

const BimunPage = async ({ searchParams }: BimunPageProps) => {
  const resolvedSearchParams = await searchParams;
  const trustedToken = Array.isArray(resolvedSearchParams?.trustedToken)
    ? resolvedSearchParams.trustedToken[0]
    : resolvedSearchParams?.trustedToken;

  let initialAuthenticated = false;

  if (verifyBimunTrustedToken(trustedToken)) {
    const cookieStore = await cookies();
    const token = generateBimunToken();

    cookieStore.set(BIMUN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: BIMUN_COOKIE_MAX_AGE,
      path: "/",
    });

    initialAuthenticated = true;
  } else {
    const session = await auth();
    initialAuthenticated = Boolean(session?.user?.email);
  }

  return <BimunGallery initialAuthenticated={initialAuthenticated} />;
};

export default BimunPage;
