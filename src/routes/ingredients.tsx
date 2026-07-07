import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, X, Salad } from "lucide-react";
import { listRecipes } from "@/lib/recipes.functions";
import { RecipeCard } from "@/components/recipe-card";
import { Button } from "@/components/ui/button";

const recipesQuery = queryOptions({
  queryKey: ["recipes"],
  queryFn: () => listRecipes(),
});

export const Route = createFileRoute("/ingredients")({
  loader: ({ context }) => context.queryClient.ensureQueryData(recipesQuery),
  head: () => ({
    meta: [
      { title: "Cook with what you have — CookMate" },
      { name: "description", content: "Enter the ingredients in your kitchen and see recipes you can make right now." },
    ],
  }),
  component: Ingredients,
});

const SUGGESTED = ["Egg", "Rice", "Onion", "Tomato", "Cheese", "Pasta", "Garlic", "Milk", "Butter", "Bread", "Lentils", "Coconut milk"];

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z]/g, "");
}

function Ingredients() {
  const { data: recipes } = useSuspenseQuery(recipesQuery);
  const [items, setItems] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const add = (name: string) => {
    const clean = name.trim();
    if (!clean) return;
    if (items.some((i) => normalize(i) === normalize(clean))) return;
    setItems([...items, clean]);
    setInput("");
  };

  const remove = (name: string) => setItems(items.filter((i) => i !== name));

  const results = useMemo(() => {
    if (items.length === 0) return [];
    const owned = new Set(items.map(normalize));
    return recipes
      .map((r) => {
        const essential = r.ingredients.filter((i) => i.essential !== false);
        const matched = essential.filter((i) =>
          [...owned].some((o) => normalize(i.name).includes(o) || o.includes(normalize(i.name))),
        );
        const missing = essential.filter((i) => !matched.includes(i));
        const score = essential.length ? matched.length / essential.length : 0;
        return { recipe: r, missing, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [items, recipes]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Salad className="h-3.5 w-3.5" /> Smart ingredient search
        </div>
        <h1 className="mt-3 font-display text-4xl font-semibold text-balance">
          What's in your kitchen right now?
        </h1>
        <p className="mt-2 text-muted-foreground">
          Add what you have. We'll suggest recipes you can start making immediately.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          add(input);
        }}
        className="mt-6 flex max-w-xl items-center gap-2 rounded-full border border-border bg-card p-1.5 shadow-soft"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add an ingredient and press Enter…"
          className="min-w-0 flex-1 bg-transparent px-4 py-2 text-sm outline-none"
        />
        <Button type="submit" size="sm" className="rounded-full">
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {SUGGESTED.map((s) => (
          <button
            key={s}
            onClick={() => add(s)}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            + {s}
          </button>
        ))}
      </div>

      {items.length > 0 ? (
        <div className="mt-6">
          <div className="text-sm font-medium">Your kitchen:</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {items.map((i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm text-primary"
              >
                {i}
                <button onClick={() => remove(i)} aria-label={`Remove ${i}`}>
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-10">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
            Add a few ingredients to see recipes you can make.
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
            No matches yet — add a few more staples like rice, eggs, or pasta.
          </div>
        ) : (
          <>
            <h2 className="mb-5 font-display text-2xl font-semibold">
              {results.length} recipes you can make
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {results.map(({ recipe, missing, score }) => (
                <div key={recipe.id} className="flex flex-col">
                  <RecipeCard recipe={recipe} />
                  <div className="mt-2 text-xs text-muted-foreground">
                    {Math.round(score * 100)}% match
                    {missing.length ? (
                      <> · needs {missing.slice(0, 3).map((m) => m.name).join(", ")}</>
                    ) : (
                      <> · you have everything essential ✨</>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
