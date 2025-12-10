"use client";

import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";

import { getSimilarCategories } from "@/actions/problem-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/lib/hooks/use-debounce";
import type { Category } from "@/lib/queries";

interface CategoryInputProps {
  value: {
    type: "existing" | "new";
    categoryId?: string;
    name?: string;
    emoji?: string;
  };
  onChange: (value: {
    type: "existing" | "new";
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [similarCategories, setSimilarCategories] = useState<Category[]>([]);
  const [selectedEmoji, setSelectedEmoji] = useState(value.emoji || "📁");

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Search for similar categories when user types
  useEffect(() => {
    if (debouncedSearchTerm.trim().length > 0) {
      getSimilarCategories(debouncedSearchTerm).then((result) => {
        if (result.success && result.categories) {
          setSimilarCategories(result.categories);
        }
      });
    } else {
      setSimilarCategories([]);
    }
  }, [debouncedSearchTerm]);

  // Filter existing categories based on search term
  const filteredCategories = existingCategories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleCategorySelect = (category: Category) => {
    onChange({
      type: "existing",
      categoryId: category.id,
      name: category.name,
      emoji: category.emoji,
    });
    setSearchTerm(category.name);
    setShowDropdown(false);
  };

  const handleCreateNew = () => {
    if (searchTerm.trim()) {
      onChange({
        type: "new",
        name: searchTerm.trim(),
        emoji: selectedEmoji,
      });
      setShowDropdown(false);
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setSelectedEmoji(emojiData.emoji);
    if (value.type === "new") {
      onChange({
        ...value,
        emoji: emojiData.emoji,
      });
    }
    setShowEmojiPicker(false);
  };

  const displayValue =
    value.type === "existing"
      ? existingCategories.find((c) => c.id === value.categoryId)?.name ||
        searchTerm
      : value.name || searchTerm;

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Search or create category..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
              // Reset to new category when typing
              if (value.type === "existing") {
                onChange({
                  type: "new",
                  name: e.target.value,
                  emoji: selectedEmoji,
                });
              }
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
              {filteredCategories.length > 0 && (
                <div>
                  <div className="text-muted-foreground px-3 py-2 text-xs font-semibold">
                    Existing Categories
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
                      {value.type === "existing" &&
                        value.categoryId === category.id && (
                          <Check className="ml-auto h-4 w-4" />
                        )}
                    </button>
                  ))}
                </div>
              )}

              {/* Similar categories warning */}
              {searchTerm.trim() &&
                similarCategories.length > 0 &&
                !filteredCategories.some(
                  (c) => c.name.toLowerCase() === searchTerm.toLowerCase(),
                ) && (
                  <div>
                    <div className="px-3 py-2 text-xs font-semibold text-yellow-600 dark:text-yellow-500">
                      Similar Categories Found
                    </div>
                    {similarCategories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        className="hover:bg-accent flex w-full items-center gap-2 px-3 py-2 text-left text-yellow-700 dark:text-yellow-400"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleCategorySelect(category);
                        }}
                      >
                        <span>{category.emoji}</span>
                        <span>{category.name}</span>
                        <span className="ml-auto text-xs">
                          Use this instead?
                        </span>
                      </button>
                    ))}
                  </div>
                )}

              {/* Create new option */}
              {searchTerm.trim() && (
                <div>
                  <div className="text-muted-foreground px-3 py-2 text-xs font-semibold">
                    Create New
                  </div>
                  <button
                    type="button"
                    className="hover:bg-accent flex w-full items-center gap-2 px-3 py-2 text-left"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleCreateNew();
                    }}
                  >
                    <span>{selectedEmoji}</span>
                    <span>Create &quot;{searchTerm}&quot;</span>
                  </button>
                </div>
              )}

              {/* Empty state */}
              {filteredCategories.length === 0 && !searchTerm.trim() && (
                <div className="text-muted-foreground px-3 py-6 text-center text-sm">
                  Type to search or create a category
                </div>
              )}
            </div>
          )}
        </div>

        {/* Emoji picker button */}
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            className="px-3"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            {selectedEmoji}
          </Button>
          {showEmojiPicker && (
            <div className="absolute top-full right-0 z-50 mt-1">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && <p className="text-destructive mt-1 text-sm">{error}</p>}

      {/* Selected category display */}
      {value.type === "existing" && value.categoryId && (
        <p className="text-muted-foreground mt-1 text-sm">
          Selected:{" "}
          {existingCategories.find((c) => c.id === value.categoryId)?.emoji}{" "}
          {existingCategories.find((c) => c.id === value.categoryId)?.name}
        </p>
      )}
      {value.type === "new" && value.name && (
        <p className="text-muted-foreground mt-1 text-sm">
          Creating new: {value.emoji} {value.name}
        </p>
      )}
    </div>
  );
}
