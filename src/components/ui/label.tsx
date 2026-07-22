"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

function Label({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={className}
      {...props}
    />
  );
}

export { Label };