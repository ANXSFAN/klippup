"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { signInWithPassword, startGoogleOAuth } from "../actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Obligatorio")
});
type Values = z.infer<typeof schema>;

export default function LoginForm() {
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
    handleSubmit,
    formState: { errors }
  } = useForm({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  const onSubmit = (values: Values) =>
    startTransition(async () => {
      const res = await signInWithPassword(values);
      if (!res.ok) {
        toast.error(t("login.error"));
        return;
      }
      router.push(next);
      router.refresh();
    });

  const onGoogle = async () => {
    setOauthLoading(true);
    const res = await startGoogleOAuth({
      role: "CREATOR",
      next: isSafeNext ? nextParam : undefined
    });
    if (!res.ok) {
      setOauthLoading(false);
      toast.error(t("login.error"));
      return;
    }
    window.location.href = res.url;
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? t("login.submitting") : t("login.submit")}
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
          {oauthLoading ? t("login.submitting") : t("google")}
        </Button>
      </CardContent>
    </Card>
  );
}
