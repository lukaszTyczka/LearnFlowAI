import React, { useEffect, useState } from "react";
import { useSupabase } from "../context/SupabaseContext";

interface Category {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

const CategoriesList: React.FC = () => {
  const { supabase } = useSupabase();
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("categories").select("*");
      if (error) {
        setError(error.message);
      } else {
        setCategories(data as Category[]);
      }
      setLoading(false);
    };

    fetchCategories();
  }, [supabase]);

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
