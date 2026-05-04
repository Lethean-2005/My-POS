<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'order_no', 'customer_name', 'type', 'status', 'table_no', 'waiter',
        'subtotal', 'tax', 'total', 'progress', 'eta_minutes',
    ];

    protected $casts = [
        'subtotal' => 'float',
        'tax'      => 'float',
        'total'    => 'float',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
