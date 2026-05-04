<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_no')->unique();
            $table->string('customer_name')->nullable();
            $table->enum('type', ['dinein', 'takeaway', 'delivery', 'table'])->default('dinein');
            $table->enum('status', ['pending', 'preparing', 'ready', 'completed', 'cancelled'])->default('pending');
            $table->string('table_no')->nullable();
            $table->string('waiter')->nullable();
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->decimal('tax', 10, 2)->default(0);
            $table->decimal('total', 10, 2)->default(0);
            $table->unsignedInteger('progress')->default(0);
            $table->unsignedInteger('eta_minutes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
