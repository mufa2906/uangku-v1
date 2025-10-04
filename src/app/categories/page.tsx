// src/app/categories/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Category } from '@/types';
import AppBottomNav from '@/components/shells/AppBottomNav';

export default function CategoriesPage() {
  const { userId } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState({ name: '', type: 'expense' as 'income' | 'expense', icon: '' });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchCategories();
    }
  }, [userId]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        setError('Failed to load categories');
      }
    } catch (err) {
      setError('Error loading categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      });

      if (response.ok) {
        const createdCategory = await response.json();
        setCategories([...categories, createdCategory]);
        setNewCategory({ name: '', type: 'expense', icon: '' });
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create category');
      }
    } catch (err) {
      setError('Error creating category');
      console.error('Error creating category:', err);
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCategory) return;
    
    try {
      const response = await fetch(`/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingCategory.name,
          type: editingCategory.type,
          icon: editingCategory.icon,
        }),
      });

      if (response.ok) {
        const updatedCategory = await response.json();
        setCategories(categories.map(cat => 
          cat.id === updatedCategory.id ? updatedCategory : cat
        ));
        setEditingCategory(null);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update category');
      }
    } catch (err) {
      setError('Error updating category');
      console.error('Error updating category:', err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/categories/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setCategories(categories.filter(cat => cat.id !== id));
          setError(null);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to delete category');
        }
      } catch (err) {
        setError('Error deleting category');
        console.error('Error deleting category:', err);
      }
    }
  };

  const startEditing = (category: Category) => {
    setEditingCategory(category);
  };

  const cancelEditing = () => {
    setEditingCategory(null);
  };

  const formatCategoryType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="pb-20"> {/* Space for bottom nav */}
      <div className="p-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Categories</h1>

        {/* Add Category Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Category</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    value={editingCategory ? editingCategory.name : newCategory.name}
                    onChange={(e) => 
                      editingCategory 
                        ? setEditingCategory({...editingCategory, name: e.target.value}) 
                        : setNewCategory({...newCategory, name: e.target.value})
                    }
                    placeholder="Category name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={editingCategory ? editingCategory.type : newCategory.type}
                    onChange={(e) => 
                      editingCategory 
                        ? setEditingCategory({...editingCategory, type: e.target.value as 'income' | 'expense'}) 
                        : setNewCategory({...newCategory, type: e.target.value as 'income' | 'expense'})
                    }
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
              </div>
              
              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}
              
              <div className="flex gap-2">
                {editingCategory ? (
                  <>
                    <Button type="submit">Update Category</Button>
                    <Button type="button" variant="outline" onClick={cancelEditing}>Cancel</Button>
                  </>
                ) : (
                  <Button type="submit">Add Category</Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Categories List */}
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading categories...</div>
        ) : categories.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-gray-500">
              <p>No categories yet.</p>
              <p className="mt-2">Add your first category to get started!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map(category => (
              <Card key={category.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{category.name}</div>
                      <div className="text-sm text-gray-500">{formatCategoryType(category.type)}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => startEditing(category)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <AppBottomNav />
    </div>
  );
}