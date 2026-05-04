<?php

namespace Database\Seeders;

use App\Models\Order;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $orders = [
            ['order_no' => '#4589', 'customer_name' => 'James Smith',     'type' => 'delivery', 'eta_minutes' => 12, 'progress' => 70, 'total' => 14.25],
            ['order_no' => '#5698', 'customer_name' => 'Maria Gonzalez',  'type' => 'takeaway', 'eta_minutes' => 8,  'progress' => 50, 'total' => 18.40],
            ['order_no' => '#9989', 'customer_name' => "Liam O'Connor",   'type' => 'dinein',   'table_no' => '1',   'progress' => 90, 'total' => 13.45],
            ['order_no' => '#9089', 'customer_name' => 'Sophia Kim',      'type' => 'delivery', 'eta_minutes' => 15, 'progress' => 40, 'total' => 22.60],
        ];

        foreach ($orders as $o) {
            Order::updateOrCreate(['order_no' => $o['order_no']], $o);
        }
    }
}
