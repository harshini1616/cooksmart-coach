import omelette from "@/assets/recipe-omelette.jpg";
import pasta from "@/assets/recipe-pasta.jpg";
import friedRice from "@/assets/recipe-fried-rice.jpg";
import dahl from "@/assets/recipe-dahl.jpg";
import grilledCheese from "@/assets/recipe-grilled-cheese.jpg";
import cookies from "@/assets/recipe-cookies.jpg";

const map: Record<string, string> = {
  "/hero-omelette": omelette,
  "/hero-pasta": pasta,
  "/hero-fried-rice": friedRice,
  "/hero-dahl": dahl,
  "/hero-grilled-cheese": grilledCheese,
  "/hero-cookies": cookies,
};

export function resolveRecipeImage(key: string | null | undefined): string {
  if (!key) return pasta;
  return map[key] ?? key;
}
