"use client";

import { Check } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import type { Category } from "@/lib/queries";

interface CategoryInputProps {
  value: {
    categoryId?: string;
    name?: string;
    emoji?: string;
  };
  onChange: (value: {
    categoryId?: string;
    name?: string;
    emoji?: string;
  }) => void;
  existingCategories: Category[];
  error?: string;
}

export function CategoryInput({
  value,
  onChange,
  existingCategories,
  error,
}: CategoryInputProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Filter existing categories based on search term
  const filteredCategories = existingCategories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleCategorySelect = (category: Category) => {
    onChange({
      categoryId: category.id,
      name: category.name,
      emoji: category.emoji,
    });
    setSearchTerm(category.name);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <div className="relative flex-1">
        <Input
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => {
            // Delay to allow clicking dropdown items
            setTimeout(() => setShowDropdown(false), 200);
          }}
        />
        {showDropdown && (
          <div className="bg-background absolute top-full right-0 left-0 z-50 mt-1 max-h-64 overflow-y-auto rounded-md border shadow-lg">
            {/* Existing categories */}
            {filteredCategories.length > 0 ? (
              <div>
                <div className="text-muted-foreground px-3 py-2 text-xs font-semibold">
                  Categories
                </div>
                {filteredCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    className="hover:bg-accent flex w-full items-center gap-2 px-3 py-2 text-left"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleCategorySelect(category);
                    }}
                  >
                    <span>{category.emoji}</span>
                    <span>{category.name}</span>
                    {value.categoryId === category.id && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground px-3 py-6 text-center text-sm">
                {searchTerm.trim()
                  ? "No categories found"
                  : "Type to search categories"}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && <p className="text-destructive mt-1 text-sm">{error}</p>}

      {/* Selected category display */}
      {value.categoryId && (
        <p className="text-muted-foreground mt-1 text-sm">
          Selected:{" "}
          {existingCategories.find((c) => c.id === value.categoryId)?.emoji}{" "}
          {existingCategories.find((c) => c.id === value.categoryId)?.name}
        </p>
      )}
    </div>
  );
}
