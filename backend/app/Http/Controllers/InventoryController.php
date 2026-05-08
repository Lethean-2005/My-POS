<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\MenuItem;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    public function summary(): JsonResponse
    {
        $items = MenuItem::with('category')->get();

        $totalSkus      = $items->count();
        $activeSkus     = $items->where('active', true)->count();
        $totalUnits     = (int) $items->sum('stock_qty');
        $stockValueCost = (float) $items->sum(fn ($m) => (float) $m->cost_price * (int) $m->stock_qty);
        $stockValueRetail = (float) $items->sum(fn ($m) => (float) $m->price * (int) $m->stock_qty);

        $outOfStock = $items->filter(fn ($m) => $m->stock_qty <= 0)->values();
        $lowStock   = $items->filter(fn ($m) => $m->stock_qty > 0 && $m->stock_qty <= ($m->low_stock_threshold ?? 5))
                            ->sortBy('stock_qty')
                            ->values();

        $byCategory = $items->groupBy('category_id')->map(function ($group, $catId) {
            $cat = $group->first()->category;
            return [
                'category_id'   => $catId ?: null,
                'category_name' => $cat?->name ?? 'Uncategorized',
                'sku_count'     => $group->count(),
                'units'         => (int) $group->sum('stock_qty'),
                'value_cost'    => round((float) $group->sum(fn ($m) => (float) $m->cost_price * (int) $m->stock_qty), 2),
                'value_retail'  => round((float) $group->sum(fn ($m) => (float) $m->price * (int) $m->stock_qty), 2),
            ];
        })->values();

        return response()->json([
            'totals' => [
                'total_skus'        => $totalSkus,
                'active_skus'       => $activeSkus,
                'total_units'       => $totalUnits,
                'low_stock_count'   => $lowStock->count(),
                'out_of_stock_count'=> $outOfStock->count(),
                'stock_value_cost'  => round($stockValueCost, 2),
                'stock_value_retail'=> round($stockValueRetail, 2),
                'potential_margin'  => round($stockValueRetail - $stockValueCost, 2),
            ],
            'low_stock'    => $lowStock->map(fn ($m) => $this->compact($m)),
            'out_of_stock' => $outOfStock->map(fn ($m) => $this->compact($m)),
            'by_category'  => $byCategory,
        ]);
    }

    public function movements(Request $request): JsonResponse
    {
        $query = StockMovement::with('menuItem:id,name,sku,image_url')
            ->orderByDesc('created_at');

        if ($pid = $request->query('product_id')) {
            $query->where('menu_item_id', (int) $pid);
        }
        if ($reason = $request->query('reason')) {
            $query->where('reason', 'like', "%{$reason}%");
        }
        if ($refType = $request->query('reference_type')) {
            $query->where('reference_type', $refType);
        }
        if ($from = $request->query('from')) {
            $query->where('created_at', '>=', $from . ' 00:00:00');
        }
        if ($to = $request->query('to')) {
            $query->where('created_at', '<=', $to . ' 23:59:59');
        }

        $limit = min(500, max(10, (int) $request->query('limit', 200)));

        return response()->json($query->limit($limit)->get());
    }

    public function bulkReceive(Request $request): JsonResponse
    {
        $data = $request->validate([
            'reason'              => 'nullable|string|max:255',
            'reference_type'      => 'nullable|string|max:64',
            'lines'               => 'required|array|min:1',
            'lines.*.menu_item_id'=> 'required|exists:menu_items,id',
            'lines.*.qty_change'  => 'required|integer|not_in:0',
        ]);

        $reason  = $data['reason'] ?? 'Stock receipt';
        $refType = $data['reference_type'] ?? 'bulk_receive';

        return DB::transaction(function () use ($data, $reason, $refType, $request) {
            $applied = [];
            foreach ($data['lines'] as $row) {
                $mi = MenuItem::lockForUpdate()->find($row['menu_item_id']);
                if (!$mi) continue;

                $before = (int) $mi->stock_qty;
                $after  = $before + (int) $row['qty_change'];
                if ($after < 0) {
                    return response()->json([
                        'message' => "Adjustment for {$mi->name} would go below zero (current {$before}).",
                    ], 422);
                }

                $mi->update(['stock_qty' => $after]);

                StockMovement::create([
                    'menu_item_id'   => $mi->id,
                    'qty_change'     => (int) $row['qty_change'],
                    'qty_before'     => $before,
                    'qty_after'      => $after,
                    'reason'         => $reason,
                    'reference_type' => $refType,
                    'reference_id'   => null,
                    'user_label'     => $request->user()?->name ?? 'admin',
                ]);

                $applied[] = ['id' => $mi->id, 'name' => $mi->name, 'before' => $before, 'after' => $after];
            }

            return response()->json([
                'applied' => $applied,
                'count'   => count($applied),
            ]);
        });
    }

    private function compact(MenuItem $m): array
    {
        return [
            'id'                  => $m->id,
            'name'                => $m->name,
            'sku'                 => $m->sku,
            'category_id'         => $m->category_id,
            'category_label'      => $m->category_label,
            'image_url'           => $m->image_url,
            'stock_qty'           => (int) $m->stock_qty,
            'low_stock_threshold' => (int) ($m->low_stock_threshold ?? 5),
            'price'               => (float) $m->price,
            'cost_price'          => (float) $m->cost_price,
        ];
    }
}
