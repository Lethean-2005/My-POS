<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MenuItem extends Model
{
    protected $fillable = [
        'category_id', 'name', 'sku', 'barcode', 'category_label',
        'price', 'cost_price', 'stock_qty', 'low_stock_threshold',
        'is_veg', 'is_egg', 'badge', 'image_url', 'images', 'description', 'active',
    ];

    protected $casts = [
        'price'               => 'float',
        'cost_price'          => 'float',
        'stock_qty'           => 'integer',
        'low_stock_threshold' => 'integer',
        'is_veg'              => 'bool',
        'is_egg'              => 'bool',
        'active'              => 'bool',
        'images'              => 'array',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function isOutOfStock(): bool
    {
        return $this->stock_qty <= 0;
    }

    public function isLowStock(): bool
    {
        return $this->stock_qty > 0 && $this->stock_qty <= $this->low_stock_threshold;
    }
}
