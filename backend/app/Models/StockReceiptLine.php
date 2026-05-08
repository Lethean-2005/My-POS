<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockReceiptLine extends Model
{
    protected $fillable = [
        'stock_receipt_id', 'menu_item_id', 'qty', 'unit_cost', 'line_total',
    ];

    protected $casts = [
        'qty'        => 'integer',
        'unit_cost'  => 'float',
        'line_total' => 'float',
    ];

    public function receipt(): BelongsTo
    {
        return $this->belongsTo(StockReceipt::class, 'stock_receipt_id');
    }

    public function menuItem(): BelongsTo
    {
        return $this->belongsTo(MenuItem::class);
    }
}
