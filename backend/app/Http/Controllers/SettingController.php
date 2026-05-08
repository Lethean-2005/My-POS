<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Setting::all_kv());
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'store_name'                  => 'nullable|string|max:255',
            'currency'                    => 'nullable|string|max:8',
            'tax_rate'                    => 'nullable|numeric|min:0|max:100',
            'receipt_footer'              => 'nullable|string|max:1000',
            'default_low_stock_threshold' => 'nullable|integer|min:0|max:10000',
            'store_phone'                 => 'nullable|string|max:64',
            'store_address'               => 'nullable|string|max:512',
        ]);

        foreach ($data as $key => $value) {
            Setting::set($key, $value);
        }

        return response()->json(Setting::all_kv());
    }
}
