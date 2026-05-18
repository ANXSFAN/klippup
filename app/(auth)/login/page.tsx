import { getTranslations } from "next-intl/server";
import Link from "next/link";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const t = await getTranslations("auth");
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{t("login.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("login.subtitle")}</p>
      </div>
      <LoginForm />
      <p className="text-center text-sm text-muted-foreground">
        {t("login.noAccount")}{" "}
        <Link href="/signup" className="font-medium text-foreground underline-offset-4 hover:underline">
          {t("login.signupLink")}
        </Link>
      </p>
    </div>
  );
}
