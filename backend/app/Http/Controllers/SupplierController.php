<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Supplier::withCount('receipts')->orderBy('name');

        if (!$request->boolean('all', true)) {
            $query->where('active', true);
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validateInput($request);
        $supplier = Supplier::create($data);
        return response()->json($supplier, 201);
    }

    public function update(Request $request, Supplier $supplier): JsonResponse
    {
        $data = $this->validateInput($request, $supplier);
        $supplier->update($data);
        return response()->json($supplier->fresh());
    }

    public function destroy(Supplier $supplier): JsonResponse
    {
        $supplier->delete();
        return response()->json(null, 204);
    }

    private function validateInput(Request $request, ?Supplier $existing = null): array
    {
        return $request->validate([
            'name'         => 'required|string|max:255',
            'contact_name' => 'nullable|string|max:255',
            'email'        => 'nullable|email|max:255',
            'phone'        => 'nullable|string|max:64',
            'address'      => 'nullable|string|max:512',
            'notes'        => 'nullable|string',
            'active'       => 'nullable|boolean',
        ]);
    }
}
