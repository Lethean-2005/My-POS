<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['slug' => 'all',       'name' => 'All Items',  'icon' => 'cart',       'item_count' => 200, 'sort' => 1, 'image_url' => null],
            ['slug' => 'audio',     'name' => 'Audio',      'icon' => 'headphones', 'item_count' => 45,  'sort' => 2, 'image_url' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80'],
            ['slug' => 'cables',    'name' => 'Cables',     'icon' => 'plug',       'item_count' => 60,  'sort' => 3, 'image_url' => 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=200&q=80'],
            ['slug' => 'chargers',  'name' => 'Chargers',   'icon' => 'bolt',       'item_count' => 40,  'sort' => 4, 'image_url' => 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200&q=80'],
            ['slug' => 'wearables', 'name' => 'Wearables',  'icon' => 'watch',      'item_count' => 25,  'sort' => 5, 'image_url' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80'],
            ['slug' => 'computer',  'name' => 'Computer',   'icon' => 'laptop',     'item_count' => 80,  'sort' => 6, 'image_url' => 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=200&q=80'],
        ];

        foreach ($categories as $c) {
            Category::updateOrCreate(['slug' => $c['slug']], $c);
        }
    }
}
