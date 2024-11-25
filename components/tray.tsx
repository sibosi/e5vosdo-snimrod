export default function Tray({
  title,
  children,
}: Readonly<{
  title: string;
  children: React.ReactNode;
}>) {
  return (
    <div className="my-5">
      <div className="mx-1 rounded-2xl bg-selfprimary-100 bg-gradient-to-r p-3">
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        <div className="my-2">{children}</div>
      </div>
    </div>
  );
}
