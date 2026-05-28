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
            ['name' => 'Laptop'],
            ['name' => 'Smartphone'],
            ['name' => 'Tablet'],
            ['name' => 'Monitor'],
            ['name' => 'Keyboard'],
            ['name' => 'Mouse'],
            ['name' => 'Headphone'],
            ['name' => 'Speaker'],
        ];

        DB::table('categories')->insert($categories);
    }
}
