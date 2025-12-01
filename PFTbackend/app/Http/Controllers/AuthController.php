<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Exceptions\ApiException;
use Illuminate\Support\Facades\Storage;
use OpenApi\Annotations as OA;

/**
 * @OA\Tag(
 * name="Authentication",
 * description="API Endpoints for user authentication"
 * )
 */
class AuthController extends Controller
{
    // ... Existing Register Method ...
    public function register(RegisterRequest $request)
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $user->sendEmailVerificationNotification();

        return $this->success([
            'user' => $user,
        ], 'User registered successfully. Please check your email to verify your account.', 201);
    }

    // ... Existing Login Method ...
    public function login(LoginRequest $request)
    {
        $validated = $request->validated();
        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            return response()->json(['success' => false, 'errors' => ['email' => ['No account found with this email address.']]], 422);
        }

        if ($user->hasVerifiedEmail() && !$user->password) {
            return response()->json(['success' => false, 'errors' => ['email' => ['This account was created using Google OAuth. Please use the "Continue with Google" button to sign in.']]], 422);
        }

        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['success' => false, 'errors' => ['password' => ['The password is incorrect.']]], 422);
        }

        if (!$user->hasVerifiedEmail()) {
            return response()->json(['success' => false, 'errors' => ['email' => ['Please verify your email address before logging in. Check your email for the verification link.']]], 422);
        }

        $abilities = ['*'];
        $tokenName = $request->remember ? 'long-session' : 'api-token';
        $token = $user->createToken($tokenName, $abilities)->plainTextToken;

        return $this->success([
            'remember' => $request->remember ? true : false,
            'token' => $token,
            'user' => $user,
        ], 'Login successful.');
    }

    // ... Existing Logout Method ...
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return $this->success(null, 'Logged out successfully.');
    }

    /**
     * @OA\Post(
     * path="/api/update-profile",
     * summary="Update user profile information",
     * tags={"Authentication"},
     * security={{"sanctum":{}}},
     * @OA\RequestBody(
     * required=true,
     * @OA\MediaType(
     * mediaType="multipart/form-data",
     * @OA\Schema(
     * required={"name"},
     * @OA\Property(property="name", type="string", example="John Doe"),
     * @OA\Property(property="bio", type="string", example="I love coding"),
     * @OA\Property(
     * property="avatar",
     * description="User profile image (optional)",
     * type="string",
     * format="binary"
     * )
     * )
     * )
     * ),
     * @OA\Response(
     * response=200,
     * description="Profile updated successfully",
     * @OA\JsonContent(
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Profile updated successfully."),
     * @OA\Property(property="data", type="object",
     * @OA\Property(property="user", ref="#/components/schemas/User")
     * )
     * )
     * ),
     * @OA\Response(
     * response=422,
     * description="Validation Error"
     * )
     * )
     */
    public function updateProfile(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'bio' => 'nullable|string|max:500', // <--- Added validation for bio
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        $user = $request->user();

        // 1. Update Basic Info
        $user->name = $request->name;
        $user->bio = $request->bio; // <--- Save the bio

        // 2. Handle Avatar Upload (if provided)
        if ($request->hasFile('avatar')) {
            // Delete old avatar if it exists to save space
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }

            // Store new file
            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = $path;
        }

        $user->save();

        return $this->success([
            'user' => $user
        ], 'Profile updated successfully.');
    }

    // ... Existing Verify Email Methods ...
    public function verifyEmail(Request $request, $id, $hash)
    {
        $user = User::findOrFail($id);

        if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return response()->view('errors.invalid-verification-link', [], 403);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->view('emails.already-verified', [], 200);
        }

        $user->markEmailAsVerified();

        return response()->view('emails.verified-redirect', [
            'redirect_url' => 'http://localhost:5173/login'
        ]);
    }

    public function resendVerificationEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $request->email)->first();

        if ($user->hasVerifiedEmail()) {
            return $this->error('Email already verified.', 400);
        }

        $user->sendEmailVerificationNotification();

        return $this->success(null, 'Verification email sent.');
    }

    public function testException(Request $request)
    {
        throw new ApiException('This is a test custom exception', 400);
    }
}