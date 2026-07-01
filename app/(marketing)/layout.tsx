import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { getCurrentUser } from "@/lib/auth";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser().catch(() => null);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar isLoggedIn={Boolean(user)} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
