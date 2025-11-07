<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Str;

class GoogleAuthController extends Controller
{
    // Step 1: Redirect user to Google OAuth
    public function loginWithGoogle()
    {
        $redirectUrl = Socialite::driver('google')
            ->stateless() // stateless since API only
            ->redirect()
            ->getTargetUrl(); // Returns redirect URL for API usage

        return response()->json([
            'success' => true,
            'redirect_url' => $redirectUrl
        ]);
    }

    // Step 2: Handle callback from Google
    public function callback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')
                ->stateless()
                ->user();

            $user = User::firstOrCreate(
                ['email' => $googleUser->getEmail()],
                [
                    'name' => $googleUser->getName() ?? 'User',
                    'password' => bcrypt(Str::random(16)), // random password
                ]
            );

            $token = $user->createToken('api-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login successful via Google',
                'user' => $user,
                'token' => $token
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication failed: ' . $e->getMessage()
            ], 401);
        }
    }
}
