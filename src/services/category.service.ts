import { supabaseClient } from "../db/supabase.client";

export interface Category {
  id: string;
  name: string;
  // Add other fields if needed
}

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
