import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient, useQuery, queryOptions } from "@tanstack/react-query";
import { useEffect, useMemo, useState, useRef } from "react";
import {
  Clock,
  Flame,
  Users,
  DollarSign,
  ChefHat,
  Heart,
  ShoppingCart,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Volume2,
  MessageCircle,
  Send,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { getRecipe } from "@/lib/recipes.functions";
import {
  toggleFavorite,
  getFavoriteIds,
  addManyShoppingItems,
  getChatMessages,
  sendChatMessage,
} from "@/lib/user.functions";
import { resolveRecipeImage } from "@/lib/recipe-images";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import type { Recipe } from "@/lib/types";

export const Route = createFileRoute("/recipe/$slug")({
  loader: async ({ params, context }) => {
    const recipe = await context.queryClient.ensureQueryData(
      queryOptions({
        queryKey: ["recipe", params.slug],
        queryFn: () => getRecipe({ data: { slug: params.slug } }),
      }),
    );
    if (!recipe) throw notFound();
    return { recipe };
  },
  head: ({ loaderData }) =>
    loaderData
      ? {
          meta: [
            { title: `${loaderData.recipe.title} — CookMate` },
            { name: "description", content: loaderData.recipe.description },
            { property: "og:title", content: loaderData.recipe.title },
            { property: "og:description", content: loaderData.recipe.description },
          ],
        }
      : { meta: [{ title: "Recipe — CookMate" }] },
  component: RecipeDetail,
});

function RecipeDetail() {
  const { recipe } = Route.useLoaderData();
  const [servings, setServings] = useState(recipe.servings);
  const [cookMode, setCookMode] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser({ id: data.user.id, email: data.user.email ?? undefined });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email ?? undefined } : null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const img = resolveRecipeImage(recipe.hero_image);
  const total = recipe.prep_minutes + recipe.cook_minutes;
  const factor = servings / recipe.servings;

  if (cookMode) {
    return <CookMode recipe={recipe} onExit={() => setCookMode(false)} user={user} />;
  }

  return (
    <article className="mx-auto max-w-5xl px-4 py-8">
      {/* Hero */}
      <div className="grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-center">
        <div className="overflow-hidden rounded-3xl shadow-warm">
          <img src={img} alt={recipe.title} className="h-full w-full object-cover" width={1200} height={900} />
        </div>
        <div>
          <div className="flex flex-wrap gap-2 text-xs">
            <Chip>{recipe.difficulty}</Chip>
            <Chip>{recipe.cuisine}</Chip>
            <Chip>{recipe.category}</Chip>
          </div>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-balance sm:text-5xl">
            {recipe.title}
          </h1>
          <p className="mt-3 text-muted-foreground">{recipe.description}</p>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat icon={Clock} label="Total" value={`${total}m`} />
            <Stat icon={Users} label="Serves" value={String(servings)} />
            {recipe.calories ? <Stat icon={Flame} label="Cal" value={String(recipe.calories)} /> : null}
            {recipe.cost_estimate ? <Stat icon={DollarSign} label="Cost" value={recipe.cost_estimate} /> : null}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button size="lg" onClick={() => setCookMode(true)} className="rounded-full">
              <ChefHat className="mr-2 h-5 w-5" /> Start cooking
            </Button>
            <FavoriteButton recipeId={recipe.id} />
            <AddAllToShopping recipe={recipe} servings={servings} originalServings={recipe.servings} />
          </div>
        </div>
      </div>

      {/* Serving calc */}
      <section className="mt-10 flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
        <div className="text-sm font-medium">Adjust servings:</div>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 4, 6].map((n) => (
            <button
              key={n}
              onClick={() => setServings(n)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                servings === n ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-secondary"
              }`}
            >
              {n} {n === 1 ? "person" : "people"}
            </button>
          ))}
        </div>
      </section>

      {/* Ingredients & Equipment */}
      <section className="mt-10 grid gap-8 md:grid-cols-[1.2fr_1fr]">
        <div>
          <h2 className="font-display text-2xl font-semibold">Ingredients</h2>
          <ul className="mt-4 space-y-2.5">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-3">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-primary" />
                <div className="flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-medium">{ing.name}</span>
                    <span className="text-sm text-muted-foreground">{scaleQty(ing.qty, factor)}</span>
                  </div>
                  {ing.essential === false ? (
                    <span className="text-xs text-muted-foreground">Optional</span>
                  ) : null}
                  {ing.substitutions?.length ? (
                    <div className="mt-1 text-xs text-muted-foreground">
                      Substitute: {ing.substitutions.join(", ")}
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-2xl font-semibold">You'll need</h2>
          <ul className="mt-4 space-y-2">
            {recipe.equipment.map((e) => (
              <li key={e} className="flex items-center gap-2 rounded-lg bg-secondary/60 px-3 py-2 text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {e}
              </li>
            ))}
          </ul>

          {recipe.tags.length ? (
            <>
              <h3 className="mt-8 font-display text-lg font-semibold">Tags</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {recipe.tags.map((t) => (
                  <Chip key={t}>{t}</Chip>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </section>

      {/* Common mistakes */}
      {recipe.common_mistakes.length ? (
        <section className="mt-12 rounded-2xl border border-accent/60 bg-accent/20 p-6">
          <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
            <AlertTriangle className="h-5 w-5 text-primary" /> Common beginner mistakes
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {recipe.common_mistakes.map((m, i) => (
              <div key={i} className="rounded-xl border border-border/60 bg-card p-4">
                <div className="font-medium">{m.mistake}</div>
                <div className="mt-1 text-sm text-muted-foreground">{m.fix}</div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* AI Assistant */}
      <section className="mt-12">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="font-display text-2xl font-semibold">Ask CookMate about this recipe</h2>
        </div>
        <AIAssistant recipeId={recipe.id} user={user} />
      </section>
    </article>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
      {children}
    </span>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-1 font-display text-lg font-semibold">{value}</div>
    </div>
  );
}

function scaleQty(qty: string, factor: number): string {
  if (factor === 1) return qty;
  const m = qty.match(/^([\d./\s]+)(.*)$/);
  if (!m) return qty;
  const numStr = m[1].trim();
  let num = 0;
  if (numStr.includes("/")) {
    const [a, b] = numStr.split("/").map(Number);
    num = a / b;
  } else {
    num = parseFloat(numStr);
  }
  if (isNaN(num)) return qty;
  const scaled = num * factor;
  const rounded = Math.round(scaled * 100) / 100;
  return `${rounded}${m[2]}`;
}

function FavoriteButton({ recipeId }: { recipeId: string }) {
  const qc = useQueryClient();
  const { data: ids } = useQuery({
    queryKey: ["favorites-ids"],
    queryFn: async () => {
      try {
        return await getFavoriteIds();
      } catch {
        return [] as string[];
      }
    },
  });
  const isFav = ids?.includes(recipeId);
  const mut = useMutation({
    mutationFn: () => toggleFavorite({ data: { recipeId } }),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["favorites-ids"] });
      qc.invalidateQueries({ queryKey: ["favorites"] });
      toast.success(r.favorited ? "Saved to favorites" : "Removed from favorites");
    },
    onError: () => toast.error("Please sign in to save favorites"),
  });
  return (
    <Button variant="outline" onClick={() => mut.mutate()} className="rounded-full">
      <Heart className={`mr-2 h-4 w-4 ${isFav ? "fill-primary text-primary" : ""}`} />
      {isFav ? "Saved" : "Save"}
    </Button>
  );
}

function AddAllToShopping({ recipe, servings, originalServings }: { recipe: Recipe; servings: number; originalServings: number }) {
  const mut = useMutation({
    mutationFn: () => {
      const factor = servings / originalServings;
      const items = recipe.ingredients.map((i) => ({
        name: i.name,
        quantity: scaleQty(i.qty, factor),
      }));
      return addManyShoppingItems({ data: { items } });
    },
    onSuccess: () => toast.success("Added to shopping list"),
    onError: () => toast.error("Please sign in to save a shopping list"),
  });
  return (
    <Button variant="outline" onClick={() => mut.mutate()} disabled={mut.isPending} className="rounded-full">
      <ShoppingCart className="mr-2 h-4 w-4" /> Add to list
    </Button>
  );
}

// -------------------- Cook Mode --------------------

function CookMode({ recipe, onExit, user }: { recipe: Recipe; onExit: () => void; user: { id: string } | null }) {
  const [idx, setIdx] = useState(0);
  const step = recipe.steps[idx];
  const [remaining, setRemaining] = useState(step.minutes * 60);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setRemaining(step.minutes * 60);
    setRunning(false);
  }, [idx, step.minutes]);

  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setRunning(false);
          try {
            if (typeof window !== "undefined" && "Notification" in window) {
              new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=").play().catch(() => {});
            }
          } catch { /* noop */ }
          toast.success(`Timer done — ${step.instruction.split(".")[0]}`);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running, step.instruction]);

  const speak = () => {
    try {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const u = new SpeechSynthesisUtterance(step.instruction);
        u.rate = 0.95;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      }
    } catch { /* noop */ }
  };

  const mm = Math.floor(remaining / 60).toString().padStart(2, "0");
  const ss = (remaining % 60).toString().padStart(2, "0");
  const progress = ((idx + 1) / recipe.steps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="border-b border-border/60 bg-card/80 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <button onClick={onExit} className="text-sm text-muted-foreground hover:text-foreground">
            ← Exit
          </button>
          <div className="text-sm font-medium">
            Step {idx + 1} of {recipe.steps.length}
          </div>
          <div className="w-14 text-right text-xs text-muted-foreground">{Math.round(progress)}%</div>
        </div>
        <div className="mx-auto mt-2 max-w-3xl">
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-warm sm:p-10">
            <div className="text-sm font-medium text-primary">Step {step.n}</div>
            <p className="mt-3 font-display text-2xl font-semibold leading-snug text-balance sm:text-3xl">
              {step.instruction}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="rounded-2xl bg-secondary p-6 text-center">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Timer</div>
                <div className="mt-1 font-display text-6xl font-semibold tabular-nums">
                  {mm}:{ss}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:flex-col">
                <Button onClick={() => setRunning((r) => !r)} className="rounded-full">
                  {running ? <><Pause className="mr-2 h-4 w-4" /> Pause</> : <><Play className="mr-2 h-4 w-4" /> Start timer</>}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setRunning(false);
                    setRemaining(step.minutes * 60);
                  }}
                  className="rounded-full"
                >
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset
                </Button>
                <Button variant="ghost" onClick={speak} className="rounded-full">
                  <Volume2 className="mr-2 h-4 w-4" /> Read aloud
                </Button>
              </div>
            </div>
          </div>

          {/* Mini AI helper */}
          {user ? (
            <details className="mt-6 rounded-2xl border border-border/60 bg-card p-4">
              <summary className="cursor-pointer text-sm font-medium">
                <Sparkles className="mr-1 inline h-4 w-4 text-primary" /> Ask CookMate a quick question
              </summary>
              <div className="mt-4">
                <AIAssistant recipeId={recipe.id} user={user} compact />
              </div>
            </details>
          ) : null}
        </div>
      </div>

      <footer className="border-t border-border/60 bg-card px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <Button
            variant="outline"
            disabled={idx === 0}
            onClick={() => setIdx(idx - 1)}
            className="rounded-full"
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Previous
          </Button>
          {idx < recipe.steps.length - 1 ? (
            <Button onClick={() => setIdx(idx + 1)} className="rounded-full" size="lg">
              Next step <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={onExit} className="rounded-full" size="lg">
              Done cooking 🎉
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}

// -------------------- AI Assistant --------------------

function AIAssistant({ recipeId, user, compact }: { recipeId: string; user: { id: string } | null; compact?: boolean }) {
  const qc = useQueryClient();
  const [input, setInput] = useState("");
  const [pendingUser, setPendingUser] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const { data: messages, isLoading } = useQuery({
    queryKey: ["chat", recipeId],
    queryFn: () => getChatMessages({ data: { recipeId } }),
    enabled: !!user,
  });

  const mut = useMutation({
    mutationFn: (message: string) => sendChatMessage({ data: { recipeId, message } }),
    onSuccess: () => {
      setPendingUser(null);
      qc.invalidateQueries({ queryKey: ["chat", recipeId] });
    },
    onError: (e: Error) => {
      setPendingUser(null);
      toast.error(e.message || "AI is unavailable. Try again.");
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pendingUser]);

  if (!user) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center">
        <MessageCircle className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-3 font-display text-lg">Sign in to chat with CookMate</p>
        <p className="text-sm text-muted-foreground">
          Your questions and conversations are saved with your account.
        </p>
        <a href="/auth" className="mt-4 inline-flex">
          <Button className="rounded-full">Sign in</Button>
        </a>
      </div>
    );
  }

  const suggestions = ["I don't have butter", "My rice is undercooked", "Can I use olive oil instead?", "What does sauté mean?"];

  return (
    <div className={`overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft ${compact ? "" : ""}`}>
      <div ref={scrollRef} className={`space-y-3 overflow-y-auto p-4 ${compact ? "max-h-60" : "max-h-96"}`}>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading conversation…</div>
        ) : messages && messages.length > 0 ? (
          messages.map((m) => <Bubble key={m.id} role={m.role} content={m.content} />)
        ) : (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Ask anything about this recipe — substitutions, timings, techniques.
          </div>
        )}
        {pendingUser ? <Bubble role="user" content={pendingUser} /> : null}
        {mut.isPending ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" /> CookMate is thinking…
          </div>
        ) : null}
      </div>
      {messages && messages.length === 0 && !pendingUser ? (
        <div className="flex flex-wrap gap-2 border-t border-border/60 px-4 py-3">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => {
                setPendingUser(s);
                mut.mutate(s);
              }}
              className="rounded-full border border-border bg-background px-3 py-1 text-xs hover:bg-secondary"
            >
              {s}
            </button>
          ))}
        </div>
      ) : null}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const text = input.trim();
          if (!text || mut.isPending) return;
          setInput("");
          setPendingUser(text);
          mut.mutate(text);
        }}
        className="flex items-center gap-2 border-t border-border/60 p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask CookMate…"
          className="min-w-0 flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
        />
        <Button type="submit" size="icon" className="rounded-full" disabled={mut.isPending}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

function Bubble({ role, content }: { role: string; content: string }) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2 text-sm text-primary-foreground">
          {content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-2">
      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
        <Sparkles className="h-3.5 w-3.5" />
      </div>
      <div className="prose prose-sm max-w-[85%] text-sm">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
