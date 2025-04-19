import { supabaseClient } from "../db/supabase.client";
import type { Database } from "../db/database.types";

export type Category = Database["public"]["Tables"]["categories"]["Row"];

class CategoriesService {
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabaseClient.from("categories").select("*");

    if (error) {
      throw new Error(`Error fetching categories: ${error.message}`);
    }
    return data as Category[];
  }
}

export default new CategoriesService();
