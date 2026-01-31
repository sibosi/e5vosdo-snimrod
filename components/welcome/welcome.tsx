import LoginButton from "../LoginButton";
import Tray from "../tray";

export default function Welcome() {
  return (
    <Tray className="mx-auto max-w-md">
      <h1 className="mb-2 text-3xl font-bold text-selfprimary-900 md:text-4xl">
        Hiányolsz valamit? <br />
        Netán a híreket? <br />
        <span className="bg-linear-to-r from-selfprimary-900 to-selfsecondary-300 bg-clip-text text-transparent">
          Vagy az órarendedet?
        </span>
      </h1>
      <LoginButton />
    </Tray>
  );
}
