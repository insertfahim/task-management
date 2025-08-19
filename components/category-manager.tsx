"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Edit, Trash2 } from "lucide-react"
import { createCategory, updateCategory, deleteCategory } from "@/lib/category-actions"

interface Category {
  id: string
  name: string
  color: string
}

interface CategoryManagerProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  onCategoriesUpdate: (categories: Category[]) => void
}

const predefinedColors = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#F97316", // Orange
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#EC4899", // Pink
  "#6B7280", // Gray
]

export default function CategoryManager({ isOpen, onClose, categories, onCategoriesUpdate }: CategoryManagerProps) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryColor, setNewCategoryColor] = useState(predefinedColors[0])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return

    setIsSubmitting(true)
    try {
      const newCategory = await createCategory({
        name: newCategoryName.trim(),
        color: newCategoryColor,
      })

      if (newCategory) {
        onCategoriesUpdate([...categories, newCategory])
        setNewCategoryName("")
        setNewCategoryColor(predefinedColors[0])
      }
    } catch (error) {
      console.error("Failed to create category:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) return

    setIsSubmitting(true)
    try {
      const updatedCategory = await updateCategory(editingCategory.id, {
        name: editingCategory.name.trim(),
        color: editingCategory.color,
      })

      if (updatedCategory) {
        onCategoriesUpdate(categories.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat)))
        setEditingCategory(null)
      }
    } catch (error) {
      console.error("Failed to update category:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category? Tasks in this category will become uncategorized.")) {
      return
    }

    try {
      await deleteCategory(categoryId)
      onCategoriesUpdate(categories.filter((cat) => cat.id !== categoryId))
    } catch (error) {
      console.error("Failed to delete category:", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create New Category */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <h3 className="font-medium">Create New Category</h3>

                <div className="space-y-2">
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input
                    id="categoryName"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter category name..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex gap-2 flex-wrap">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${
                          newCategoryColor === color ? "border-foreground" : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewCategoryColor(color)}
                      />
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleCreateCategory}
                  disabled={isSubmitting || !newCategoryName.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Creating..." : "Create Category"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Existing Categories */}
          <div className="space-y-2">
            <h3 className="font-medium">Existing Categories</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {categories.map((category) => (
                <Card key={category.id}>
                  <CardContent className="p-3">
                    {editingCategory?.id === category.id ? (
                      <div className="space-y-3">
                        <Input
                          value={editingCategory.name}
                          onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                        />
                        <div className="flex gap-2 flex-wrap">
                          {predefinedColors.map((color) => (
                            <button
                              key={color}
                              type="button"
                              className={`w-6 h-6 rounded-full border-2 ${
                                editingCategory.color === color ? "border-foreground" : "border-transparent"
                              }`}
                              style={{ backgroundColor: color }}
                              onClick={() => setEditingCategory({ ...editingCategory, color })}
                            />
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleUpdateCategory} disabled={isSubmitting}>
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingCategory(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingCategory(category)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCategory(category.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
