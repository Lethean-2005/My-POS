<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['slug' => 'all',       'name' => 'All Items',  'emoji' => '🛒', 'item_count' => 200, 'sort' => 1],
            ['slug' => 'audio',     'name' => 'Audio',      'emoji' => '🎧', 'item_count' => 45,  'sort' => 2],
            ['slug' => 'cables',    'name' => 'Cables',     'emoji' => '🔌', 'item_count' => 60,  'sort' => 3],
            ['slug' => 'chargers',  'name' => 'Chargers',   'emoji' => '⚡', 'item_count' => 40,  'sort' => 4],
            ['slug' => 'wearables', 'name' => 'Wearables',  'emoji' => '⌚', 'item_count' => 25,  'sort' => 5],
            ['slug' => 'computer',  'name' => 'Computer',   'emoji' => '💻', 'item_count' => 80,  'sort' => 6],
        ];

        foreach ($categories as $c) {
            Category::updateOrCreate(['slug' => $c['slug']], $c);
        }
    }
}
