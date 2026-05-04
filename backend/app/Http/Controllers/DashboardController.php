<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $today = now()->startOfDay();

        $todayOrders   = Order::where('created_at', '>=', $today)->count();
        $todayRevenue  = (float) Order::where('created_at', '>=', $today)->sum('total');
        $totalOrders   = Order::count();
        $totalRevenue  = (float) Order::sum('total');
        $itemsSoldToday = (int) OrderItem::whereHas('order', fn ($q) => $q->where('created_at', '>=', $today))
            ->sum('quantity');
        $menuCount     = MenuItem::where('active', true)->count();

        $byType = Order::select('type', DB::raw('COUNT(*) as count'))
            ->groupBy('type')
            ->pluck('count', 'type');

        $last7 = Order::select(
                DB::raw("strftime('%Y-%m-%d', created_at) as day"),
                DB::raw('COUNT(*) as orders'),
                DB::raw('COALESCE(SUM(total), 0) as revenue')
            )
            ->where('created_at', '>=', now()->subDays(6)->startOfDay())
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        $topItems = OrderItem::select('name', DB::raw('SUM(quantity) as qty'), DB::raw('SUM(total) as revenue'))
            ->groupBy('name')
            ->orderByDesc('qty')
            ->limit(5)
            ->get();

        $recent = Order::with('items')->latest()->limit(6)->get();

        return response()->json([
            'stats' => [
                'today_orders'    => $todayOrders,
                'today_revenue'   => round($todayRevenue, 2),
                'total_orders'    => $totalOrders,
                'total_revenue'   => round($totalRevenue, 2),
                'items_sold_today'=> $itemsSoldToday,
                'menu_count'      => $menuCount,
            ],
            'by_type'    => $byType,
            'last_7_days'=> $last7,
            'top_items'  => $topItems,
            'recent'     => $recent,
        ]);
    }
}
