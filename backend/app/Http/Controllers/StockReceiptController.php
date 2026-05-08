<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use App\Models\StockMovement;
use App\Models\StockReceipt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockReceiptController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            StockReceipt::with(['supplier:id,name', 'lines.menuItem:id,name,sku,image_url'])
                ->latest()->limit(100)->get()
        );
    }

    public function show(StockReceipt $stockReceipt): JsonResponse
    {
        return response()->json(
            $stockReceipt->load(['supplier', 'lines.menuItem:id,name,sku,image_url'])
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'supplier_id'           => 'nullable|exists:suppliers,id',
            'reference'             => 'nullable|string|max:255',
            'received_at'           => 'nullable|date',
            'notes'                 => 'nullable|string',
            'update_cost_price'     => 'nullable|boolean',
            'lines'                 => 'required|array|min:1',
            'lines.*.menu_item_id'  => 'required|exists:menu_items,id',
            'lines.*.qty'           => 'required|integer|min:1',
            'lines.*.unit_cost'     => 'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($data, $request) {
            $totalCost = 0;
            foreach ($data['lines'] as $row) {
                $totalCost += ((float) ($row['unit_cost'] ?? 0)) * (int) $row['qty'];
            }

            $receipt = StockReceipt::create([
                'supplier_id' => $data['supplier_id'] ?? null,
                'reference'   => $data['reference'] ?? null,
                'received_at' => $data['received_at'] ?? now()->toDateString(),
                'notes'       => $data['notes'] ?? null,
                'total_cost'  => round($totalCost, 2),
                'created_by'  => $request->user()?->name ?? 'admin',
            ]);

            $updateCost = (bool) ($data['update_cost_price'] ?? false);

            foreach ($data['lines'] as $row) {
                $mi = MenuItem::lockForUpdate()->find($row['menu_item_id']);
                if (!$mi) continue;

                $qty       = (int) $row['qty'];
                $unitCost  = (float) ($row['unit_cost'] ?? 0);
                $lineTotal = round($unitCost * $qty, 2);

                $receipt->lines()->create([
                    'menu_item_id' => $mi->id,
                    'qty'          => $qty,
                    'unit_cost'    => $unitCost,
                    'line_total'   => $lineTotal,
                ]);

                $before = (int) $mi->stock_qty;
                $after  = $before + $qty;

                $update = ['stock_qty' => $after];
                if ($updateCost && $unitCost > 0) {
                    $update['cost_price'] = $unitCost;
                }
                $mi->update($update);

                StockMovement::create([
                    'menu_item_id'   => $mi->id,
                    'qty_change'     => $qty,
                    'qty_before'     => $before,
                    'qty_after'      => $after,
                    'reason'         => 'Stock In' . ($data['reference'] ?? '' ? ' #' . $data['reference'] : ''),
                    'reference_type' => 'stock_receipt',
                    'reference_id'   => $receipt->id,
                    'user_label'     => $request->user()?->name ?? 'admin',
                ]);
            }

            return response()->json($receipt->load(['supplier', 'lines.menuItem:id,name,sku,image_url']), 201);
        });
    }

    public function destroy(Request $request, StockReceipt $stockReceipt): JsonResponse
    {
        return DB::transaction(function () use ($stockReceipt, $request) {
            foreach ($stockReceipt->lines as $line) {
                $mi = MenuItem::lockForUpdate()->find($line->menu_item_id);
                if (!$mi) continue;

                $before = (int) $mi->stock_qty;
                $after  = max(0, $before - (int) $line->qty);
                $mi->update(['stock_qty' => $after]);

                StockMovement::create([
                    'menu_item_id'   => $mi->id,
                    'qty_change'     => -(int) $line->qty,
                    'qty_before'     => $before,
                    'qty_after'      => $after,
                    'reason'         => 'Reverse Stock In',
                    'reference_type' => 'stock_receipt_reverse',
                    'reference_id'   => $stockReceipt->id,
                    'user_label'     => $request->user()?->name ?? 'admin',
                ]);
            }

            $stockReceipt->delete();
            return response()->json(null, 204);
        });
    }
}
