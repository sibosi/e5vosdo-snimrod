import { doSocialLogin } from "@/actions/route";
import { Button, Link } from "@nextui-org/react";
import React from "react";
import resetCache from "./PWA/resetCache";
import { checkMessengerBrowser, RedirectUrlButton } from "@/app/skipMessenger";
import { siteConfig } from "@/config/site";

const Login = () => {
  return !checkMessengerBrowser() ? (
    <form action={doSocialLogin}>
      <Button
        type="submit"
        name="action"
        value="google"
        size="sm"
        onPress={resetCache}
        className="w-full rounded-badge bg-selfprimary-300"
      >
        Bejelentkezés
      </Button>
    </form>
  ) : (
    <Link href={siteConfig.links.home + "/support/messenger"}>
      <RedirectUrlButton
        url={siteConfig.links.home + "/support/messenger"}
        text="Bejelentkezés"
        props={{ className: "bg-selfprimary-300" }}
      />
    </Link>
  );
};

export default Login;
