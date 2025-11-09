<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;
use Tests\TestCase;

class GoogleAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_with_google_returns_redirect_url()
    {
        $response = $this->getJson('/api/auth/google/login');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'redirect_url'
                 ])
                 ->assertJson([
                     'success' => true
                 ]);
    }

    public function test_google_callback_creates_new_user()
    {
        // Mock the Socialite user
        $socialiteUser = Mockery::mock(SocialiteUser::class);
        $socialiteUser->shouldReceive('getEmail')->andReturn('test@example.com');
        $socialiteUser->shouldReceive('getName')->andReturn('Test User');

        // Mock Socialite driver
        $socialiteDriver = Mockery::mock();
        $socialiteDriver->shouldReceive('stateless')->andReturnSelf();
        $socialiteDriver->shouldReceive('user')->andReturn($socialiteUser);

        Socialite::shouldReceive('driver')->with('google')->andReturn($socialiteDriver);

        $response = $this->getJson('/api/auth/google/callback?code=test_code');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'message',
                     'user' => [
                         'id',
                         'name',
                         'email'
                     ],
                     'token'
                 ])
                 ->assertJson([
                     'success' => true,
                     'message' => 'Login successful via Google'
                 ]);

        // Verify user was created
        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'name' => 'Test User'
        ]);
    }

    public function test_google_callback_logs_in_existing_user()
    {
        $existingUser = User::factory()->create([
            'email' => 'existing@example.com',
            'name' => 'Existing User'
        ]);

        // Mock the Socialite user
        $socialiteUser = Mockery::mock(SocialiteUser::class);
        $socialiteUser->shouldReceive('getEmail')->andReturn('existing@example.com');
        $socialiteUser->shouldReceive('getName')->andReturn('Updated Name');

        // Mock Socialite driver
        $socialiteDriver = Mockery::mock();
        $socialiteDriver->shouldReceive('stateless')->andReturnSelf();
        $socialiteDriver->shouldReceive('user')->andReturn($socialiteUser);

        Socialite::shouldReceive('driver')->with('google')->andReturn($socialiteDriver);

        $response = $this->getJson('/api/auth/google/callback?code=test_code');

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'message' => 'Login successful via Google',
                     'user' => [
                         'id' => $existingUser->id,
                         'email' => 'existing@example.com',
                         'name' => 'Existing User' // Should not be updated
                     ]
                 ]);

        // Verify only one user exists with this email
        $this->assertEquals(1, User::where('email', 'existing@example.com')->count());
    }

    public function test_google_callback_handles_socialite_exception()
    {
        // Mock Socialite driver to throw exception
        $socialiteDriver = Mockery::mock();
        $socialiteDriver->shouldReceive('stateless')->andReturnSelf();
        $socialiteDriver->shouldReceive('user')->andThrow(new \Exception('OAuth error'));

        Socialite::shouldReceive('driver')->with('google')->andReturn($socialiteDriver);

        $response = $this->getJson('/api/auth/google/callback?code=test_code');

        $response->assertStatus(401)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Authentication failed: OAuth error'
                 ]);
    }

    public function test_google_callback_handles_missing_name()
    {
        // Mock the Socialite user with null name
        $socialiteUser = Mockery::mock(SocialiteUser::class);
        $socialiteUser->shouldReceive('getEmail')->andReturn('test@example.com');
        $socialiteUser->shouldReceive('getName')->andReturn(null);

        // Mock Socialite driver
        $socialiteDriver = Mockery::mock();
        $socialiteDriver->shouldReceive('stateless')->andReturnSelf();
        $socialiteDriver->shouldReceive('user')->andReturn($socialiteUser);

        Socialite::shouldReceive('driver')->with('google')->andReturn($socialiteDriver);

        $response = $this->getJson('/api/auth/google/callback?code=test_code');

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'user' => [
                         'name' => 'User' // Should default to 'User'
                     ]
                 ]);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
