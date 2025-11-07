<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // 🧾 Register new user
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed', // requires password_confirmation
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'User registered successfully.',
            'token' => $token,
            'user' => $user,
        ], 201);
    }

    // 🔑 Login existing user with "remember me"
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'remember' => 'boolean', // optional "remember me" flag
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // If "remember me" is checked, create a longer-lived token
        $abilities = ['*']; // default full access
        $tokenName = $request->remember ? 'long-session' : 'api-token';
        $token = $user->createToken($tokenName, $abilities)->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'remember' => $request->remember ? true : false,
            'token' => $token,
            'user' => $user,
        ]);
    }

    // 🚪 Logout
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }
}
