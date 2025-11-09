<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Scopes\UserScope;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="Summary",
 *     required={"user_id", "month", "year"},
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="user_id", type="integer", example=1),
 *     @OA\Property(property="month", type="integer", example=11),
 *     @OA\Property(property="year", type="integer", example=2024),
 *     @OA\Property(property="total_income", type="number", format="float", example=5000.00),
 *     @OA\Property(property="total_expenses", type="number", format="float", example=3200.50),
 *     @OA\Property(property="budget_performance", type="number", format="float", nullable=true, example=85.5),
 *     @OA\Property(property="savings_progress", type="number", format="float", nullable=true, example=75.0),
 *     @OA\Property(property="details", type="object", nullable=true),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 */
class Summary extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'month',
        'year',
        'total_income',
        'total_expenses',
        'budget_performance',
        'savings_progress',
        'details',
    ];

    protected $casts = [
        'total_income' => 'decimal:2',
        'total_expenses' => 'decimal:2',
        'budget_performance' => 'decimal:2',
        'savings_progress' => 'decimal:2',
        'details' => 'array',
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new UserScope);
    }

    /**
     * Get the user that owns the summary.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
