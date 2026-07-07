import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChefHat, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/browse", label: "Browse" },
  { to: "/ingredients", label: "What's in my kitchen" },
  { to: "/dictionary", label: "Dictionary" },
  { to: "/planner", label: "Meal plan" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        setEmail(session?.user?.email ?? null);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-display font-semibold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
            <ChefHat className="h-5 w-5" />
          </span>
          CookMate
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {email ? (
            <>
              <Link to="/favorites">
                <Button variant="ghost" size="sm">Favorites</Button>
              </Link>
              <Link to="/shopping">
                <Button variant="ghost" size="sm">List</Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  await supabase.auth.signOut();
                }}
              >
                Sign out
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button size="sm">Sign in</Button>
            </Link>
          )}
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-lg text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border/60 bg-background md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm hover:bg-secondary"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              {email ? (
                <>
                  <Link to="/favorites" onClick={() => setOpen(false)} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">Favorites</Button>
                  </Link>
                  <Link to="/shopping" onClick={() => setOpen(false)} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">List</Button>
                  </Link>
                </>
              ) : (
                <Link to="/auth" onClick={() => setOpen(false)} className="flex-1">
                  <Button size="sm" className="w-full">Sign in</Button>
                </Link>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
