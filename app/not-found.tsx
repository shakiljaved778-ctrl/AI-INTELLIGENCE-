import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
      <p className="font-serif text-6xl font-bold text-primary">404</p>
      <h1 className="mt-4 font-serif text-2xl font-bold">Page not found</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        The story you&rsquo;re looking for may have moved or never existed.
      </p>
      <Link href="/" className={buttonVariants({ className: "mt-6" })}>
        Back to the front page
      </Link>
    </div>
  );
}
