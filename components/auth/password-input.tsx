"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PasswordInputProps extends Omit<React.ComponentProps<typeof Input>, "type"> {
  inputClassName?: string;
}

export function PasswordInput({ className, inputClassName, ...props }: PasswordInputProps) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className={cn("relative", className)}>
      <Input type={visible ? "text" : "password"} className={cn("pr-11", inputClassName)} {...props} />
      <button
        type="button"
        className="absolute top-1/2 right-3 -translate-y-1/2 text-[#6F7687] transition hover:text-[#2A2F37]"
        onClick={() => setVisible((state) => !state)}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
      </button>
    </div>
  );
}
