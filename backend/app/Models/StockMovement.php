<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMovement extends Model
{
    protected $fillable = [
        'menu_item_id', 'qty_change', 'qty_before', 'qty_after',
        'reason', 'reference_type', 'reference_id', 'user_label',
    ];

    protected $casts = [
        'qty_change' => 'integer',
        'qty_before' => 'integer',
        'qty_after'  => 'integer',
    ];

    public function menuItem(): BelongsTo
    {
        return $this->belongsTo(MenuItem::class);
    }
}
