<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Str;

class GoogleAuthController extends Controller
{
    public function loginWithGoogle(Request $request)
    {
        $state = $request->query('state');
        $redirectUri = $request->query('redirect_uri');

        if (!$state || !in_array($state, ['signup', 'login'])) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid state parameter. Must be "signup" or "login".'
            ], 400);
        }

        if (!$redirectUri) {
            return response()->json([
                'success' => false,
                'message' => 'Redirect URI is required.'
            ], 400);
        }

        $combinedState = $state . '|' . $redirectUri;

        $redirectUrl = Socialite::driver('google')
            ->stateless()
            ->with(['state' => $combinedState])
            ->redirect()
            ->getTargetUrl();

        return response()->json([
            'success' => true,
            'redirect_url' => $redirectUrl,
        ]);
    }

    public function callback(Request $request)
    {
        try {
            $code = $request->input('code');
            $combinedState = $request->input('state');

            $stateParts = explode('|', $combinedState);
            if (count($stateParts) !== 2) {
                return redirect('http://localhost:5173/auth/google/callback?error=invalid_state&message=' . urlencode('Invalid state parameter.'));
            }

            $state = $stateParts[0];
            $redirectUri = $stateParts[1];

            if (!$state || !in_array($state, ['signup', 'login'])) {
                return redirect($redirectUri . '?error=invalid_state&message=' . urlencode('Invalid state parameter.'));
            }

            if (!$code) {
                return redirect($redirectUri . '?error=no_code&message=' . urlencode('Authorization code is required.'));
            }

            $googleUser = Socialite::driver('google')
                ->stateless()
                ->user();

            $email = $googleUser->getEmail();

            $existingUser = User::where('email', $email)->first();

            if ($existingUser) {
                if (!$existingUser->hasVerifiedEmail()) {
                    return redirect($redirectUri . '?error=email_not_verified&message=' . urlencode('This email is already registered but not verified. Please verify your email first.'));
                }

                if ($existingUser->login_method === 'email') {
                    // BLOCK: User must use their original authentication method
                    return redirect($redirectUri . '?error=auth_method_mismatch&message=' . urlencode('This account was created with email and password. Please log in using the standard form.'));
                }

                if ($state === 'signup') {
                    return redirect($redirectUri . '?error=account_exists&message=' . urlencode('You already have an account with this email. Please login instead.'));
                } else {
                    $token = $existingUser->createToken('api-token')->plainTextToken;

                    return redirect($redirectUri . '?success=true&action=login&token=' . urlencode($token) . '&user=' . urlencode(json_encode($existingUser)) . '&message=' . urlencode('Login successful via Google'));
                }
            } else {
                if ($state === 'signup') {
                    $user = User::create([
                        'name' => $googleUser->getName() ?? 'User',
                        'email' => $email,
                        'password' => bcrypt(Str::random(16)),
                        'email_verified_at' => now(),
                        'login_method' => 'google',
                    ]);

                    return redirect($redirectUri . '?success=true&action=created_no_login&user=' . urlencode(json_encode($user)) . '&message=' . urlencode('Account created successfully via Google. Please login to continue.'));
                } else {
                    $user = User::create([
                        'name' => $googleUser->getName() ?? 'User',
                        'email' => $email,
                        'password' => bcrypt(Str::random(16)),
                        'email_verified_at' => now(),
                        'login_method' => 'google',
                    ]);

                    $token = $user->createToken('api-token')->plainTextToken;

                    return redirect($redirectUri . '?success=true&action=login&token=' . urlencode($token) . '&user=' . urlencode(json_encode($user)) . '&message=' . urlencode('Account created and login successful via Google'));
                }
            }

        } catch (\Exception $e) {
            return redirect($redirectUri . '?error=auth_failed&message=' . urlencode('Authentication failed: ' . $e->getMessage()));
        }
    }
}