<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MenuItemController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = MenuItem::query()->where('active', true);

        if ($category = $request->query('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $category));
        }

        if ($search = $request->query('q')) {
            $query->where('name', 'like', "%{$search}%");
        }

        return response()->json($query->orderBy('id')->get());
    }

    public function show(MenuItem $menuItem): JsonResponse
    {
        return response()->json($menuItem);
    }
}
