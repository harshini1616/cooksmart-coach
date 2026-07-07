import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { Recipe, ChatMessage } from "./types";

export const listFavorites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("favorites")
      .select("recipe_id, recipes(*)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => r.recipes as unknown as Recipe).filter(Boolean);
  });

export const toggleFavorite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ recipeId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: existing } = await context.supabase
      .from("favorites")
      .select("recipe_id")
      .eq("user_id", context.userId)
      .eq("recipe_id", data.recipeId)
      .maybeSingle();
    if (existing) {
      await context.supabase
        .from("favorites")
        .delete()
        .eq("user_id", context.userId)
        .eq("recipe_id", data.recipeId);
      return { favorited: false };
    }
    await context.supabase.from("favorites").insert({
      user_id: context.userId,
      recipe_id: data.recipeId,
    });
    return { favorited: true };
  });

export const getFavoriteIds = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("favorites").select("recipe_id");
    return (data ?? []).map((r) => r.recipe_id as string);
  });

export const listShopping = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("shopping_items")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const addShoppingItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({ name: z.string().trim().min(1).max(120), quantity: z.string().max(60).optional() })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("shopping_items")
      .insert({ user_id: context.userId, name: data.name, quantity: data.quantity ?? null })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const addManyShoppingItems = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        items: z
          .array(z.object({ name: z.string().min(1).max(120), quantity: z.string().max(60).optional() }))
          .min(1)
          .max(50),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const rows = data.items.map((it) => ({
      user_id: context.userId,
      name: it.name,
      quantity: it.quantity ?? null,
    }));
    const { error } = await context.supabase.from("shopping_items").insert(rows);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const toggleShoppingItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), purchased: z.boolean() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await context.supabase
      .from("shopping_items")
      .update({ purchased: data.purchased })
      .eq("id", data.id);
    return { ok: true };
  });

export const deleteShoppingItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await context.supabase.from("shopping_items").delete().eq("id", data.id);
    return { ok: true };
  });

export const getChatMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ recipeId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("chat_messages")
      .select("*")
      .eq("recipe_id", data.recipeId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows ?? []) as ChatMessage[];
  });

export const sendChatMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        recipeId: z.string().uuid(),
        message: z.string().trim().min(1).max(1000),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    // Fetch recipe context
    const { data: recipe } = await context.supabase
      .from("recipes")
      .select("title, ingredients, steps, cuisine, difficulty")
      .eq("id", data.recipeId)
      .maybeSingle();

    // Fetch prior messages
    const { data: history } = await context.supabase
      .from("chat_messages")
      .select("role, content")
      .eq("recipe_id", data.recipeId)
      .eq("user_id", context.userId)
      .order("created_at", { ascending: true })
      .limit(20);

    // Save user message
    await context.supabase.from("chat_messages").insert({
      user_id: context.userId,
      recipe_id: data.recipeId,
      role: "user",
      content: data.message,
    });

    const systemPrompt = `You are CookMate, a warm, patient cooking coach helping a beginner cook. Keep answers short, friendly, and practical. Use plain language and simple steps. When suggesting substitutions, offer the most common pantry alternatives first. If the user asks about the recipe, ground your answer in this context:

Recipe: ${recipe?.title ?? "Unknown"}
Cuisine: ${recipe?.cuisine ?? "-"}  Difficulty: ${recipe?.difficulty ?? "-"}
Ingredients: ${JSON.stringify(recipe?.ingredients ?? [])}
Steps: ${JSON.stringify(recipe?.steps ?? [])}

Rules:
- Answer in under 120 words unless the user asks for detail.
- Never invent extra ingredient quantities you're unsure of.
- Explain any cooking term (saute, simmer, fold) in one plain sentence.
- Be encouraging.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history ?? []).map((h) => ({ role: h.role as string, content: h.content as string })),
      { role: "user", content: data.message },
    ];

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI is not configured");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`AI error: ${res.status} ${txt.slice(0, 200)}`);
    }
    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const reply = json.choices?.[0]?.message?.content?.trim() ?? "Sorry, I didn't catch that.";

    await context.supabase.from("chat_messages").insert({
      user_id: context.userId,
      recipe_id: data.recipeId,
      role: "assistant",
      content: reply,
    });

    return { reply };
  });
