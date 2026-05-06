<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Category::orderBy('sort')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validateInput($request);
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);
        $data['sort'] = $data['sort'] ?? (Category::max('sort') + 1);
        $category = Category::create($data);
        return response()->json($category, 201);
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        $data = $this->validateInput($request, $category);
        $category->update($data);

        if ($request->has('name') && $category->wasChanged('name')) {
            \App\Models\MenuItem::where('category_id', $category->id)
                ->update(['category_label' => $category->name]);
        }

        return response()->json($category->fresh());
    }

    public function destroy(Category $category): JsonResponse
    {
        if ($category->slug === 'all') {
            return response()->json(['message' => "The 'all' category cannot be deleted."], 422);
        }
        $category->delete();
        return response()->json(null, 204);
    }

    private function validateInput(Request $request, ?Category $existing = null): array
    {
        $slugRule = 'nullable|string|max:64|unique:categories,slug';
        if ($existing) {
            $slugRule .= ',' . $existing->id;
        }

        return $request->validate([
            'name'       => 'required|string|max:255',
            'slug'       => $slugRule,
            'icon'       => 'nullable|string|max:32',
            'image_url'  => 'nullable|url|max:1024',
            'item_count' => 'nullable|integer|min:0',
            'sort'       => 'nullable|integer|min:0',
        ]);
    }
}
