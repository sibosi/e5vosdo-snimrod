import Login from "@/components/LoginForm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import LogOut from "@/components/LogOut";
import { siteConfig } from "@/config/site";
import { getUsers } from "@/db/dbreq";

const AboutPage = async () => {
  const session = await auth();
  if (!session?.user) redirect("/");

  return (
    <>
      <h1 className="pb-8 text-4xl lg:text-5xl font-semibold text-foreground text-center">
        🚧 About 🚧
      </h1>
      <h1>{session?.user.name}</h1>
      <div>
        {session?.user?.image && session?.user?.name && (
          <Image
            src={session?.user?.image}
            alt={session?.user?.name}
            width={72}
            height={72}
            className="rounded-full"
          />
        )}
      </div>
      <LogOut />

      {session?.user?.email == siteConfig.admin ? (
        await getUsers().then((users) =>
          (users as any).map((user: any) => (
            <div key={user.id}>
              <br />
              <Image
                src={user.image}
                alt={user.username}
                width={72}
                height={72}
                className="rounded-full"
              />
              <h1 className="text-foreground">{user.username}</h1>
              <p>{user.email}</p>
              <p>{String(user.last_login)}</p>
            </div>
          ))
        )
      ) : (
        <></>
      )}
    </>
  );
};

export default AboutPage;
