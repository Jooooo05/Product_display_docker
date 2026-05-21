<?php

namespace App\Http\Controllers\User;

use App\Events\UserUpdated;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\UserRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function roles()
    {
        $roles = Role::with('permissions')
            ->orderBy('id', 'asc')
            ->get();

        // Manual count based on string match since we are decoupling Spatie roles from users
        $data = $roles->map(function ($role) {
            $roleData = $role->toArray();
            $roleData['users_count'] = User::query()->where('role', '=', $role->name)->count();
            return $roleData;
        });

        return response()->json([
            'success' => true,
            'message' => 'List role retrieved successfully',
            'data'    => $data,
        ], 200);
    }

    public function permissions()
    {
        $permissions = Permission::query()
            ->select(['id', 'name', 'guard_name'])
            ->orderBy('id', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'List permission retrieved successfully',
            'data'    => $permissions,
        ], 200);
    }

    public function storeRole(Request $request)
    {
        $request->validate([
            'name' => 'required|unique:roles,name',
            'permissions' => 'array'
        ]);

        $role = Role::create(['name' => $request->name, 'guard_name' => 'web']);

        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        // Dispatch event for realtime frontend update
        $users = User::role($role->name)->get();
        foreach ($users as $user) {
            UserUpdated::dispatch($user);
        }

        return response()->json([
            'success' => true,
            'message' => 'Role created successfully',
            'data'    => $role->load('permissions'),
        ], 201);
    }

    public function updateRole(Request $request, $id)
    {
        $role = Role::findOrFail($id);

        $request->validate([
            'name' => 'required|unique:roles,name,' . $id,
            'permissions' => 'array'
        ]);

        $oldName = $role->name;
        $role->update(['name' => $request->name]);

        // Update role name in users table if changed
        if ($oldName !== $request->name) {
            User::where('role', $oldName)->update(['role' => $request->name]);
        }

        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        // Dispatch event for realtime frontend update
        $users = User::where('role', $role->name)->get();
        foreach ($users as $user) {
            UserUpdated::dispatch($user);
        }

        return response()->json([
            'success' => true,
            'message' => 'Role updated successfully',
            'data'    => $role->load('permissions'),
        ], 200);
    }

    public function destroyRole($id)
    {
        $role = Role::findOrFail($id);

        // Check usage via string column
        $usersCount = User::where('role', $role->name)->count();

        if ($usersCount > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Role cannot be deleted because it is used by ' . $usersCount . ' users',
            ], 400);
        }

        $role->delete();

        return response()->json([
            'success' => true,
            'message' => 'Role deleted successfully',
        ], 200);
    }

    public function index(Request $request)
    {
        $query = User::query();

        // Filter by status if present
        if ($request->has('status') && $request->status != '') {
            $query->where('status', $request->status);
        }
        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('nickname', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $query->select([
            'id',
            'name',
            'nickname',
            'email',
            'status',
            'role',
            'created_at',
            'updated_at',
        ]);

        // Load relations
        $query->with([
            'roles' => function ($q) {
                $q->select([
                    'id',
                    'name',
                ]);
            },
        ]);

        $data = $query
            ->orderBy('id', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'List user retrieved successfully',
            'data'    => $data,
        ], 200);
    }

    public function show($id)
    {
        $item = User::with(['roles', 'permissions'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Item retrieved successfully',
            'data'    => $item,
        ], 200);
    }

    public function store(UserRequest $request)
    {
        $data = $request->validated();

        $role = $data['role'] ?? null;

        $permissions = $data['permissions'] ?? [];
        unset($data['permissions']);

        if (empty($data['nickname']) && !empty($data['username'])) {
            $data['nickname'] = $data['username'];
        }
        unset($data['username']);

        if (empty($data['status'])) {
            $data['status'] = 'active';
        }

        $data['password'] = Hash::make($data['password']);

        $user = DB::transaction(function () use ($data, $role, $permissions) {
            $user = User::create($data);

            if (!empty($permissions)) {
                $user->syncPermissions($permissions);
            }

            return $user;
        });

        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'data'    => $user->load(['roles', 'permissions']),
        ], 201);
    }

    public function update(UserRequest $request, $id)
    {
        $user = User::findOrFail($id);

        $data = $request->validated();

        $role = $data['role'] ?? null;

        $permissions = $data['permissions'] ?? [];
        unset($data['permissions']);

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        if (empty($data['nickname']) && !empty($data['username'])) {
            $data['nickname'] = $data['username'];
        }
        unset($data['username']);

        $user->update($data);

        if ($role) {
            // Don't sync Spatie role to avoid inheriting permissions.
            // We also ensure no Spatie roles are attached (for existing users migrating to this logic)
            $user->syncRoles([]);
        }

        // Always sync permissions, even if empty, to ensure removed permissions are actually removed
        $user->syncPermissions($permissions);

        // Dispatch event for realtime frontend update
        // UserUpdated::dispatch($user);

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data'    => $user->load(['roles', 'permissions']),
        ], 200);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully',
        ], 200);
    }
}
