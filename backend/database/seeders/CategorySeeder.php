<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['slug' => 'all',      'name' => 'All Menus', 'emoji' => '🍽️', 'item_count' => 200, 'sort' => 1],
            ['slug' => 'seafood',  'name' => 'Sea Food',  'emoji' => '🦐', 'item_count' => 35,  'sort' => 2],
            ['slug' => 'pizza',    'name' => 'Pizza',     'emoji' => '🍕', 'item_count' => 180, 'sort' => 3],
            ['slug' => 'salads',   'name' => 'Salads',    'emoji' => '🥗', 'item_count' => 120, 'sort' => 4],
            ['slug' => 'tacos',    'name' => 'Tacos',     'emoji' => '🌮', 'item_count' => 150, 'sort' => 5],
            ['slug' => 'soups',    'name' => 'Soups',     'emoji' => '🍜', 'item_count' => 100, 'sort' => 6],
        ];

        foreach ($categories as $c) {
            Category::updateOrCreate(['slug' => $c['slug']], $c);
        }
    }
}
