import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="font-display text-3xl">We couldn&apos;t find that</h1>
        <p className="mt-3 text-ink/70">
          The page or booking you&apos;re looking for doesn&apos;t exist, or
          the link might be out of date.
        </p>
        <Link href="/" className="mt-6 inline-block text-brick underline">
          Back to rooms
        </Link>
      </main>
    </>
  );
}
