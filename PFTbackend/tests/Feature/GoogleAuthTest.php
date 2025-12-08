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
        $params = [
            'state' => 'login',
            'redirect_uri' => 'http://localhost:3000/auth/callback',
        ];
        
        // Mock Socialite
        $socialiteDriver = Mockery::mock();
        $socialiteDriver->shouldReceive('stateless')->andReturnSelf();
        $socialiteDriver->shouldReceive('with')->with(['state' => 'login|http://localhost:3000/auth/callback'])->andReturnSelf();
        $socialiteDriver->shouldReceive('redirect')->andReturnSelf();
        $socialiteDriver->shouldReceive('getTargetUrl')->andReturn('https://accounts.google.com/o/oauth2/auth?client_id=...');
        
        Socialite::shouldReceive('driver')->with('google')->andReturn($socialiteDriver);

        $response = $this->getJson('/api/auth/google/login?' . http_build_query($params));

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'redirect_url'
                 ])
                 ->assertJson([
                     'success' => true,
                     'redirect_url' => 'https://accounts.google.com/o/oauth2/auth?client_id=...'
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

        $state = 'signup|http://localhost:3000/auth/callback';
        $params = [
            'code' => 'test_code',
            'state' => $state,
        ];

        $response = $this->get('/api/auth/google/callback?' . http_build_query($params));

        $response->assertStatus(302);
        
        // Verify redirect URL contains success/created params
        $redirectUrl = $response->headers->get('Location');
        $this->assertStringContainsString('success=true', $redirectUrl);
        $this->assertStringContainsString('action=created_no_login', $redirectUrl);
        
        // Verify user was created
        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'name' => 'Test User',
            'login_method' => 'google'
        ]);
    }

    public function test_google_callback_logs_in_existing_user()
    {
        $existingUser = User::factory()->create([
            'email' => 'existing@example.com',
            'name' => 'Existing User',
            'login_method' => 'google' // Must be google or logic might block (wait, logic blocks if email method)
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
        
        $state = 'login|http://localhost:3000/auth/callback';
        $params = [
            'code' => 'test_code',
            'state' => $state,
        ];

        $response = $this->get('/api/auth/google/callback?' . http_build_query($params));

        $response->assertStatus(302);
        
        $redirectUrl = $response->headers->get('Location');
        $this->assertStringContainsString('success=true', $redirectUrl);
        $this->assertStringContainsString('action=login', $redirectUrl);
        $this->assertStringContainsString('token=', $redirectUrl);
    }
    
    public function test_google_callback_handles_socialite_exception()
    {
        $socialiteDriver = Mockery::mock();
        $socialiteDriver->shouldReceive('stateless')->andReturnSelf();
        $socialiteDriver->shouldReceive('user')->andThrow(new \Exception('OAuth error'));

        Socialite::shouldReceive('driver')->with('google')->andReturn($socialiteDriver);

        $state = 'login|http://localhost:3000/auth/callback';
        $params = [
            'code' => 'test_code',
            'state' => $state,
        ];

        $response = $this->get('/api/auth/google/callback?' . http_build_query($params));

        // Controller catches exception and redirects with error
        $response->assertStatus(302);
        $redirectUrl = $response->headers->get('Location');
        $this->assertStringContainsString('error=auth_failed', $redirectUrl);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
