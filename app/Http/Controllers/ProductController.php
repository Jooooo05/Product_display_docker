<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
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

        $query = Product::with('categories')->latest();

        // Filter by categories
        if ($request->has('categories')) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->whereIn('categories.id', $request->categories);
            });
        }

        // Filter by price range
        if ($request->has('price_min')) {
            $query->where('original_price', '>=', $request->price_min);
        }

        if ($request->has('price_max')) {
            $query->where('original_price', '<=', $request->price_max);
        }

        // Search
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%');
            });
        }

        $products = $query->paginate($request->get('per_page', 20));

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
            'features'       => ['required', 'string', 'min:10'],
            'specifications' => ['required', 'string', 'min:10'],
            'sku'            => ['nullable', 'string', 'max:50', 'unique:products,sku'],
            'original_price' => ['required', 'integer', 'min:0'],
            'dealer_price'   => ['nullable', 'integer', 'min:0'],
            'status'         => ['sometimes', Rule::in(['Active', 'Inactive', 'Draft'])],
            'stock_status'   => ['sometimes', Rule::in(['available', 'low_stock', 'out_of_stock'])],
            'categories'     => ['sometimes', 'array'],
            'categories.*'   => ['integer', 'exists:categories,id'], 
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

        $validated['created_by'] = Auth::id();
        $validated['edited_by'] = Auth::id();

        $product = Product::create($validated);

        // Sync categories (create if not exists)
        // Sync categories
        if (!empty($validated['categories'])) {
            $product->categories()->sync($validated['categories']); // ← langsung pakai, tidak perlu resolve
        }

        return response()->json(
            $product->load('categories'),
            201
        );
    }

    // ─────────────────────────────────────────────
    // GET /products/{id}
    // ─────────────────────────────────────────────

    public function show($id): JsonResponse
    {
        $product = Product::with('categories')->findOrFail($id);
        return response()->json($product);
    }

    // ─────────────────────────────────────────────
    // PUT /products/{id}
    // ─────────────────────────────────────────────

    public function update(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'name'           => ['sometimes', 'string', 'min:3', 'max:100'],
            'description'    => ['sometimes', 'string', 'min:10'],
            'features'       => ['sometimes', 'string', 'min:10'],
            'specifications' => ['sometimes', 'string', 'min:10'],
            'sku'            => ['nullable', 'string', 'max:50', Rule::unique('products', 'sku')->ignore($product->id)],
            'original_price' => ['sometimes', 'integer', 'min:0'],
            'dealer_price'   => ['nullable', 'integer', 'min:0'],
            'status'         => ['sometimes', Rule::in(['Active', 'Inactive', 'Draft'])],
            'stock_status'   => ['sometimes', Rule::in(['available', 'low_stock', 'out_of_stock'])],
            'categories'     => ['sometimes', 'array'],
            'categories.*'   => ['integer', 'exists:categories,id'], 
            'image'          => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        // Handle image upload — delete old file if replaced
        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $validated['image'] = $request->file('image')->store('products', 'public');
        }
        $validated['edited_by'] = Auth::id();

        $product->update($validated);

        // Tangani dua kondisi sekaligus
        if (isset($validated['categories'])) {
            $product->categories()->sync($validated['categories']); // array kosong pun akan detach semua
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