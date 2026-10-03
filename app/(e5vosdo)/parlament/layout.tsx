export default function ParliamentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <section className="px-1 md:pt-4">{children}</section>;
}
