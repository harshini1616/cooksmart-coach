import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Sparkles } from "lucide-react";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Weekly Meal Planner — CookMate" },
      { name: "description", content: "Plan your week of meals and auto-generate a shopping list." },
    ],
  }),
  component: Planner,
});

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MEALS = ["Breakfast", "Lunch", "Dinner"];

function Planner() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
          <Calendar className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-4xl font-semibold">Meal planner</h1>
          <p className="text-muted-foreground">Drag recipes onto your week (coming soon).</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-7">
        {DAYS.map((d) => (
          <div key={d} className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
            <div className="mb-3 font-display text-lg font-semibold">{d}</div>
            <div className="space-y-2">
              {MEALS.map((m) => (
                <div key={m} className="rounded-xl bg-secondary/60 p-3 text-sm text-muted-foreground">
                  <div className="text-xs uppercase tracking-wide">{m}</div>
                  <div className="mt-1 italic">Empty</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-2 rounded-2xl border border-dashed border-border/70 bg-secondary/30 p-6 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4 text-primary" />
        Interactive planner with drag & drop and auto shopping list — arriving soon.
      </div>
    </section>
  );
}
