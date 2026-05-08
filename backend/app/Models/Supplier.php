<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    protected $fillable = [
        'name', 'contact_name', 'email', 'phone', 'address', 'notes', 'active',
    ];

    protected $casts = [
        'active' => 'bool',
    ];

    public function receipts(): HasMany
    {
        return $this->hasMany(StockReceipt::class);
    }
}
