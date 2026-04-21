import BimunGallery from "./BimunGallery";
import { auth } from "@/auth";
import { cookies } from "next/headers";
import {
  BIMUN_COOKIE_NAME,
  verifyBimunSession,
} from "@/lib/bimunAuth";
import { redirect } from "next/navigation";

const BIMUN_SKIP_AUTH = process.env.BIMUN_SKIP_AUTH === "true";

export const metadata = {
  title: "BIMUN 2026 - Gallery",
  description: "BIMUN 2026 photo gallery",
};

interface BimunPageProps {
  searchParams?: Promise<{
    trustedToken?: string | string[];
  }>;
}

const BimunPage = async ({ searchParams }: BimunPageProps) => {
  if (BIMUN_SKIP_AUTH) {
    return <BimunGallery initialAuthenticated skipAuth />;
  }

  const resolvedSearchParams = await searchParams;
  const trustedToken = Array.isArray(resolvedSearchParams?.trustedToken)
    ? resolvedSearchParams.trustedToken[0]
    : resolvedSearchParams?.trustedToken;

  // If a trusted token is provided, redirect to the API route to set the cookie
  if (trustedToken) {
    redirect(`/api/auth/bimun/trusted?token=${trustedToken}`);
  }

  // Check for existing session (either from trusted token cookie or regular auth)
  const cookieStore = await cookies();
  const bimunCookie = cookieStore.get(BIMUN_COOKIE_NAME)?.value;
  const hasBimunSession = bimunCookie
    ? verifyBimunSession(bimunCookie)
    : false;

  const session = await auth();
  const hasRegularSession = Boolean(session?.user?.email);

  const initialAuthenticated = hasBimunSession || hasRegularSession;

  return (
    <BimunGallery
      initialAuthenticated={initialAuthenticated}
      skipAuth={BIMUN_SKIP_AUTH}
    />
  );
};

export default BimunPage;
