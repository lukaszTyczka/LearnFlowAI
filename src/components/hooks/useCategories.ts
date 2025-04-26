import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { Tables } from "../../db/database.types";

type Category = Tables<"categories">;

export function useCategories(initialCategories: Category[] = []) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isLoading, setIsLoading] = useState<boolean>(!initialCategories.length);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    if (categories.length > 0) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/categories`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to load categories");
      }
      const fetchedData = await response.json();
      setCategories(fetchedData.categories || []);
      if (fetchedData.categories?.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(fetchedData.categories[0].id);
      }
    } catch (err: any) {
      console.error("Error loading categories:", err);
      toast.error(err.message || "Failed to load categories");
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, [categories.length, selectedCategoryId]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (!selectedCategoryId && categories.length > 0) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  return {
    categories,
    isLoading,
    selectedCategoryId,
    setSelectedCategoryId,
    loadCategories,
  };
}
