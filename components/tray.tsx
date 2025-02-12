export default function Tray({
  title,
  children,
  colorVariant,
  padding = true,
  className,
}: Readonly<{
  title?: string;
  children: React.ReactNode;
  colorVariant?: "light" | "medium" | "dark";
  padding?: boolean;
  className?: string;
}>) {
  const getColorVariantClass = () => {
    if (colorVariant === "light") return "bg-selfprimary-50";
    if (colorVariant === "medium") return "bg-selfprimary-100";
    if (colorVariant === "dark") return "bg-selfprimary-200";
    return "bg-selfprimary-100";
  };

  className += " my-2";

  return (
    <div
      className={
        "mx-1 rounded-2xl " + getColorVariantClass() + (padding ? " p-3" : "")
      }
    >
      {title && (
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
      )}
      <div className={className}>{children}</div>
    </div>
  );
}
