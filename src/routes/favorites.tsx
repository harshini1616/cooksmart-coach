import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { listFavorites } from "@/lib/user.functions";
import { RecipeCard } from "@/components/recipe-card";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/favorites")({
  head: () => ({ meta: [{ title: "Favorites — CookMate" }, { name: "description", content: "Your saved recipes." }] }),
  component: Favorites,
});

function Favorites() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: listFavorites,
    enabled: signedIn === true,
  });

  if (signedIn === false) {
    return (
      <section className="mx-auto max-w-md px-4 py-20 text-center">
        <Heart className="mx-auto h-10 w-10 text-primary" />
        <h1 className="mt-4 font-display text-3xl font-semibold">Save recipes you love</h1>
        <p className="mt-2 text-muted-foreground">Sign in to build your collection of favorite recipes.</p>
        <Link to="/auth" className="mt-6 inline-block">
          <Button className="rounded-full">Sign in</Button>
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-4xl font-semibold">Your favorites</h1>
      <p className="mt-1 text-muted-foreground">Recipes you've saved for later.</p>

      {isLoading ? (
        <div className="mt-10 text-muted-foreground">Loading…</div>
      ) : data && data.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="font-display text-lg">No favorites yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Tap the heart on any recipe to save it here.</p>
          <Link to="/browse" className="mt-4 inline-block">
            <Button className="rounded-full">Browse recipes</Button>
          </Link>
        </div>
      )}
    </section>
  );
}
