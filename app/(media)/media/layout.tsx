export default function RawLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>; // no wrappers, no header/footer
}
