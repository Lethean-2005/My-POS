<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|image|mimes:jpg,jpeg,png,webp,gif|max:5120',
            'folder' => 'nullable|string|max:32',
        ]);

        $folder = preg_replace('/[^a-z0-9-]/i', '', $request->input('folder', 'products')) ?: 'products';
        $file   = $request->file('file');
        $name   = Str::ulid() . '.' . strtolower($file->getClientOriginalExtension());
        $path   = $file->storeAs("uploads/{$folder}", $name, 'public');

        return response()->json([
            'path' => $path,
            'url'  => url(Storage::url($path)),
        ], 201);
    }
}
