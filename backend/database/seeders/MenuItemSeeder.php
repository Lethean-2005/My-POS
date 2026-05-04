<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\MenuItem;
use Illuminate\Database\Seeder;

class MenuItemSeeder extends Seeder
{
    public function run(): void
    {
        $catBySlug = Category::pluck('id', 'slug');
        $map = [
            'Sea Food'  => 'seafood',
            'Pizza'     => 'pizza',
            'Salads'    => 'salads',
            'Tacos'     => 'tacos',
            'Soups'     => 'soups',
            'Sushi'     => 'seafood',
            'Beverages' => null,
        ];

        $items = [
            ['name' => 'Grilled Salmon Steak', 'category_label' => 'Sea Food',  'price' => 80,  'is_veg' => false, 'badge' => 'Trending', 'image_url' => 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80'],
            ['name' => 'Cheese Burst Pizza',   'category_label' => 'Pizza',     'price' => 66,  'is_veg' => true,  'badge' => 'Must Try', 'image_url' => 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80'],
            ['name' => 'Garlic Butter Shrimp', 'category_label' => 'Sea Food',  'price' => 25,  'is_veg' => false, 'image_url' => 'https://images.unsplash.com/photo-1625943553852-781c6dd46faa?w=400&q=80'],
            ['name' => 'Chicken Taco',         'category_label' => 'Tacos',     'price' => 33,  'is_veg' => false, 'image_url' => 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80'],
            ['name' => 'Tomato Basil Soup',    'category_label' => 'Soups',     'price' => 44,  'is_veg' => true,  'image_url' => 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80'],
            ['name' => 'Vegetable Roll',       'category_label' => 'Sushi',     'price' => 66,  'is_veg' => true,  'image_url' => 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&q=80'],
            ['name' => 'Lemon Mint Juice',     'category_label' => 'Beverages', 'price' => 36,  'is_veg' => true,  'image_url' => 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80'],
            ['name' => 'Grilled Veggie Taco',  'category_label' => 'Tacos',     'price' => 49,  'is_veg' => true,  'badge' => 'Must Try', 'image_url' => 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=400&q=80'],
            ['name' => 'Chicken Taco',         'category_label' => 'Tacos',     'price' => 69,  'is_veg' => false, 'is_egg' => true, 'image_url' => 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=400&q=80'],
            ['name' => 'Shrimp Tom Yum',       'category_label' => 'Soups',     'price' => 56,  'is_veg' => false, 'image_url' => 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=400&q=80'],
            ['name' => 'Corn Pizza',           'category_label' => 'Pizza',     'price' => 96,  'is_veg' => true,  'image_url' => 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80'],
            ['name' => 'Chicken Noodle Soup',  'category_label' => 'Soups',     'price' => 45,  'is_veg' => false, 'image_url' => 'https://images.unsplash.com/photo-1547308283-b941c1cb91d2?w=400&q=80'],
            ['name' => 'Lobster Thermidor',    'category_label' => 'Sea Food',  'price' => 80,  'is_veg' => false, 'image_url' => 'https://images.unsplash.com/photo-1625944525533-473f1b3d9684?w=400&q=80'],
            ['name' => 'Quinoa Salad',         'category_label' => 'Salads',    'price' => 110, 'is_veg' => true,  'image_url' => 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=400&q=80'],
            ['name' => 'Hot Chocolate',        'category_label' => 'Beverages', 'price' => 84,  'is_veg' => true,  'image_url' => 'https://images.unsplash.com/photo-1542990253-0b8be07d4d51?w=400&q=80'],
        ];

        foreach ($items as $i) {
            $slug = $map[$i['category_label']] ?? null;
            $i['category_id'] = $slug ? ($catBySlug[$slug] ?? null) : null;
            $i['is_egg'] = $i['is_egg'] ?? false;
            MenuItem::create($i);
        }
    }
}
