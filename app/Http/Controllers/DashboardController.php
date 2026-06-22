<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Main dashboard summary.
     * GET /dashboard
     */
    public function index(): JsonResponse
    {
        // ─── Products ────────────────────────────────────────────────────────
        $totalProducts = Product::count();

        $productsByStatus = Product::selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();

        $productsByStockStatus = Product::selectRaw('stock_status, COUNT(*) as total')
            ->groupBy('stock_status')
            ->pluck('total', 'stock_status')
            ->toArray();

        // ─── Categories ──────────────────────────────────────────────────────
        $totalCategories = Category::count();

        // ─── Users (grouped by role via Spatie) ──────────────────────────────
        $totalUsers = User::count();

        $usersByRole = User::with('roles')
            ->get()
            ->flatMap(fn($user) => $user->roles->pluck('name'))
            ->countBy()
            ->toArray();

        // ─── Most Viewed Products (top 5) ────────────────────────────────────
        $mostViewed = Product::with('categories:id,name')
            ->orderByDesc('view_count')
            ->limit(6)
            ->get()
            ->map(fn($product) => [
                'id'         => $product->id,
                'name'       => $product->name,
                'sku'        => $product->sku,
                'image_url'  => $product->image_url,
                'view_count' => $product->view_count,
                'status'     => $product->status,
                'categories' => $product->categories->map(fn($c) => [
                    'id'   => $c->id,
                    'name' => $c->name,
                ]),
            ]);

        // ─── Response ────────────────────────────────────────────────────────
        return response()->json([
            'products' => [
                'total'     => $totalProducts,
                'by_status' => [
                    'active'   => $productsByStatus['Active']   ?? 0,
                    'inactive' => $productsByStatus['Inactive'] ?? 0,
                    'draft'    => $productsByStatus['Draft']    ?? 0,
                ],
                'by_stock'  => [
                    'available'    => $productsByStockStatus['available']    ?? 0,
                    'low_stock'    => $productsByStockStatus['low_stock']    ?? 0,
                    'out_of_stock' => $productsByStockStatus['out_of_stock'] ?? 0,
                ],
                'most_viewed' => $mostViewed,
            ],
            'categories' => [
                'total' => $totalCategories,
            ],
            'users' => [
                'total'   => $totalUsers,
                'by_role' => $usersByRole,
            ],
        ]);
    }

    /**
     * Product list with filters for dashboard table.
     * GET /dashboard/products
     *
     * Query params:
     *   - status       : Active | Inactive | Draft
     *   - stock_status : available | low_stock | out_of_stock
     *   - category_id  : int
     *   - per_page     : int (default 10)
     */
    public function products(Request $request): JsonResponse
    {
        $query = Product::with(['categories:id,name', 'createdBy:id,name']);
        // withTrashed() dihapus — exclude soft deleted products

        // ─── Filters ─────────────────────────────────────────────────────────
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('stock_status')) {
            $query->where('stock_status', $request->input('stock_status'));
        }

        if ($request->filled('category_id')) {
            $query->whereHas('categories', fn($q) =>
                $q->where('categories.id', $request->input('category_id'))
            );
        }

        // ─── Sorting (latest first) ───────────────────────────────────────────
        $query->latest();

        $products = $query->paginate($request->input('per_page', 10));

        // ─── Transform ───────────────────────────────────────────────────────
        $products->getCollection()->transform(function (Product $product) {
            return [
                'id'               => $product->id,
                'name'             => $product->name,
                'sku'              => $product->sku,
                'image_url'        => $product->image_url,
                'original_price'   => $product->original_price,
                'dealer_price'     => $product->dealer_price,
                'discount_percent' => $product->discount_percent,
                'status'           => $product->status,
                'stock_status'     => $product->stock_status,
                'categories'       => $product->categories->map(fn($c) => [
                    'id'   => $c->id,
                    'name' => $c->name,
                ]),
                'created_by'       => $product->createdBy?->name,
                'created_at'       => $product->created_at->toDateTimeString(),
            ];
        });

        return response()->json($products);
    }
}