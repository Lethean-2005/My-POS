<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('app_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        $now = now();
        DB::table('app_settings')->insert([
            ['key' => 'store_name',                 'value' => 'Dreams POS',           'created_at' => $now, 'updated_at' => $now],
            ['key' => 'currency',                   'value' => '$',                    'created_at' => $now, 'updated_at' => $now],
            ['key' => 'tax_rate',                   'value' => '18',                   'created_at' => $now, 'updated_at' => $now],
            ['key' => 'receipt_footer',             'value' => 'Thank you for your purchase!', 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'default_low_stock_threshold','value' => '5',                    'created_at' => $now, 'updated_at' => $now],
            ['key' => 'store_phone',                'value' => '',                     'created_at' => $now, 'updated_at' => $now],
            ['key' => 'store_address',              'value' => '',                     'created_at' => $now, 'updated_at' => $now],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('app_settings');
    }
};
