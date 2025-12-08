<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class ForgotPasswordTest extends TestCase
{
    use RefreshDatabase;

    public function test_send_reset_link_email_success()
    {
        $user = User::factory()->create();

        $response = $this->postJson('/api/forgot-password', [
            'email' => $user->email,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Password reset link sent successfully.',
            ]);
    }

    public function test_send_reset_link_email_invalid_email()
    {
        $response = $this->postJson('/api/forgot-password', [
            'email' => 'nonexistent@example.com',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'errors' => [
                    'email' => ['No account found with this email address.']
                ]
            ]);
    }

    public function test_send_reset_link_email_validation_error()
    {
        $response = $this->postJson('/api/forgot-password', [
            'email' => 'invalid-email',
        ]);

        $response->assertStatus(422)
            ->assertJsonStructure([
                'message',  // Your API returns only 'message' for validation errors (no 'errors' key)
            ]);
    }

    public function test_reset_password_success()
    {
        $user = User::factory()->create();

        // Create a password reset token
        $token = Password::createToken($user);

        $response = $this->postJson('/api/reset-password', [
            'email' => $user->email,
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
            'token' => $token,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Password has been reset successfully.',
            ]);

        // Verify password was actually changed
        $user->refresh();
        $this->assertTrue(\Hash::check('newpassword123', $user->password));
    }

    public function test_reset_password_invalid_token()
    {
        $user = User::factory()->create();

        $response = $this->postJson('/api/reset-password', [
            'email' => $user->email,
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
            'token' => 'invalid-token',
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Invalid token or email.',
            ]);
    }

    public function test_reset_password_validation_error()
    {
        $user = User::factory()->create();

        $response = $this->postJson('/api/reset-password', [
            'email' => $user->email,
            'password' => 'short',
            'password_confirmation' => 'different',
            'token' => 'some-token',
        ]);

        $response->assertStatus(422)
            ->assertJsonStructure([
                'message',  // Your API returns only 'message' for validation errors (no 'errors' key)
            ]);
    }

    public function test_reset_password_mismatched_confirmation()
    {
        $user = User::factory()->create();

        $response = $this->postJson('/api/reset-password', [
            'email' => $user->email,
            'password' => 'newpassword123',
            'password_confirmation' => 'differentpassword',
            'token' => 'some-token',
        ]);

        $response->assertStatus(422)
            ->assertJsonStructure([
                'message',  // Your API returns only 'message' for validation errors (no 'errors' key)
            ]);
    }
}
