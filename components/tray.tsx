export default function Tray({
  title,
  children,
  colorVariant,
}: Readonly<{
  title?: string;
  children: React.ReactNode;
  colorVariant?: "light" | "medium" | "dark";
}>) {
  const getColorVariantClass = () => {
    if (colorVariant === "light") return "bg-selfprimary-50";
    if (colorVariant === "medium") return "bg-selfprimary-100";
    if (colorVariant === "dark") return "bg-selfprimary-200";
    return "bg-selfprimary-100";
  };

  return (
    <div className="my-5">
      <div className={"mx-1 rounded-2xl p-3 " + getColorVariantClass()}>
        {title && (
          <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        )}
        <div className="my-2">{children}</div>
      </div>
    </div>
  );
}
