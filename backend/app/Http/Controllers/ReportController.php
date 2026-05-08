<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $from = $request->query('from')
            ? Carbon::parse($request->query('from'))->startOfDay()
            : now()->subDays(29)->startOfDay();
        $to = $request->query('to')
            ? Carbon::parse($request->query('to'))->endOfDay()
            : now()->endOfDay();

        $base = Order::whereBetween('created_at', [$from, $to]);

        $totals = [
            'orders'           => (clone $base)->count(),
            'revenue'          => round((float) (clone $base)->sum('total'), 2),
            'subtotal'         => round((float) (clone $base)->sum('subtotal'), 2),
            'tax'              => round((float) (clone $base)->sum('tax'), 2),
            'avg_order_value'  => 0,
            'items_sold'       => (int) OrderItem::whereHas('order', fn ($q) => $q->whereBetween('created_at', [$from, $to]))->sum('quantity'),
            'refunded_count'   => (clone $base)->where('status', 'refunded')->count(),
        ];
        $totals['avg_order_value'] = $totals['orders'] > 0
            ? round($totals['revenue'] / $totals['orders'], 2)
            : 0;

        $byDay = (clone $base)
            ->select(
                DB::raw("strftime('%Y-%m-%d', created_at) as day"),
                DB::raw('COUNT(*) as orders'),
                DB::raw('COALESCE(SUM(total), 0) as revenue')
            )
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        $byType = (clone $base)
            ->select('type', DB::raw('COUNT(*) as orders'), DB::raw('COALESCE(SUM(total), 0) as revenue'))
            ->groupBy('type')
            ->get();

        $byCategory = OrderItem::query()
            ->whereHas('order', fn ($q) => $q->whereBetween('created_at', [$from, $to]))
            ->leftJoin('menu_items', 'order_items.menu_item_id', '=', 'menu_items.id')
            ->leftJoin('categories', 'menu_items.category_id', '=', 'categories.id')
            ->select(
                DB::raw('COALESCE(categories.name, menu_items.category_label, "Uncategorized") as category'),
                DB::raw('SUM(order_items.quantity) as qty'),
                DB::raw('COALESCE(SUM(order_items.total), 0) as revenue')
            )
            ->groupBy('category')
            ->orderByDesc('revenue')
            ->get();

        $topItems = OrderItem::query()
            ->whereHas('order', fn ($q) => $q->whereBetween('created_at', [$from, $to]))
            ->select('name', DB::raw('SUM(quantity) as qty'), DB::raw('COALESCE(SUM(total), 0) as revenue'))
            ->groupBy('name')
            ->orderByDesc('qty')
            ->limit(10)
            ->get();

        $items = MenuItem::all();
        $inventory = [
            'units'       => (int) $items->sum('stock_qty'),
            'value_cost'  => round((float) $items->sum(fn ($m) => (float) $m->cost_price * (int) $m->stock_qty), 2),
            'value_retail'=> round((float) $items->sum(fn ($m) => (float) $m->price      * (int) $m->stock_qty), 2),
            'low_stock'   => $items->filter(fn ($m) => $m->stock_qty > 0 && $m->stock_qty <= ($m->low_stock_threshold ?? 5))->count(),
            'out_of_stock'=> $items->filter(fn ($m) => $m->stock_qty <= 0)->count(),
        ];

        return response()->json([
            'range'       => ['from' => $from->toDateString(), 'to' => $to->toDateString()],
            'totals'      => $totals,
            'by_day'      => $byDay,
            'by_type'     => $byType,
            'by_category' => $byCategory,
            'top_items'   => $topItems,
            'inventory'   => $inventory,
        ]);
    }
}
