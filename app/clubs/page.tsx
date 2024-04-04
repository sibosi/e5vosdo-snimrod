import { title } from "@/components/primitives";
import clsx from "clsx";
import { link as linkStyles } from "@nextui-org/theme";

export default function ClubsPage() {
  return (
    <div>
      <h1
        className={clsx(
          title(),
          linkStyles({ color: "foreground", isBlock: true })
        )}
      >
        Klubok
      </h1>
    </div>
  );
}
