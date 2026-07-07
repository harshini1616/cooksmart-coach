import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { z } from "zod";
import { listRecipes } from "@/lib/recipes.functions";
import { RecipeCard } from "@/components/recipe-card";

const recipesQuery = queryOptions({
  queryKey: ["recipes"],
  queryFn: () => listRecipes(),
});

const searchSchema = z.object({ q: z.string().optional() });

export const Route = createFileRoute("/browse")({
  validateSearch: (s) => searchSchema.parse(s),
  loader: ({ context }) => context.queryClient.ensureQueryData(recipesQuery),
  head: () => ({
    meta: [
      { title: "Browse Recipes — CookMate" },
      { name: "description", content: "Explore beginner-friendly recipes filtered by cuisine, category, and diet." },
    ],
  }),
  component: Browse,
});

const TAGS = ["Quick Meals", "Vegetarian", "Vegan", "High Protein", "Budget Meals", "Kid Friendly", "Healthy", "Under 30 Minutes"];

function Browse() {
  const initial = Route.useSearch();
  const { data: recipes } = useSuspenseQuery(recipesQuery);
  const [q, setQ] = useState(initial.q ?? "");
  const [tag, setTag] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return recipes.filter((r) => {
      const matchesText =
        !s ||
        r.title.toLowerCase().includes(s) ||
        r.cuisine.toLowerCase().includes(s) ||
        r.category.toLowerCase().includes(s) ||
        r.tags.some((t) => t.toLowerCase().includes(s)) ||
        r.ingredients.some((i) => i.name.toLowerCase().includes(s));
      const matchesTag = !tag || r.tags.includes(tag) || r.cuisine === tag || r.category === tag;
      return matchesText && matchesTag;
    });
  }, [recipes, q, tag]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-4xl font-semibold">Browse recipes</h1>
      <p className="mt-2 text-muted-foreground">{recipes.length} beginner-friendly dishes.</p>

      <div className="mt-6 flex items-center gap-2 rounded-full border border-border bg-card p-1.5 shadow-soft">
        <Search className="ml-3 h-5 w-5 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, ingredient, cuisine…"
          className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setTag(null)}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
            !tag ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-secondary"
          }`}
        >
          All
        </button>
        {TAGS.map((t) => (
          <button
            key={t}
            onClick={() => setTag(t === tag ? null : t)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
              t === tag ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-secondary"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-16 rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="font-display text-lg">No recipes match.</p>
          <p className="mt-1 text-sm text-muted-foreground">Try a different keyword or clear filters.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      )}
    </section>
  );
}
