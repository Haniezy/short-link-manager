import type { ComponentProps } from "react";
import { Button } from "./button";

export function GlassButton({ className = "", ...props }: ComponentProps<typeof Button>) {
  return <Button {...props} className={`purple-button ${className}`} />;
}
