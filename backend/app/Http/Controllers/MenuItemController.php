<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MenuItemController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = MenuItem::query();

        if (!$request->boolean('all')) {
            $query->where('active', true);
        }

        if ($category = $request->query('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $category));
        }

        if ($search = $request->query('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        return response()->json($query->orderBy('id')->get());
    }

    public function show(MenuItem $menuItem): JsonResponse
    {
        return response()->json($menuItem);
    }

    public function movements(MenuItem $menuItem): JsonResponse
    {
        return response()->json(
            $menuItem->stockMovements()->latest()->limit(50)->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validateInput($request);
        $data['category_label'] = $data['category_label'] ?? $this->categoryLabelFromId($data['category_id'] ?? null);
        $data = $this->syncImages($data);

        if (empty($data['sku'])) {
            $data['sku'] = $this->generateSku($data['category_id'] ?? null);
        }

        return DB::transaction(function () use ($data, $request) {
            $initialStock = (int) ($data['stock_qty'] ?? 0);
            $item = MenuItem::create($data);

            if ($initialStock > 0) {
                StockMovement::create([
                    'menu_item_id'   => $item->id,
                    'qty_change'     => $initialStock,
                    'qty_before'     => 0,
                    'qty_after'      => $initialStock,
                    'reason'         => 'Initial stock',
                    'reference_type' => 'create',
                    'reference_id'   => $item->id,
                    'user_label'     => $request->user()?->name ?? 'admin',
                ]);
            }

            return response()->json($item, 201);
        });
    }

    public function update(Request $request, MenuItem $menuItem): JsonResponse
    {
        $data = $this->validateInput($request, $menuItem);
        if (array_key_exists('category_id', $data)) {
            $data['category_label'] = $data['category_label']
                ?? $this->categoryLabelFromId($data['category_id']);
        }

        // Stock adjustments belong on the dedicated endpoint; ignore stock_qty changes here.
        unset($data['stock_qty']);

        $data = $this->syncImages($data);

        $menuItem->update($data);
        return response()->json($menuItem->fresh());
    }

    private function syncImages(array $data): array
    {
        if (array_key_exists('images', $data)) {
            $images = array_values(array_filter($data['images'] ?? [], fn ($v) => is_string($v) && $v !== ''));
            $data['images'] = $images;
            $data['image_url'] = $images[0] ?? null;
        }
        return $data;
    }

    public function destroy(MenuItem $menuItem): JsonResponse
    {
        $menuItem->delete();
        return response()->json(null, 204);
    }

    public function adjustStock(Request $request, MenuItem $menuItem): JsonResponse
    {
        $data = $request->validate([
            'qty_change' => 'required|integer|not_in:0',
            'reason'     => 'required|string|max:255',
        ]);

        return DB::transaction(function () use ($data, $menuItem, $request) {
            $before = $menuItem->stock_qty;
            $after  = $before + $data['qty_change'];

            if ($after < 0) {
                return response()->json([
                    'message' => "Adjustment would push {$menuItem->name} below zero (current: {$before}).",
                ], 422);
            }

            $menuItem->update(['stock_qty' => $after]);

            StockMovement::create([
                'menu_item_id'   => $menuItem->id,
                'qty_change'     => $data['qty_change'],
                'qty_before'     => $before,
                'qty_after'      => $after,
                'reason'         => $data['reason'],
                'reference_type' => 'adjustment',
                'reference_id'   => $menuItem->id,
                'user_label'     => $request->user()?->name ?? 'admin',
            ]);

            return response()->json($menuItem->fresh());
        });
    }

    private function validateInput(Request $request, ?MenuItem $existing = null): array
    {
        $skuRule = 'nullable|string|max:64|unique:menu_items,sku';
        if ($existing) {
            $skuRule .= ',' . $existing->id;
        }

        return $request->validate([
            'name'                => 'required|string|max:255',
            'sku'                 => $skuRule,
            'barcode'             => 'nullable|string|max:64',
            'category_id'         => 'nullable|exists:categories,id',
            'category_label'      => 'nullable|string|max:255',
            'price'               => 'required|numeric|min:0',
            'cost_price'          => 'nullable|numeric|min:0',
            'stock_qty'           => 'nullable|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'badge'               => 'nullable|string|max:64',
            'image_url'           => 'nullable|url|max:1024',
            'images'              => 'nullable|array|max:10',
            'images.*'            => 'string|max:1024',
            'description'         => 'nullable|string',
            'active'              => 'nullable|boolean',
        ]);
    }

    private function categoryLabelFromId($id): ?string
    {
        if (!$id) return null;
        return \App\Models\Category::find($id)?->name;
    }

    private function generateSku($categoryId): string
    {
        $prefix = 'ITM';
        if ($categoryId) {
            $name = \App\Models\Category::find($categoryId)?->name;
            if ($name) {
                $clean = strtoupper(preg_replace('/[^A-Za-z]/', '', $name));
                if ($clean !== '') {
                    $prefix = substr($clean, 0, 3);
                }
            }
        }

        $maxNum = MenuItem::where('sku', 'like', $prefix . '-%')
            ->get()
            ->map(function ($m) use ($prefix) {
                $tail = substr($m->sku, strlen($prefix) + 1);
                return is_numeric($tail) ? (int) $tail : 0;
            })
            ->max() ?: 0;

        do {
            $maxNum++;
            $sku = $prefix . '-' . str_pad((string) $maxNum, 3, '0', STR_PAD_LEFT);
        } while (MenuItem::where('sku', $sku)->exists());

        return $sku;
    }
}
