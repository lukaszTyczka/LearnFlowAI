import React from "react";
import { Button } from "../../ui/button";
import { ScrollArea } from "../../ui/scroll-area";
import type { Tables } from "../../../db/database.types";

type Category = Tables<"categories">;

interface DashboardSidebarProps {
  categories: Category[];
  isLoading: boolean;
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string) => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  categories,
  isLoading,
  selectedCategoryId,
  onSelectCategory,
}) => {
  return (
    <div className="w-64 border-r h-full">
      <div className="h-full p-4">
        <h2 className="text-lg font-semibold mb-4">Categories</h2>
        <ScrollArea className="h-[calc(100%-2rem)]">
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">
              Loading...
            </div>
          ) : categories.length > 0 ? (
            <div className="space-y-1 pr-4">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategoryId === category.id ? "secondary" : "ghost"
                  }
                  className="w-full justify-start"
                  onClick={() => onSelectCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No categories found.
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default DashboardSidebar;
