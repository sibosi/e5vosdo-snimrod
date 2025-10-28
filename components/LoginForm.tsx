import { doSocialLogin } from "@/actions/route";
import { Button, Link } from "@heroui/react";
import React from "react";
import resetCache from "./PWA/resetCache";
import { checkMessengerBrowser, RedirectUrlButton } from "@/app/skipMessenger";
import { siteConfig } from "@/config/site";

const Login = () => {
  if (checkMessengerBrowser())
    return (
      <Link href={siteConfig.links.home + "/support/messenger"}>
        <RedirectUrlButton
          url={siteConfig.links.home + "/support/messenger"}
          text="Bejelentkezés"
          props={{ className: "bg-selfprimary-300" }}
        />
      </Link>
    );

  return (
    <form action={doSocialLogin} className="flex justify-center">
      <Button
        type="submit"
        name="action"
        value="google"
        size="sm"
        onPress={resetCache}
        className="rounded-badge w-full max-w-md bg-selfprimary-300"
      >
        Bejelentkezés
      </Button>
    </form>
  );
};

export default Login;
