import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Search } from "lucide-react";

export const Route = createFileRoute("/dictionary")({
  head: () => ({
    meta: [
      { title: "Cooking Dictionary — CookMate" },
      { name: "description", content: "Beginner-friendly explanations of common cooking terms." },
    ],
  }),
  component: Dictionary,
});

const TERMS: Array<{ term: string; icon: string; short: string; long: string }> = [
  { term: "Boil", icon: "💧", short: "Cook in bubbling water at high heat", long: "Water reaches ~100°C (212°F). Big rolling bubbles cover the whole surface. Used for pasta, potatoes, hard-boiled eggs." },
  { term: "Simmer", icon: "🫧", short: "Gentle small bubbles, medium-low heat", long: "Below boiling — small bubbles gently rise. Perfect for sauces, soups, and stews so ingredients cook without breaking apart." },
  { term: "Sauté", icon: "🍳", short: "Cook fast in a little oil over medium-high heat", long: "Chop small, use a bit of oil, and toss often. Great for onions, garlic, mushrooms, and quick vegetable sides." },
  { term: "Whisk", icon: "🥚", short: "Beat quickly with a whisk or fork", long: "Mixes and adds air. Use for eggs, salad dressings, and pancake batter." },
  { term: "Fold", icon: "🥣", short: "Gently combine without deflating", long: "Cut down through the middle, sweep across the bottom, lift up and over. Used for whipped cream and cake batter." },
  { term: "Julienne", icon: "🥕", short: "Cut into long thin matchsticks", long: "Slice food into 3-5mm wide strips, ~5cm long. Common for carrots, cucumbers, and stir-fries." },
  { term: "Dice", icon: "🧅", short: "Cut into small even cubes", long: "Usually 5-10mm cubes. Even sizes cook at the same rate." },
  { term: "Chop", icon: "🔪", short: "Cut roughly into small pieces", long: "Doesn't need to be exact — just aim for bite-sized pieces roughly the same size." },
  { term: "Roast", icon: "🔥", short: "Cook in the oven at high heat, uncovered", long: "Typically 180-220°C (350-425°F). Gives crispy edges and deep flavor." },
  { term: "Bake", icon: "🍞", short: "Cook in the oven, usually with moisture", long: "Often used for cakes, breads, and pastries. Similar to roasting but with lower or gentler heat." },
  { term: "Steam", icon: "🥦", short: "Cook over hot water without touching it", long: "Preserves nutrients and color. Use a steamer basket over simmering water." },
  { term: "Al dente", icon: "🍝", short: "Pasta cooked to firm bite", long: "Italian for 'to the tooth'. Cook until pasta is tender but still has a slight resistance in the middle." },
  { term: "Reduce", icon: "🥄", short: "Simmer to thicken and concentrate flavor", long: "Cook uncovered — water evaporates, sauce thickens and tastes stronger." },
  { term: "Deglaze", icon: "🍷", short: "Add liquid to lift browned bits from the pan", long: "After searing, pour in stock or wine and scrape — those browned bits are pure flavor." },
];

function Dictionary() {
  const [q, setQ] = useState("");
  const filtered = TERMS.filter(
    (t) => !q.trim() || t.term.toLowerCase().includes(q.toLowerCase()) || t.short.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-4xl font-semibold">Cooking dictionary</h1>
          <p className="text-muted-foreground">Plain-language explanations of the terms you'll see in recipes.</p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-full border border-border bg-card p-1.5 shadow-soft">
        <Search className="ml-3 h-5 w-5 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search a cooking term…"
          className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none"
        />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {filtered.map((t) => (
          <div key={t.term} className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
            <div className="flex items-start gap-3">
              <div className="text-3xl">{t.icon}</div>
              <div className="flex-1">
                <h3 className="font-display text-xl font-semibold">{t.term}</h3>
                <p className="text-sm font-medium text-primary">{t.short}</p>
                <p className="mt-2 text-sm text-muted-foreground">{t.long}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
