import { type JSX } from "react";

export function Code({
  children,
  className,
}: Readonly<{
  children: React.ReactNode;
  className?: string;
}>): JSX.Element {
  return <code className={className}>{children}</code>;
}
