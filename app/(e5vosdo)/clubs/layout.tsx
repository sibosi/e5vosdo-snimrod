export default function ClubsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="pt-8 md:pt-10">
      <div className="p-1">{children}</div>
    </section>
  );
}
