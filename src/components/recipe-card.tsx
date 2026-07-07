import { Link } from "@tanstack/react-router";
import { Clock, Flame } from "lucide-react";
import type { Recipe } from "@/lib/types";
import { resolveRecipeImage } from "@/lib/recipe-images";

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const img = resolveRecipeImage(recipe.hero_image);
  const total = recipe.prep_minutes + recipe.cook_minutes;

  return (
    <Link
      to="/recipe/$slug"
      params={{ slug: recipe.slug }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-warm"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <img
          src={img}
          alt={recipe.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-medium backdrop-blur">
          {recipe.difficulty}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{recipe.cuisine}</span>
          <span>·</span>
          <span>{recipe.category}</span>
        </div>
        <h3 className="font-display text-xl font-semibold leading-tight text-balance">
          {recipe.title}
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{recipe.description}</p>
        <div className="mt-auto flex items-center gap-4 pt-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {total} min
          </span>
          {recipe.calories ? (
            <span className="inline-flex items-center gap-1">
              <Flame className="h-3.5 w-3.5" /> {recipe.calories} kcal
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
