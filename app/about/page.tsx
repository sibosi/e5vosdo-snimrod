import { title } from "@/components/primitives";
import { link as linkStyles } from "@nextui-org/theme";
import clsx from "clsx";

export default function AboutPage() {
  return (
    <div>
      <h1
        className={clsx(
          title(),
          linkStyles({ color: "foreground", isBlock: true })
        )}
      >
        🚧 About 🚧
      </h1>
    </div>
  );
}
