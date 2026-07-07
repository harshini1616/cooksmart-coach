export type Ingredient = {
  name: string;
  qty: string;
  essential?: boolean;
  substitutions?: string[];
};

export type Step = {
  n: number;
  instruction: string;
  minutes: number;
};

export type Mistake = {
  mistake: string;
  fix: string;
};

export type Recipe = {
  id: string;
  slug: string;
  title: string;
  description: string;
  hero_image: string | null;
  difficulty: string;
  cuisine: string;
  category: string;
  prep_minutes: number;
  cook_minutes: number;
  servings: number;
  calories: number | null;
  cost_estimate: string | null;
  tags: string[];
  equipment: string[];
  common_mistakes: Mistake[];
  ingredients: Ingredient[];
  steps: Step[];
  featured: boolean;
  created_at: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};
