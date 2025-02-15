import { Events } from "@/components/events";

export default function EventsPage() {
  return (
    <>
      <h1 className="pb-8 text-center text-4xl font-semibold text-foreground lg:text-5xl">
        Események
      </h1>
      <Events all={true} />
    </>
  );
}
