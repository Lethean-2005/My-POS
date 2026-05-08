<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use App\Models\Order;
use App\Models\Setting;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    private function taxRate(): float
    {
        return ((float) Setting::get('tax_rate', 18)) / 100;
    }

    public function index(): JsonResponse
    {
        return response()->json(Order::with('items')->latest()->get());
    }

    public function recent(): JsonResponse
    {
        return response()->json(
            Order::latest()->limit(8)->get()
        );
    }

    public function show(Order $order): JsonResponse
    {
        return response()->json($order->load('items'));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'customer_name'        => 'nullable|string|max:255',
            'type'                 => 'required|in:dinein,takeaway,delivery,table',
            'table_no'             => 'nullable|string|max:50',
            'waiter'               => 'nullable|string|max:255',
            'items'                => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity'     => 'required|integer|min:1',
            'items.*.size'         => 'nullable|string',
            'items.*.note'         => 'nullable|string',
        ]);

        return DB::transaction(function () use ($data) {
            $menuItems = MenuItem::whereIn('id', collect($data['items'])->pluck('menu_item_id'))
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            foreach ($data['items'] as $row) {
                $mi = $menuItems[$row['menu_item_id']] ?? null;
                if (!$mi) {
                    throw ValidationException::withMessages([
                        'items' => "Menu item {$row['menu_item_id']} not found.",
                    ]);
                }
                if ($mi->stock_qty < $row['quantity']) {
                    throw ValidationException::withMessages([
                        'items' => "{$mi->name} has only {$mi->stock_qty} in stock (requested {$row['quantity']}).",
                    ]);
                }
            }

            $order = Order::create([
                'order_no'      => $this->generateOrderNo(),
                'customer_name' => $data['customer_name'] ?? null,
                'type'          => $data['type'],
                'table_no'      => $data['table_no'] ?? null,
                'waiter'        => $data['waiter'] ?? null,
                'status'        => 'pending',
            ]);

            $subtotal = 0;
            foreach ($data['items'] as $row) {
                $mi = $menuItems[$row['menu_item_id']];
                $lineTotal = $mi->price * $row['quantity'];
                $subtotal += $lineTotal;

                $order->items()->create([
                    'menu_item_id' => $mi->id,
                    'name'         => $mi->name,
                    'size'         => $row['size'] ?? null,
                    'image_url'    => $mi->image_url,
                    'quantity'     => $row['quantity'],
                    'item_price'   => $mi->price,
                    'total'        => $lineTotal,
                    'note'         => $row['note'] ?? null,
                ]);

                $before = $mi->stock_qty;
                $mi->decrement('stock_qty', $row['quantity']);

                StockMovement::create([
                    'menu_item_id'   => $mi->id,
                    'qty_change'     => -$row['quantity'],
                    'qty_before'     => $before,
                    'qty_after'      => $before - $row['quantity'],
                    'reason'         => 'Sale',
                    'reference_type' => 'order',
                    'reference_id'   => $order->id,
                    'user_label'     => 'cashier',
                ]);
            }

            $tax = round($subtotal * $this->taxRate(), 2);
            $order->update([
                'subtotal' => $subtotal,
                'tax'      => $tax,
                'total'    => $subtotal + $tax,
            ]);

            return response()->json($order->load('items'), 201);
        });
    }

    public function refund(Request $request, Order $order): JsonResponse
    {
        $data = $request->validate([
            'reason' => 'nullable|string|max:255',
        ]);

        if ($order->status === 'refunded') {
            return response()->json(['message' => 'Order already refunded.'], 422);
        }

        return DB::transaction(function () use ($order, $data, $request) {
            foreach ($order->items as $line) {
                if (!$line->menu_item_id) continue;
                $mi = MenuItem::lockForUpdate()->find($line->menu_item_id);
                if (!$mi) continue;

                $before = $mi->stock_qty;
                $mi->increment('stock_qty', $line->quantity);

                StockMovement::create([
                    'menu_item_id'   => $mi->id,
                    'qty_change'     => $line->quantity,
                    'qty_before'     => $before,
                    'qty_after'      => $before + $line->quantity,
                    'reason'         => 'Refund: ' . ($data['reason'] ?? 'no reason'),
                    'reference_type' => 'order_refund',
                    'reference_id'   => $order->id,
                    'user_label'     => $request->user()?->name ?? 'admin',
                ]);
            }

            $order->update(['status' => 'refunded']);
            return response()->json($order->fresh()->load('items'));
        });
    }

    private function generateOrderNo(): string
    {
        return '#' . str_pad((string) random_int(10000, 99999), 5, '0', STR_PAD_LEFT);
    }
}
