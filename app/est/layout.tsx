export default function E5PodcastLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="pt-4 md:pt-10">
      <div className="p-1 text-foreground">{children}</div>
    </section>
  );
}
