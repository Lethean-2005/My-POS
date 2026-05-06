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
            ['name' => 'Wireless Earbuds',     'sku' => 'AUD-001', 'barcode' => '8901234500001', 'category_label' => 'Audio',     'price' => 80,  'cost_price' => 45,  'stock_qty' => 25, 'badge' => 'Trending', 'image_url' => 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&q=80'],
            ['name' => 'Over-Ear Headphones',  'sku' => 'AUD-002', 'barcode' => '8901234500002', 'category_label' => 'Audio',     'price' => 66,  'cost_price' => 35,  'stock_qty' => 18, 'badge' => 'Must Try', 'image_url' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80'],
            ['name' => 'USB-C Cable',          'sku' => 'CAB-001', 'barcode' => '8901234500003', 'category_label' => 'Cables',    'price' => 25,  'cost_price' => 8,   'stock_qty' => 60, 'image_url' => 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&q=80'],
            ['name' => 'HDMI Cable',           'sku' => 'CAB-002', 'barcode' => '8901234500004', 'category_label' => 'Cables',    'price' => 33,  'cost_price' => 12,  'stock_qty' => 40, 'image_url' => 'https://images.unsplash.com/photo-1601524909162-ae8725290836?w=400&q=80'],
            ['name' => 'Smart Watch',          'sku' => 'WEA-001', 'barcode' => '8901234500005', 'category_label' => 'Wearables', 'price' => 44,  'cost_price' => 22,  'stock_qty' => 12, 'image_url' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80'],
            ['name' => 'Power Bank 20K mAh',   'sku' => 'CHG-001', 'barcode' => '8901234500006', 'category_label' => 'Chargers',  'price' => 66,  'cost_price' => 30,  'stock_qty' => 3,  'image_url' => 'https://loremflickr.com/400/300/power,bank,battery/all'],
            ['name' => 'Wireless Charger',     'sku' => 'CHG-002', 'barcode' => '8901234500007', 'category_label' => 'Chargers',  'price' => 36,  'cost_price' => 16,  'stock_qty' => 22, 'image_url' => 'https://images.unsplash.com/photo-1592434134753-a70baf7979d5?w=400&q=80'],
            ['name' => 'Laptop Stand',         'sku' => 'CMP-001', 'barcode' => '8901234500008', 'category_label' => 'Computer',  'price' => 49,  'cost_price' => 22,  'stock_qty' => 14, 'badge' => 'Must Try', 'image_url' => 'https://images.unsplash.com/photo-1611174743420-3d7df880ce32?w=400&q=80'],
            ['name' => 'Fast Charger 65W',     'sku' => 'CHG-003', 'barcode' => '8901234500009', 'category_label' => 'Chargers',  'price' => 69,  'cost_price' => 32,  'stock_qty' => 0,  'image_url' => 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&q=80'],
            ['name' => 'HD Webcam',            'sku' => 'CMP-002', 'barcode' => '8901234500010', 'category_label' => 'Computer',  'price' => 56,  'cost_price' => 25,  'stock_qty' => 9,  'image_url' => 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80'],
            ['name' => 'RGB Mouse Pad',        'sku' => 'CMP-003', 'barcode' => '8901234500011', 'category_label' => 'Computer',  'price' => 96,  'cost_price' => 40,  'stock_qty' => 16, 'image_url' => 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&q=80'],
            ['name' => 'Mechanical Keyboard',  'sku' => 'CMP-004', 'barcode' => '8901234500012', 'category_label' => 'Computer',  'price' => 45,  'cost_price' => 22,  'stock_qty' => 11, 'image_url' => 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&q=80'],
            ['name' => 'Bluetooth Speaker',    'sku' => 'AUD-003', 'barcode' => '8901234500013', 'category_label' => 'Audio',     'price' => 80,  'cost_price' => 38,  'stock_qty' => 7,  'image_url' => 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80'],
            ['name' => 'Gaming Mouse',         'sku' => 'CMP-005', 'barcode' => '8901234500014', 'category_label' => 'Computer',  'price' => 110, 'cost_price' => 55,  'stock_qty' => 5,  'image_url' => 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80'],
            ['name' => 'USB-C Hub 7-in-1',     'sku' => 'CAB-003', 'barcode' => '8901234500015', 'category_label' => 'Cables',    'price' => 84,  'cost_price' => 38,  'stock_qty' => 19, 'image_url' => 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&q=80'],
        ];

        foreach ($items as $i) {
            $slug = $map[$i['category_label']] ?? null;
            $i['category_id'] = $slug ? ($catBySlug[$slug] ?? null) : null;
            $i['is_veg'] = false;
            $i['is_egg'] = false;
            $i['low_stock_threshold'] = $i['low_stock_threshold'] ?? 5;
            $i['images'] = $i['image_url'] ? [$i['image_url']] : [];
            MenuItem::create($i);
        }
    }
}
