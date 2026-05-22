<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    // ─────────────────────────────────────────────
    // GET /categories
    // ─────────────────────────────────────────────

    public function index(): JsonResponse
    {
        $categories = Category::withCount('products')
            ->orderBy('name')
            ->get();

        return response()->json($categories);
    }

    // ─────────────────────────────────────────────
    // POST /categories
    // ─────────────────────────────────────────────

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:categories,name'],
        ]);

        $category = Category::create($validated);

        return response()->json($category, 201);
    }

    // ─────────────────────────────────────────────
    // GET /categories/{id}
    // ─────────────────────────────────────────────

    public function show(Category $category): JsonResponse
    {
        return response()->json(
            $category->loadCount('products')
        );
    }

    // ─────────────────────────────────────────────
    // PUT /categories/{id}
    // ─────────────────────────────────────────────

    public function update(Request $request, Category $category): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:categories,name,' . $category->id],
        ]);

        $category->update($validated);

        return response()->json($category);
    }

    // ─────────────────────────────────────────────
    // DELETE /categories/{id}
    // ─────────────────────────────────────────────

    public function destroy(Category $category): JsonResponse
    {
        // Detach semua produk dari kategori ini sebelum delete
        $category->products()->detach();
        $category->delete();

        return response()->json(['message' => 'Category deleted successfully']);
    }
}