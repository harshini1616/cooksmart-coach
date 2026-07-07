import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Search, Sparkles, Timer, Utensils, ArrowRight, Salad } from "lucide-react";
import { Suspense, useState } from "react";
import heroImg from "@/assets/hero.jpg";
import { listRecipes } from "@/lib/recipes.functions";
import { RecipeCard } from "@/components/recipe-card";
import { Button } from "@/components/ui/button";

const recipesQuery = queryOptions({
  queryKey: ["recipes"],
  queryFn: () => listRecipes(),
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(recipesQuery),
  component: Home,
});

const CATEGORIES = [
  { label: "Breakfast", emoji: "🥞" },
  { label: "Lunch", emoji: "🥗" },
  { label: "Dinner", emoji: "🍝" },
  { label: "Snacks", emoji: "🥪" },
  { label: "Desserts", emoji: "🍪" },
  { label: "Indian", emoji: "🍛" },
  { label: "Italian", emoji: "🍕" },
  { label: "Chinese", emoji: "🥡" },
  { label: "Vegan", emoji: "🌱" },
  { label: "Budget", emoji: "💰" },
];

function Home() {
  const [q, setQ] = useState("");

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-warm-gradient">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-14 pt-10 md:grid-cols-2 md:items-center md:pb-24 md:pt-16">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI cooking coach in every recipe
            </div>
            <h1 className="font-display text-4xl font-semibold leading-[1.05] text-balance sm:text-5xl md:text-6xl">
              Cooking made simple<span className="text-primary">.</span>
              <br />
              One step at a time.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground text-balance">
              Learn to cook with easy ingredients, exact timings, built-in timers, and an AI cooking assistant that guides you through every step.
            </p>

            <form
              className="mt-7 flex max-w-lg items-center gap-2 rounded-full border border-border bg-card p-1.5 shadow-soft"
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = `/browse?q=${encodeURIComponent(q)}`;
              }}
            >
              <Search className="ml-3 h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search a recipe or ingredient…"
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none"
              />
              <Button type="submit" className="rounded-full">Search</Button>
            </form>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/ingredients">
                <Button variant="outline" className="rounded-full">
                  <Salad className="mr-2 h-4 w-4" /> Cook with what you have
                </Button>
              </Link>
              <Link to="/browse">
                <Button variant="ghost" className="rounded-full">
                  Browse recipes <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-warm">
              <img
                src={heroImg}
                alt="A warm bowl of golden dahl with fresh herbs and bread on an oak counter"
                width={1600}
                height={1200}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-5 -left-5 hidden rounded-2xl bg-card/95 p-4 shadow-warm backdrop-blur sm:block">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Timer className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Step 3 of 7</div>
                  <div className="font-medium">Simmer for 8:00</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">Browse by category</h2>
          <Link to="/browse" className="text-sm text-muted-foreground hover:text-foreground">
            See all →
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {CATEGORIES.map((c) => (
            <Link
              key={c.label}
              to="/browse"
              search={{ q: c.label }}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-card px-4 py-5 text-center transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft"
            >
              <span className="text-3xl transition-transform group-hover:scale-110">{c.emoji}</span>
              <span className="text-sm font-medium">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-6 text-muted-foreground">Loading recipes…</div>}>
        <FeaturedRecipes />
      </Suspense>

      {/* AI Banner */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="relative overflow-hidden rounded-[2rem] bg-primary p-8 text-primary-foreground shadow-warm md:p-12">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary-foreground/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-primary-foreground/10 blur-3xl" />
          <div className="relative grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-medium">
                <Sparkles className="h-3.5 w-3.5" /> AI Cooking Assistant
              </div>
              <h2 className="font-display text-3xl font-semibold sm:text-4xl">
                "I don't have butter." "My rice is undercooked."
              </h2>
              <p className="mt-3 max-w-2xl text-primary-foreground/85">
                Stuck mid-recipe? Ask CookMate anything. Get instant substitutions, rescue tips, and beginner-friendly explanations — right beside your steps.
              </p>
            </div>
            <div className="rounded-2xl bg-background/95 p-4 text-foreground shadow-soft">
              <div className="text-xs text-muted-foreground">You</div>
              <div className="mt-1 rounded-xl bg-secondary px-3 py-2 text-sm">Can I use olive oil instead of butter?</div>
              <div className="mt-3 text-xs text-muted-foreground">CookMate</div>
              <div className="mt-1 rounded-xl bg-primary/10 px-3 py-2 text-sm">
                Yes! Use the same amount. Olive oil gives a lighter, fruitier flavor and browns beautifully — perfect for eggs or veggies.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: Utensils, title: "Made for beginners", body: "No jargon. Every term is explained. Every step has a photo and time." },
            { icon: Timer, title: "Built-in timers", body: "Every step comes with a countdown so you never overcook again." },
            { icon: Sparkles, title: "AI that helps", body: "Ask about substitutions, techniques, or how to rescue a dish." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-accent-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <h2 className="mb-8 text-center font-display text-3xl font-semibold">Loved by first-time cooks</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { name: "Priya, student", quote: "First time I cooked dahl and it actually tasted good. The timer + AI combo is genius." },
            { name: "Marco, 24", quote: "I used to burn eggs. Now I make omelettes for breakfast every morning. Thank you, CookMate!" },
            { name: "Sana, busy mom", quote: "Weeknight dinners in 20 minutes without stress. The shopping list saves so much time." },
          ].map((t) => (
            <div key={t.name} className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
              <p className="font-display text-lg leading-snug text-balance">"{t.quote}"</p>
              <div className="mt-4 text-sm text-muted-foreground">— {t.name}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function FeaturedRecipes() {
  const { data } = useSuspenseQuery(recipesQuery);
  const featured = data.filter((r) => r.featured).slice(0, 6);
  return (
    <section className="mx-auto max-w-6xl px-4">
      <div className="mb-6 flex items-baseline justify-between">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">Featured beginner recipes</h2>
        <Link to="/browse" className="text-sm text-muted-foreground hover:text-foreground">See all →</Link>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((r) => (
          <RecipeCard key={r.id} recipe={r} />
        ))}
      </div>
    </section>
  );
}
