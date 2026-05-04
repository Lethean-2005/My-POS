<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MenuItem extends Model
{
    protected $fillable = [
        'category_id', 'name', 'category_label', 'price',
        'is_veg', 'is_egg', 'badge', 'image_url', 'active',
    ];

    protected $casts = [
        'price'   => 'float',
        'is_veg'  => 'bool',
        'is_egg'  => 'bool',
        'active'  => 'bool',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
