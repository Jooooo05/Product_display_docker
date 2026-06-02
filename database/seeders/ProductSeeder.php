<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;


class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categoryIds = DB::table('categories')->pluck('id')->toArray();

        $products = [
            // Laptop — harga tinggi
            ['name' => 'MacBook Air M2', 'original_price' => 18000000, 'dealer_price' => 16000000],
            ['name' => 'MacBook Pro M3', 'original_price' => 25000000, 'dealer_price' => 23000000],
            ['name' => 'ASUS ROG Zephyrus G14', 'original_price' => 22000000, 'dealer_price' => 20000000],
            ['name' => 'Lenovo ThinkPad X1 Carbon', 'original_price' => 20000000, 'dealer_price' => 18500000],
            ['name' => 'Dell XPS 15', 'original_price' => 24000000, 'dealer_price' => 22000000],

            // Smartphone — harga menengah
            ['name' => 'iPhone 15 Pro', 'original_price' => 17000000, 'dealer_price' => 15500000],
            ['name' => 'Samsung Galaxy S24', 'original_price' => 14000000, 'dealer_price' => 12500000],
            ['name' => 'Google Pixel 8', 'original_price' => 12000000, 'dealer_price' => 11000000],
            ['name' => 'Xiaomi 14', 'original_price' => 9000000, 'dealer_price' => 8000000],
            ['name' => 'OPPO Find X7', 'original_price' => 10000000, 'dealer_price' => 9000000],

            // Tablet
            ['name' => 'iPad Pro M2', 'original_price' => 16000000, 'dealer_price' => 14500000],
            ['name' => 'Samsung Galaxy Tab S9', 'original_price' => 12000000, 'dealer_price' => 11000000],
            ['name' => 'Xiaomi Pad 6', 'original_price' => 5000000, 'dealer_price' => 4500000],

            // Monitor
            ['name' => 'LG UltraWide 34"', 'original_price' => 8000000, 'dealer_price' => 7000000],
            ['name' => 'Samsung Odyssey G7', 'original_price' => 9000000, 'dealer_price' => 8000000],
            ['name' => 'Dell UltraSharp 27"', 'original_price' => 7000000, 'dealer_price' => 6500000],

            // Aksesoris — harga rendah
            ['name' => 'Logitech MX Keys', 'original_price' => 1500000, 'dealer_price' => 1300000],
            ['name' => 'Logitech MX Master 3', 'original_price' => 1200000, 'dealer_price' => 1000000],
            ['name' => 'Sony WH-1000XM5', 'original_price' => 4500000, 'dealer_price' => 4000000],
            ['name' => 'JBL Flip 6', 'original_price' => 1800000, 'dealer_price' => 1600000],

            // Tambahan supaya pagination aktif (lebih dari 20)
            ['name' => 'Razer BlackWidow V4', 'original_price' => 1700000, 'dealer_price' => 1500000],
            ['name' => 'HyperX Cloud Alpha', 'original_price' => 1300000, 'dealer_price' => 1100000],
            ['name' => 'ASUS ZenBook 14', 'original_price' => 13000000, 'dealer_price' => 12000000],
            ['name' => 'Acer Predator Helios 300', 'original_price' => 19000000, 'dealer_price' => 17000000],
            ['name' => 'Samsung Galaxy A54', 'original_price' => 5000000, 'dealer_price' => 4500000],
        ];

        foreach ($products as $index => $product) {
            $productId = DB::table('products')->insertGetId([
                'name'           => $product['name'],
                'description'    => 'Deskripsi lengkap untuk produk ' . $product['name'] . '. Produk berkualitas tinggi dengan garansi resmi.',
                'features'       => 'Fitur utama untuk ' . $product['name'] . ': Performa tinggi, Desain elegan, Baterai tahan lama.',
                'specifications' => 'Spesifikasi teknis untuk ' . $product['name'] . ': Prosesor terbaru, RAM besar, Penyimpanan cepat.',
                'sku'            => 'SKU-' . strtoupper(Str::random(8)),
                'original_price' => $product['original_price'],
                'dealer_price'   => $product['dealer_price'],
                'image'          => null,
                'status'         => 'Active',
                'stock_status'   => ['available', 'low_stock', 'out_of_stock'][$index % 3],
                'created_at'     => now(),
                'updated_at'     => now(),
            ]);

            // Assign 1-2 kategori random per produk
            $assigned = array_slice(
                array: $categoryIds,
                offset: array_rand($categoryIds),
                length: rand(1, 2)
            );

            foreach ($assigned as $categoryId) {
                DB::table('category_product')->insert([
                    'product_id'  => $productId,
                    'category_id' => $categoryId,
                ]);
            }
        }

    }
}
