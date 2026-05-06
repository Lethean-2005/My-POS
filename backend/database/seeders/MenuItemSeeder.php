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
            'Audio'     => 'audio',
            'Cables'    => 'cables',
            'Chargers'  => 'chargers',
            'Wearables' => 'wearables',
            'Computer'  => 'computer',
        ];

        $items = [
            ['name' => 'Wireless Earbuds',     'category_label' => 'Audio',     'price' => 80,  'badge' => 'Trending', 'image_url' => 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&q=80'],
            ['name' => 'Over-Ear Headphones',  'category_label' => 'Audio',     'price' => 66,  'badge' => 'Must Try', 'image_url' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80'],
            ['name' => 'USB-C Cable',          'category_label' => 'Cables',    'price' => 25,  'image_url' => 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&q=80'],
            ['name' => 'HDMI Cable',           'category_label' => 'Cables',    'price' => 33,  'image_url' => 'https://images.unsplash.com/photo-1601524909162-ae8725290836?w=400&q=80'],
            ['name' => 'Smart Watch',          'category_label' => 'Wearables', 'price' => 44,  'image_url' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80'],
            ['name' => 'Power Bank 20K mAh',   'category_label' => 'Chargers',  'price' => 66,  'image_url' => 'https://loremflickr.com/400/300/power,bank,battery/all'],
            ['name' => 'Wireless Charger',     'category_label' => 'Chargers',  'price' => 36,  'image_url' => 'https://images.unsplash.com/photo-1592434134753-a70baf7979d5?w=400&q=80'],
            ['name' => 'Laptop Stand',         'category_label' => 'Computer',  'price' => 49,  'badge' => 'Must Try', 'image_url' => 'https://images.unsplash.com/photo-1611174743420-3d7df880ce32?w=400&q=80'],
            ['name' => 'Fast Charger 65W',     'category_label' => 'Chargers',  'price' => 69,  'image_url' => 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&q=80'],
            ['name' => 'HD Webcam',            'category_label' => 'Computer',  'price' => 56,  'image_url' => 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80'],
            ['name' => 'RGB Mouse Pad',        'category_label' => 'Computer',  'price' => 96,  'image_url' => 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&q=80'],
            ['name' => 'Mechanical Keyboard',  'category_label' => 'Computer',  'price' => 45,  'image_url' => 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&q=80'],
            ['name' => 'Bluetooth Speaker',    'category_label' => 'Audio',     'price' => 80,  'image_url' => 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80'],
            ['name' => 'Gaming Mouse',         'category_label' => 'Computer',  'price' => 110, 'image_url' => 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80'],
            ['name' => 'USB-C Hub 7-in-1',     'category_label' => 'Cables',    'price' => 84,  'image_url' => 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&q=80'],
        ];

        foreach ($items as $i) {
            $slug = $map[$i['category_label']] ?? null;
            $i['category_id'] = $slug ? ($catBySlug[$slug] ?? null) : null;
            $i['is_veg'] = false;
            $i['is_egg'] = false;
            MenuItem::create($i);
        }
    }
}
