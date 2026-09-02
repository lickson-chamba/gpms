import { SiteHeader } from "@/components/site-header";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-sm px-6 py-24">
        <h1 className="font-display text-3xl">Staff login</h1>
        <p className="mt-2 text-ink/60">Reception and manager access only.</p>
        <div className="mt-8">
          <LoginForm redirectTo={next} />
        </div>
      </main>
    </>
  );
}
