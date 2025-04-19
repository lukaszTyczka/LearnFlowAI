import React, { useEffect, useState } from "react";
import categoryService from "../services/category.service";

interface Category {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

const CategoriesList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const data = await categoryService.getCategories();
        setCategories(data as Category[]);
      } catch (err: any) {
        setError(err.message || "Error fetching categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Categories</h1>
      <ul className="space-y-2">
        {categories.map((cat) => (
          <li key={cat.id} className="p-2  rounded">
            <strong>{cat.name}</strong>: {cat.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoriesList;
