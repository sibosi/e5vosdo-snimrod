import { Events } from "@/components/events";

export default function EventsPage() {
  return (
    <>
      <h1 className="pb-8 text-4xl lg:text-5xl font-semibold text-foreground text-center">
        Események
      </h1>
      <Events />
    </>
  );
}
