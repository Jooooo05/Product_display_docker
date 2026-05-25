<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function loginAdmin(Request $request)
    {
        $credentials = $request->validate([
            'email'    => ['required', 'email', 'max:255'],
            'password' =>  ['required', 'string', 'min:8', 'max:100'],
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => 'Invalid login details'], 401);
        }

        $user  = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type'   => 'Bearer',
        ]);
    }

    public function loginDealer(Request $request)
    {
        $credentials = $request->validate([
            'email'    => ['required', 'email:rfc,dns', 'max:255'],
            'password' =>  ['required', 'string', 'min:8', 'max:100'],
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => 'Invalid login details'], 401);
        }

        $user  = Auth::user();
        $token = $user->createToken('dealer-token', ['dealer'], now()->addHours(8))->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type'   => 'Bearer',
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'id'              => $user->id,
            'name'            => $user->name,
            'email'           => $user->email,
            'nickname'        => $user->nickname,
            'phone'           => $user->phone,
            'address'         => $user->address,
            'status'          => $user->status,
            'is_dealer'       => $user->hasRole('dealer'),
            // Tidak return 'role' string mentah
            // Permission list otomatis kosong untuk dealer (tidak punya permission)
            'permission_list' => $user->getPermissionNames(),
        ]);
    }

    public function logout(Request $request)
    {
        $token = $request->user()->currentAccessToken();

        if ($token && method_exists($token, 'delete')) {
            $token->delete();
        }

        return response()->json(['message' => 'Logged out successfully']);
    }
}