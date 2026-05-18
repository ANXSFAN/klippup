import { getTranslations } from "next-intl/server";
import Link from "next/link";
import SignupForm from "./SignupForm";

export default async function SignupPage() {
  const t = await getTranslations("auth");
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{t("signup.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("signup.subtitle")}</p>
      </div>
      <SignupForm />
      <p className="text-center text-sm text-muted-foreground">
        {t("signup.haveAccount")}{" "}
        <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
          {t("signup.loginLink")}
        </Link>
      </p>
    </div>
  );
}
