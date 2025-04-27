import React from "react";
import { Button } from "../../ui/button";
import { ScrollArea } from "../../ui/scroll-area";
import type { Tables } from "../../../db/database.types";
import { Loader2 } from "lucide-react";
import { cn } from "../../../lib/utils";

// Placeholder: Define specific icons for categories later if needed
// import { BookOpen, Code, Cpu, Tag } from 'lucide-react';

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
    // Use bg-white for cleaner look, rely on border-r
    <div className="w-64 border-r h-full flex-shrink-0 bg-white">
      <div className="h-full p-4 flex flex-col">
        {/* Adjusted title style */}
        <h2 className="text-base font-semibold mb-3 px-2 text-muted-foreground">Categories</h2>
        <ScrollArea className="flex-grow -mx-2">
          {" "}
          {/* Negative margin to allow full-width buttons */}
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : categories.length > 0 ? (
            // Added px-2 to counter negative margin
            <div className="space-y-1 px-2">
              {categories.map((category) => {
                const isActive = selectedCategoryId === category.id;
                return (
                  <Button
                    key={category.id}
                    variant={isActive ? "secondary" : "ghost"}
                    // Use cn to conditionally add active styles
                    className={cn(
                      "w-full justify-start relative",
                      isActive && "font-semibold" // Bold text when active
                    )}
                    onClick={() => onSelectCategory(category.id)}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                    )}
                    {/* Placeholder for category icon */}
                    {/* <Tag className="mr-2 h-4 w-4" /> */}
                    <span className={cn(isActive && "ml-2")}>{category.name}</span>{" "}
                    {/* Add margin-left if active indicator is shown */}
                  </Button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4 px-2 text-muted-foreground text-sm">
              No categories found.
              {/* TODO: Add button/link to create categories later */}
            </div>
          )}
        </ScrollArea>
        {/* Optional: Add Create Category button here later */}
        {/* <div className="mt-auto pt-4 border-t">
            <Button variant="outline" className="w-full">Create Category</Button>
        </div> */}
      </div>
    </div>
  );
};

export default DashboardSidebar;
