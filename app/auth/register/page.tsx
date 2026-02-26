"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { toast } from "sonner";

import { authApi } from "@/lib/api";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

const registerSchema = z
  .object({
    username: z.string().min(3, "Username is required"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6),
    termsAccepted: z.boolean().refine((value) => value, "Please accept the terms"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data, variables) => {
      toast.success("Registration successful. Verify OTP from your email.");
      router.push(`/auth/verify-email?email=${encodeURIComponent(data?.email || variables.email)}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Registration failed");
    },
  });

  const onSubmit = (values: RegisterFormValues) => {
    registerMutation.mutate({
      username: values.username,
      email: values.email,
      password: values.password,
      termsAccepted: values.termsAccepted,
    });
  };

  return (
    <AuthSplitLayout
      reverse
      side={
        <>
          <h1 className="fs-pop-60-bold text-[#070910]">Hello, Welcome!</h1>
          <p className="fs-pop-40-semibold mt-6 text-[#242733]">Enter your personal details to use all of site features</p>
          <Button className="font-poppins mt-8 h-12 min-w-52 rounded-xl border border-[#2DAA46] bg-transparent text-[20px] leading-[120%] font-medium text-[#2DAA46] hover:bg-[#eaf7ee]" asChild>
            <Link href="/auth/login">Login</Link>
          </Button>
        </>
      }
    >
      <div className="w-full max-w-[470px] space-y-5">
        <h2 className="fs-pop-60-bold text-center text-[#090B12]">Registration</h2>

        <div className="flex justify-center gap-4">
          <button className="font-poppins size-14 rounded-2xl bg-[#E5EFE4] text-[28px] leading-[120%] font-medium" type="button" aria-label="Google register">
            G
          </button>
          <button className="font-poppins size-14 rounded-2xl bg-[#E5EFE4] text-[28px] leading-[120%] font-medium" type="button" aria-label="Apple register">
            
          </button>
        </div>

        <p className="fs-pop-20-medium-center text-[#2F323A]">or use your email for registration</p>

        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <Input placeholder="Username" {...form.register("username")} className="fs-pop-16-regular h-14" />
            {form.formState.errors.username ? (
              <p className="mt-1 text-sm text-[#EA4335]">{form.formState.errors.username.message}</p>
            ) : null}
          </div>

          <div>
            <div className="relative">
              <Input placeholder="Email" {...form.register("email")} className="fs-pop-16-regular h-14 pr-12" />
              <Mail className="pointer-events-none absolute top-1/2 right-4 size-6 -translate-y-1/2 text-[#6F7584]" />
            </div>
            {form.formState.errors.email ? (
              <p className="mt-1 text-sm text-[#EA4335]">{form.formState.errors.email.message}</p>
            ) : null}
          </div>

          <div>
            <PasswordInput placeholder="Password" className="h-14" inputClassName="fs-pop-16-regular h-14" {...form.register("password")} />
            {form.formState.errors.password ? (
              <p className="mt-1 text-sm text-[#EA4335]">{form.formState.errors.password.message}</p>
            ) : null}
          </div>

          <div>
            <PasswordInput
                placeholder="Confirm Password"
                className="h-14"
                inputClassName="fs-pop-16-regular h-14"
                {...form.register("confirmPassword")}
              />
            {form.formState.errors.confirmPassword ? (
              <p className="mt-1 text-sm text-[#EA4335]">{form.formState.errors.confirmPassword.message}</p>
            ) : null}
          </div>

          <label className="fs-pop-16-regular flex items-center gap-3 text-[#4A5162]">
            <Controller
              control={form.control}
              name="termsAccepted"
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                />
              )}
            />
            I agree to the <span className="font-semibold text-[#2DAA46]">Terms & Condition</span>
          </label>
          {form.formState.errors.termsAccepted ? (
            <p className="-mt-2 text-sm text-[#EA4335]">{form.formState.errors.termsAccepted.message}</p>
          ) : null}

          <Button type="submit" className="font-poppins h-14 w-full text-[20px] leading-[120%] font-medium" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? "Registering..." : "Register"}
          </Button>

          <p className="fs-pop-16-regular text-center text-[#5D6473]">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-[#2DAA46] hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </AuthSplitLayout>
  );
}
