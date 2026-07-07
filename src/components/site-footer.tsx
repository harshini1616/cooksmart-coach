import { Link } from "@tanstack/react-router";
import { ChefHat } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/60 bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-display text-lg font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <ChefHat className="h-4 w-4" />
            </span>
            CookMate
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Cooking made simple — one step at a time. Learn to cook with warmth, not stress.
          </p>
        </div>
        <div>
          <h4 className="font-display text-base font-semibold">Cook</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/browse" className="hover:text-foreground">Browse recipes</Link></li>
            <li><Link to="/ingredients" className="hover:text-foreground">Cook with what you have</Link></li>
            <li><Link to="/dictionary" className="hover:text-foreground">Cooking dictionary</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-base font-semibold">Your kitchen</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/favorites" className="hover:text-foreground">Favorites</Link></li>
            <li><Link to="/shopping" className="hover:text-foreground">Shopping list</Link></li>
            <li><Link to="/planner" className="hover:text-foreground">Meal planner</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-base font-semibold">Account</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/auth" className="hover:text-foreground">Sign in</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} CookMate — Made for beginners with love.
      </div>
    </footer>
  );
}
