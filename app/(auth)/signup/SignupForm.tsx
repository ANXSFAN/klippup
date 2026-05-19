"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { signUpWithPassword, startGoogleOAuth } from "../actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";

const schema = z.object({
  role: z.enum(["CREATOR", "BRAND"]),
  displayName: z.string().min(1, "Obligatorio"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mín. 8")
});
type Values = z.infer<typeof schema>;

export default function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const nextParam = params.get("next");
  const isSafeNext = !!nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//");
  const next = isSafeNext ? nextParam! : "/post-login";
  const t = useTranslations("auth");
  const [pending, startTransition] = useTransition();
  const [oauthLoading, setOauthLoading] = useState(false);

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: "CREATOR" as const, displayName: "", email: "", password: "" }
  });
  const role = watch("role");

  const onSubmit = (values: Values) =>
    startTransition(async () => {
      const res = await signUpWithPassword(values);
      if (!res.ok) {
        toast.error(t("signup.error"));
        return;
      }
      toast.success(t("signup.created"));
      router.push(next);
      router.refresh();
    });

  const onGoogle = async () => {
    setOauthLoading(true);
    const res = await startGoogleOAuth({
      role,
      next: isSafeNext ? nextParam : undefined
    });
    if (!res.ok) {
      setOauthLoading(false);
      toast.error(t("signup.error"));
      return;
    }
    window.location.href = res.url;
  };

  const roleButtons: { value: "CREATOR" | "BRAND"; label: string; sub: string }[] = [
    { value: "CREATOR", label: t("roleCreator"), sub: t("roleCreatorDesc") },
    { value: "BRAND", label: t("roleBrand"), sub: t("roleBrandDesc") }
  ];

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {roleButtons.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setValue("role", r.value, { shouldValidate: true })}
              className={`text-left rounded-lg border px-3 py-2 transition ${
                role === r.value
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border hover:bg-secondary"
              }`}
            >
              <div className="text-sm font-medium">{r.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{r.sub}</div>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("role")} />
          <div className="space-y-1.5">
            <Label htmlFor="displayName">
              {role === "BRAND" ? t("fields.brandName") : t("fields.displayName")}
            </Label>
            <Input id="displayName" autoComplete="name" {...register("displayName")} />
            {errors.displayName && (
              <p className="text-xs text-destructive">{errors.displayName.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">{t("fields.email")}</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">{t("fields.password")}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? t("signup.submitting") : t("signup.submit")}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">{t("or")}</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onGoogle}
          disabled={oauthLoading}
        >
          {oauthLoading ? t("signup.submitting") : t("google")}
        </Button>
      </CardContent>
    </Card>
  );
}
