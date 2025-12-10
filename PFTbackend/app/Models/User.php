<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use OpenApi\Annotations as OA;
use Illuminate\Support\Facades\Storage;

/**
 * @OA\Schema(
 * schema="User",
 * required={"name", "email"},
 * @OA\Property(property="id", type="integer", example=1),
 * @OA\Property(property="name", type="string", example="John Doe"),
 * @OA\Property(property="email", type="string", format="email", example="john@example.com"),
 * @OA\Property(property="login_method", type="string", enum={"email", "google"}, example="email"),
 * @OA\Property(property="avatar", type="string", nullable=true, example="avatars/filename.jpg"),
 * @OA\Property(property="avatar_url", type="string", nullable=true, example="http://localhost:8000/storage/avatars/filename.jpg"),
 * @OA\Property(property="bio", type="string", nullable=true, example="Software Developer"),
 * @OA\Property(property="currency", type="string", nullable=true, example="USD"),
 * @OA\Property(property="last_notification_ack_time", type="string", format="date-time", nullable=true, description="Timestamp of the last time the user acknowledged notifications."),
 * @OA\Property(property="email_verified_at", type="string", format="date-time", nullable=true),
 * @OA\Property(property="created_at", type="string", format="date-time"),
 * @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 */
class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'email_verified_at',
        'avatar',
        'bio',
        'currency',
        'login_method',
        'last_notification_ack_time',
        'email_notifications_enabled',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'last_notification_ack_time' => 'datetime',
        'email_notifications_enabled' => 'boolean',
    ];

    protected $appends = ['avatar_url'];

    public function getAvatarUrlAttribute()
    {
        return $this->avatar
            ? request()->root() . Storage::url($this->avatar)
            : null;
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function budgets()
    {
        return $this->hasMany(Budget::class);
    }

    public function savings()
    {
        return $this->hasMany(Saving::class);
    }

    public function sendEmailVerificationNotification()
    {
        $this->notify(new \App\Notifications\VerifyEmail);
    }

    public function sendPasswordResetNotification($token)
    {
        $this->notify(new \App\Notifications\ResetPasswordNotificationCustom($token));
    }
}