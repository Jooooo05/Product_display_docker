<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([RolePermissionSeeder::class, CategorySeeder::class]);

        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',  
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'role' => 'Super Admin',
                'status' => 'active',
            ]
        );

        $user->assignRole('Super Admin');
        
    }
}
