<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Str;

/**
 * Google Authentication Controller
 *
 * Handles Google OAuth authentication for signup and login
 */
class GoogleAuthController extends Controller
{
    /**
     * Get Google OAuth login URL
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function loginWithGoogle(Request $request)
    {
        $state = $request->query('state'); // 'signup' or 'login'
        $redirectUri = $request->query('redirect_uri'); // Frontend callback URI

        // Validate state parameter
        if (!$state || !in_array($state, ['signup', 'login'])) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid state parameter. Must be "signup" or "login".'
            ], 400);
        }

        // Validate redirect URI
        if (!$redirectUri) {
            return response()->json([
                'success' => false,
                'message' => 'Redirect URI is required.'
            ], 400);
        }

        // Combine state and redirect URI for later retrieval
        $combinedState = $state . '|' . $redirectUri;

        // Generate Google OAuth URL (use config redirect URL, not frontend URL)
        $redirectUrl = Socialite::driver('google')
            ->stateless() // stateless since API only
            ->with(['state' => $combinedState])
            ->redirect()
            ->getTargetUrl();

        return response()->json([
            'success' => true,
            'redirect_url' => $redirectUrl,
        ]);
    }

    /**
     * Handle Google OAuth callback
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function callback(Request $request)
    {
        try {
            $code = $request->input('code');
            $combinedState = $request->input('state');

            // Parse combined state (state|redirectUri)
            $stateParts = explode('|', $combinedState);
            if (count($stateParts) !== 2) {
                return redirect('http://localhost:5173/auth/google/callback?error=invalid_state&message=' . urlencode('Invalid state parameter.'));
            }

            $state = $stateParts[0];
            $redirectUri = $stateParts[1];

            // Validate parameters
            if (!$state || !in_array($state, ['signup', 'login'])) {
                return redirect($redirectUri . '?error=invalid_state&message=' . urlencode('Invalid state parameter.'));
            }

            if (!$code) {
                return redirect($redirectUri . '?error=no_code&message=' . urlencode('Authorization code is required.'));
            }

            // Get user info from Google
            $googleUser = Socialite::driver('google')
                ->stateless()
                ->user();

            $email = $googleUser->getEmail();

            // Check if user exists
            $existingUser = User::where('email', $email)->first();

            if ($existingUser) {
                // User exists - check verification status
                if (!$existingUser->hasVerifiedEmail()) {
                    return redirect($redirectUri . '?error=email_not_verified&message=' . urlencode('This email is already registered but not verified. Please verify your email first.'));
                }

                // User is verified
                if ($state === 'signup') {
                    // During signup, if account exists, prompt user
                    return redirect($redirectUri . '?error=account_exists&message=' . urlencode('You already have an account with this email. Please login instead.'));
                } else {
                    // During login, proceed with auto-login
                    $token = $existingUser->createToken('api-token')->plainTextToken;

                    return redirect($redirectUri . '?success=true&action=login&token=' . urlencode($token) . '&user=' . urlencode(json_encode($existingUser)) . '&message=' . urlencode('Login successful via Google'));
                }
            } else {
                // User does not exist
                if ($state === 'signup') {
                    // During signup, create new user but don't auto-login
                    $user = User::create([
                        'name' => $googleUser->getName() ?? 'User',
                        'email' => $email,
                        'password' => bcrypt(Str::random(16)),
                        'email_verified_at' => now(),
                    ]);

                    return redirect($redirectUri . '?success=true&action=created_no_login&user=' . urlencode(json_encode($user)) . '&message=' . urlencode('Account created successfully via Google. Please login to continue.'));
                } else {
                    // During login, if no account exists, create and login
                    $user = User::create([
                        'name' => $googleUser->getName() ?? 'User',
                        'email' => $email,
                        'password' => bcrypt(Str::random(16)),
                        'email_verified_at' => now(),
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
