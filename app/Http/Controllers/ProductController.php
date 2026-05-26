<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    // ─────────────────────────────────────────────
    // GET /products
    // ─────────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $user = $request->user(); // null kalau tidak login

        $products = Product::with('categories')
            ->latest()
            ->paginate(15);

        //Transform bedasarkan siapa yang request

        return response()->json($products);
    }

    // ─────────────────────────────────────────────
    // POST /products
    // ─────────────────────────────────────────────

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'           => ['required', 'string', 'min:3', 'max:100'],
            'description'    => ['required', 'string', 'min:10'],
            'sku'            => ['nullable', 'string', 'max:50', 'unique:products,sku'],
            'original_price' => ['required', 'integer', 'min:0'],
            'dealer_price'   => ['nullable', 'integer', 'min:0'],
            'status'         => ['sometimes', Rule::in(['Active', 'Inactive', 'Draft'])],
            'stock_status'   => ['sometimes', Rule::in(['available', 'low_stock', 'out_of_stock'])],
            'categories'     => ['sometimes', 'array'],
            'categories.*'   => ['string'],
            'image'          => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        // Auto-generate SKU if not provided
        if (empty($validated['sku'])) {
            $validated['sku'] = $this->generateSku($validated['name']);
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $product = Product::create($validated);

        // Sync categories (create if not exists)
        if (!empty($validated['categories'])) {
            $categoryIds = $this->resolveCategoryIds($validated['categories']);
            $product->categories()->sync($categoryIds);
        }

        return response()->json(
            $product->load('categories'),
            201
        );
    }

    // ─────────────────────────────────────────────
    // GET /products/{id}
    // ─────────────────────────────────────────────

    public function show(Product $product): JsonResponse
    {
        return response()->json(
            $product->load('categories')
        );
    }

    // ─────────────────────────────────────────────
    // PUT /products/{id}
    // ─────────────────────────────────────────────

    public function update(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'name'           => ['sometimes', 'string', 'min:3', 'max:100'],
            'description'    => ['sometimes', 'string', 'min:10'],
            'sku'            => ['nullable', 'string', 'max:50', Rule::unique('products', 'sku')->ignore($product->id)],
            'original_price' => ['sometimes', 'integer', 'min:0'],
            'dealer_price'   => ['nullable', 'integer', 'min:0'],
            'status'         => ['sometimes', Rule::in(['Active', 'Inactive', 'Draft'])],
            'stock_status'   => ['sometimes', Rule::in(['available', 'low_stock', 'out_of_stock'])],
            'categories'     => ['sometimes', 'array'],
            'categories.*'   => ['string'],
            'image'          => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        // Handle image upload — delete old file if replaced
        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($validated);

        // Sync categories
        if (isset($validated['categories'])) {
            $categoryIds = $this->resolveCategoryIds($validated['categories']);
            $product->categories()->sync($categoryIds);
        }

        return response()->json(
            $product->load('categories')
        );
    }

    // ─────────────────────────────────────────────
    // DELETE /products/{id}
    // ─────────────────────────────────────────────

    public function destroy(Product $product): JsonResponse
    {
        $product->delete(); // soft delete

        return response()->json(['message' => 'Product deleted successfully']);
    }

    // ─────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────

    /**
     * Resolve category names → IDs, creating missing ones.
     */
    private function resolveCategoryIds(array $names): array
    {
        return collect($names)
            ->map(fn (string $name) => Category::firstOrCreate(['name' => $name])->id)
            ->toArray();
    }

    /**
     * Generate a unique SKU from the product name.
     * e.g. "Apple MacBook Air" → "SKU-APL-A1B2"
     */
    private function generateSku(string $name): string
    {
        $prefix = strtoupper(substr(preg_replace('/[^a-zA-Z]/', '', $name), 0, 3));
        $suffix = strtoupper(Str::random(4));
        $sku    = "SKU-{$prefix}-{$suffix}";

        // Ensure uniqueness
        while (Product::where('sku', $sku)->exists()) {
            $sku = 'SKU-' . $prefix . '-' . strtoupper(Str::random(4));
        }

        return $sku;
    }
}