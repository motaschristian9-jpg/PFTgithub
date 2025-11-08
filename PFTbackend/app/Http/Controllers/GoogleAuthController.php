<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Str;
use OpenApi\Annotations as OA;

/**
 * @OA\Tag(
 *     name="Google Authentication",
 *     description="API Endpoints for Google OAuth authentication"
 * )
 */
class GoogleAuthController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/auth/google/login",
     *     summary="Get Google OAuth login URL",
     *     tags={"Google Authentication"},
     *     @OA\Response(
     *         response=200,
     *         description="Google OAuth URL returned",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="redirect_url", type="string", example="https://accounts.google.com/oauth/authorize?...")
     *         )
     *     )
     * )
     */
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

    /**
     * @OA\Get(
     *     path="/api/auth/google/callback",
     *     summary="Handle Google OAuth callback",
     *     tags={"Google Authentication"},
     *     @OA\Parameter(
     *         name="code",
     *         in="query",
     *         description="Authorization code from Google",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Login successful via Google",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Login successful via Google"),
     *             @OA\Property(property="user", ref="#/components/schemas/User"),
     *             @OA\Property(property="token", type="string", example="1|abc123...")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Authentication failed",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Authentication failed: [error message]")
     *         )
     *     )
     * )
     */
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
