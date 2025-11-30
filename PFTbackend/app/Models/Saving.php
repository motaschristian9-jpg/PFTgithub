<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Scopes\UserScope;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="Saving",
 *     required={"user_id", "name", "target_amount", "current_amount"},
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="user_id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="Emergency Fund"),
 *     @OA\Property(property="target_amount", type="number", format="float", example=5000.00),
 *     @OA\Property(property="current_amount", type="number", format="float", example=1250.00),
 *     @OA\Property(property="description", type="string", nullable=true, example="Building emergency savings"),
 *     @OA\Property(property="target_date", type="string", format="date", nullable=true, example="2024-12-31"),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 */
class Saving extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'target_amount',
        'current_amount',
        'description',
        'status',
        'target_date',
    ];

    protected $casts = [
        'target_amount' => 'decimal:2',
        'current_amount' => 'decimal:2',
        'target_date' => 'date',
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new UserScope);
    }

    /**
     * Get the user that owns the saving.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
