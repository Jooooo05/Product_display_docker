<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $guardName = 'web';

        // Definisi Permissions per Module
        // Format: 'module_name' => ['action1', 'action2', ...]
        $permissionsByModule = [
            'user-management' => [
                'access', //akses menu
                'create', //buat data
                'read', //lihat detail data
                'edit', //ubah data
                // 'delete', //hapus data
            ],
            'role-management' => [
                'access',
                'create',
                'edit',
                'delete',
            ],
            // Contoh module nested (parent + sub-module)
            // 'warehouse-management' => [
            //     'access',
            //     'storage' => [
            //         'access',
            //         'barcode',
            //         'create',
            //         'read',
            //         'edit',
            //         'delete',
            //     ],
            //     'received-items' => [
            //         'access',
            //         'create',
            //         'read',
            //         'edit',
            //         'delete',
            //     ],
            //     'sub-inventory' => [
            //         'access',
            //         'create',
            //         'read',
            //         'edit',
            //         'delete',
            //     ],
            //     'outflow' => [
            //         'access',
            //         'create',
            //         'read',
            //         'edit',
            //         'delete',
            //     ],
            // ],

            // Contoh module lain dengan hanya 1 permission
            // 'simple-module' => ['access'],
        ];

        // 1. Kumpulkan semua nama permission yang diinginkan (Support Nested)
        $permissionNames = [];
        foreach ($permissionsByModule as $module => $actions) {
            foreach ($actions as $key => $action) {
                if (is_array($action)) {
                    // Ini adalah nested module (misal: 'warehouse' => ['storage' => ['access', ...]])
                    $subModule = $key;
                    foreach ($action as $subAction) {
                        $permissionNames[] = "{$module}.{$subModule}.{$subAction}";
                    }
                } else {
                    // Ini adalah module biasa atau action untuk parent
                    $permissionNames[] = "{$module}.{$action}";
                }
            }
        }

        // 2. Buat permission baru yang belum ada
        foreach ($permissionNames as $name) {
            Permission::firstOrCreate([
                'name' => $name,
                'guard_name' => $guardName,
            ]);
        }

        // 3. Hapus permission yang tidak ada di daftar (Cleanup/Remove)
        // Hati-hati: Ini akan menghapus permission yang tidak didefinisikan di sini
        Permission::where('guard_name', $guardName)
            ->whereNotIn('name', $permissionNames)
            ->delete();

        // 4. Setup Roles
        $adminRole = Role::firstOrCreate([
            'name' => 'Super Admin',
            'guard_name' => $guardName,
        ]);

        // 5. Sync Permissions ke Role
        // Admin dapat semua permission yang ada di daftar
        $adminRole->syncPermissions($permissionNames);

        $this->command?->info('✅ RolePermissionSeeder completed.');
        $this->command?->info('Total Permissions: ' . Permission::count());
        $this->command?->info('Total Modules: ' . count($permissionsByModule));
    }
}
