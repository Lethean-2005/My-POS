<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    private const TAX_RATE = 0.18;

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
                $menuItem = MenuItem::findOrFail($row['menu_item_id']);
                $lineTotal = $menuItem->price * $row['quantity'];
                $subtotal += $lineTotal;

                $order->items()->create([
                    'menu_item_id' => $menuItem->id,
                    'name'         => $menuItem->name,
                    'size'         => $row['size'] ?? null,
                    'image_url'    => $menuItem->image_url,
                    'quantity'     => $row['quantity'],
                    'item_price'   => $menuItem->price,
                    'total'        => $lineTotal,
                    'note'         => $row['note'] ?? null,
                ]);
            }

            $tax = round($subtotal * self::TAX_RATE, 2);
            $order->update([
                'subtotal' => $subtotal,
                'tax'      => $tax,
                'total'    => $subtotal + $tax,
            ]);

            return response()->json($order->load('items'), 201);
        });
    }

    private function generateOrderNo(): string
    {
        return '#' . str_pad((string) random_int(10000, 99999), 5, '0', STR_PAD_LEFT);
    }
}
