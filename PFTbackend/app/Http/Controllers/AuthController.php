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
    public function register(RegisterRequest $request)
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'currency' => 'USD',
            'login_method' => 'email',
        ]);

        $user->sendEmailVerificationNotification();

        return $this->success([
            'user' => $user,
        ], 'User registered successfully. Please check your email to verify your account.', 201);
    }

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
     * @OA\Property(property="currency", type="string", example="USD"),
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
            'currency' => 'required|string|max:3',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'email_notifications_enabled' => 'nullable|boolean',
            'theme_preference' => 'nullable|string|in:light,dark,system',
        ]);

        $user = $request->user();

        $user->name = $request->name;

        if ($request->has('currency')) {
            $user->currency = $request->currency;
        }

        if ($request->has('theme_preference')) {
            $user->theme_preference = $request->theme_preference;
        }

        if ($request->has('email_notifications_enabled')) {
            $user->email_notifications_enabled = $request->boolean('email_notifications_enabled');
        }

        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }

            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = $path;
        }

        $user->save();

        return $this->success([
            'user' => $user
        ], 'Profile updated successfully.');
    }

    /**
     * @OA\Put(
     * path="/api/user/set-password",
     * summary="Sets a local password for the first time for a user currently without one (typically OAuth users).",
     * tags={"Authentication"},
     * security={{"sanctum":{}}},
     * @OA\RequestBody(
     * required=true,
     * @OA\JsonContent(
     * required={"password", "password_confirmation"},
     * @OA\Property(property="password", type="string", format="password", example="newsecret123"),
     * @OA\Property(property="password_confirmation", type="string", format="password", example="newsecret123")
     * )
     * ),
     * @OA\Response(response=200, description="Password set successfully"),
     * @OA\Response(response=422, description="Validation Error")
     * )
     */
    public function setLocalPassword(Request $request)
    {
        $request->validate([
            'password' => 'required|confirmed|min:8',
        ]);

        $user = $request->user();

        $user->password = Hash::make($request->password);
        $user->save();

        return $this->success([
            'user' => $user
        ], 'Password set successfully.');
    }

    /**
     * @OA\Put(
     * path="/api/user/change-password",
     * summary="Change the user's password",
     * tags={"Authentication"},
     * security={{"sanctum":{}}},
     * @OA\RequestBody(
     * required=true,
     * @OA\JsonContent(
     * required={"current_password", "new_password", "new_password_confirmation"},
     * @OA\Property(property="current_password", type="string", format="password", example="oldsecret123"),
     * @OA\Property(property="new_password", type="string", format="password", example="newsecret123"),
     * @OA\Property(property="new_password_confirmation", type="string", format="password", example="newsecret123")
     * )
     * ),
     * @OA\Response(response=200, description="Password changed successfully"),
     * @OA\Response(response=422, description="Validation Error")
     * )
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|confirmed|min:8|different:current_password',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The provided password does not match your current password.'],
            ]);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        try {
            $user->notify(new \App\Notifications\PasswordChangedNotification());
        } catch (\Exception $e) {
            // Log error but don't fail the request
            \Illuminate\Support\Facades\Log::error('Failed to send password changed notification: ' . $e->getMessage());
        }

        return $this->success([
            'user' => $user
        ], 'Password changed successfully.');
    }

    /**
     * @OA\Put(
     * path="/api/user/acknowledge-notifications",
     * summary="Updates the user's last notification acknowledgment time.",
     * tags={"Authentication"},
     * security={{"sanctum":{}}},
     * @OA\RequestBody(
     * required=true,
     * @OA\JsonContent(
     * required={"ack_time"},
     * @OA\Property(property="ack_time", type="string", format="date-time", example="2025-01-01T10:00:00Z")
     * )
     * ),
     * @OA\Response(
     * response=200,
     * description="Acknowledgment time updated successfully.",
     * @OA\JsonContent(
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Notifications acknowledged."),
     * @OA\Property(property="data", type="object",
     * @OA\Property(property="user", ref="#/components/schemas/User")
     * )
     * )
     * )
     * )
     */
    public function acknowledgeNotifications(Request $request)
    {
        $request->validate([
            'ack_time' => 'required|date',
        ]);

        $user = $request->user();

        // Parse the ISO string (UTC) and convert to application timezone
        // This ensures that when it's saved to the DB, it aligns with other timestamps
        $ackTime = \Illuminate\Support\Carbon::parse($request->ack_time)
            ->setTimezone(config('app.timezone'));

        $user->last_notification_ack_time = $ackTime;
        $user->save();

        return $this->success([
            'user' => $user
        ], 'Notifications acknowledged.');
    }

    /**
     * @OA\Delete(
     * path="/api/user",
     * summary="Delete the authenticated user's account",
     * tags={"Authentication"},
     * security={{"sanctum":{}}},
     * @OA\Response(response=200, description="Account deleted successfully"),
     * @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function deleteAccount(Request $request)
    {
        $user = $request->user();

        // Optional: Delete related data explicitly if no cascading delete in DB
        // $user->transactions()->delete();
        // $user->budgets()->delete();
        // $user->savings()->delete();
        // $user->categories()->delete();

        $user->delete();

        return $this->success(null, 'Account deleted successfully.');
    }

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