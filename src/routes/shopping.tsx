import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Plus, ShoppingCart, Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import { addShoppingItem, deleteShoppingItem, listShopping, toggleShoppingItem } from "@/lib/user.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/shopping")({
  head: () => ({ meta: [{ title: "Shopping list — CookMate" }, { name: "description", content: "Your shopping list." }] }),
  component: Shopping,
});

function Shopping() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["shopping"], queryFn: listShopping, enabled: signedIn === true });
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");

  const add = useMutation({
    mutationFn: () => addShoppingItem({ data: { name, quantity: qty || undefined } }),
    onSuccess: () => {
      setName("");
      setQty("");
      qc.invalidateQueries({ queryKey: ["shopping"] });
    },
  });

  const toggle = useMutation({
    mutationFn: (v: { id: string; purchased: boolean }) => toggleShoppingItem({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shopping"] }),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteShoppingItem({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shopping"] }),
  });

  const exportList = () => {
    if (!data) return;
    const text = data.map((i) => `- ${i.name}${i.quantity ? ` (${i.quantity})` : ""}`).join("\n");
    navigator.clipboard.writeText(text).then(() => toast.success("Copied to clipboard"));
  };

  if (signedIn === false) {
    return (
      <section className="mx-auto max-w-md px-4 py-20 text-center">
        <ShoppingCart className="mx-auto h-10 w-10 text-primary" />
        <h1 className="mt-4 font-display text-3xl font-semibold">Your shopping list</h1>
        <p className="mt-2 text-muted-foreground">Sign in to build and save your shopping list.</p>
        <Link to="/auth" className="mt-6 inline-block">
          <Button className="rounded-full">Sign in</Button>
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-semibold">Shopping list</h1>
          <p className="mt-1 text-muted-foreground">Tick items off as you shop.</p>
        </div>
        {data?.length ? (
          <Button variant="outline" size="sm" onClick={exportList} className="rounded-full">
            <Download className="mr-1.5 h-4 w-4" /> Copy
          </Button>
        ) : null}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          add.mutate();
        }}
        className="mt-6 flex flex-wrap gap-2 rounded-2xl border border-border/60 bg-card p-3 shadow-soft"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Item name"
          className="flex-1 min-w-[160px] rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
        />
        <input
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          placeholder="Qty (optional)"
          className="w-32 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
        />
        <Button type="submit" className="rounded-full">
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
      </form>

      <ul className="mt-6 space-y-2">
        {data?.length ? (
          data.map((i) => (
            <li
              key={i.id}
              className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3"
            >
              <input
                type="checkbox"
                checked={i.purchased}
                onChange={(e) => toggle.mutate({ id: i.id, purchased: e.target.checked })}
                className="h-4 w-4 accent-primary"
              />
              <div className={`flex-1 ${i.purchased ? "text-muted-foreground line-through" : ""}`}>
                <span className="font-medium">{i.name}</span>
                {i.quantity ? <span className="ml-2 text-sm text-muted-foreground">{i.quantity}</span> : null}
              </div>
              <button
                onClick={() => del.mutate(i.id)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"
                aria-label="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
            Your list is empty. Add ingredients from any recipe.
          </div>
        )}
      </ul>
    </section>
  );
}
