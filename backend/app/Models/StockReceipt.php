<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StockReceipt extends Model
{
    protected $fillable = [
        'supplier_id', 'reference', 'received_at', 'notes', 'total_cost', 'created_by',
    ];

    protected $casts = [
        'received_at' => 'date',
        'total_cost'  => 'float',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function lines(): HasMany
    {
        return $this->hasMany(StockReceiptLine::class);
    }
}
