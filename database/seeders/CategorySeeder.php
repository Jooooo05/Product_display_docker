<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Elektronik'],
            ['name' => 'Fashion'],
            ['name' => 'Makanan'],
            ['name' => 'Minuman'],
            ['name' => 'Olahraga'],
            ['name' => 'Kesehatan'],
            ['name' => 'Otomotif'],
        ];

        DB::table('categories')->insert($categories);
    }
}
