import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="bg-moss px-6 py-4 text-paper">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <Link href="/" className="font-display text-lg">
          Guesthouse
        </Link>
        <Link
          href="/login"
          className="text-sm text-paper/70 transition-colors hover:text-paper"
        >
          Staff login
        </Link>
      </div>
    </header>
  );
}
