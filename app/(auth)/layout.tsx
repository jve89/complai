import { SiteLogo } from "@/components/site-logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-navy-900 text-white">
      <header className="container flex h-16 items-center">
        <SiteLogo className="text-white" />
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
