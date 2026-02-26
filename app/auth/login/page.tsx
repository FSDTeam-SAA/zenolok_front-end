"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { signIn } from "next-auth/react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserRound } from "lucide-react";
import { toast } from "sonner";

import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (!result || result.error) {
        throw new Error(result?.error ?? "Unable to login");
      }

      return result;
    },
    onSuccess: () => {
      toast.success("Logged in successfully");
      router.push("/home");
      router.refresh();
    },
    onError: (error: Error) => {
      if (error.message.toLowerCase().includes("not verified")) {
        const email = form.getValues("email");
        if (email) {
          toast.error("Your account is not verified. Please verify your email.");
          router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
          return;
        }
      }

      toast.error(error.message || "Login failed");
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  return (
    <AuthSplitLayout
      side={
        <>
          <h1 className="fs-pop-60-bold text-[#070910]">Welcome Back!</h1>
          <p className="fs-pop-40-semibold mt-7 text-[#242733]">To keep connected with us please login with your personal info</p>
        </>
      }
    >
      <div className="w-full max-w-[470px] space-y-6">
        <h2 className="fs-pop-60-bold text-center text-[#090B12]">Login</h2>

        <div className="flex justify-center gap-4">
          <button className="font-poppins size-14 rounded-2xl bg-[#E5EFE4] text-[28px] leading-[120%] font-medium" type="button" aria-label="Google login">
            G
          </button>
          <button className="font-poppins size-14 rounded-2xl bg-[#E5EFE4] text-[28px] leading-[120%] font-medium" type="button" aria-label="Apple login">
            
          </button>
        </div>

        <p className="fs-pop-20-medium-center text-[#2F323A]">or use your Username for login</p>

        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <div className="relative">
              <Input placeholder="Email Address" {...form.register("email")} className="fs-pop-16-regular h-14" />
              <UserRound className="pointer-events-none absolute top-1/2 right-4 size-6 -translate-y-1/2 text-[#6F7584]" />
            </div>
            {form.formState.errors.email ? (
              <p className="mt-1 text-sm text-[#EA4335]">{form.formState.errors.email.message}</p>
            ) : null}
          </div>

          <div>
            <Controller
              control={form.control}
              name="password"
              render={({ field }) => <PasswordInput placeholder="Password" className="h-14" inputClassName="fs-pop-16-regular h-14" {...field} />}
            />
            {form.formState.errors.password ? (
              <p className="mt-1 text-sm text-[#EA4335]">{form.formState.errors.password.message}</p>
            ) : null}
          </div>

          <Link className="fs-pop-14-regular-right block text-[#2F323A] hover:underline" href="/auth/forgot-password">
            Forget Password?
          </Link>

          <Button type="submit" className="font-poppins h-14 w-full text-[20px] leading-[120%] font-medium" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Logging in..." : "Login"}
          </Button>

          <p className="fs-pop-16-regular text-center text-[#5D6473]">
            New here?{" "}
            <Link href="/auth/register" className="font-semibold text-[#2DAA46] hover:underline">
              Create account
            </Link>
          </p>
        </form>
      </div>
    </AuthSplitLayout>
  );
}
