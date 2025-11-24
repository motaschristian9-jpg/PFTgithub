<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Scopes\UserScope;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="Transaction",
 *     required={"user_id", "type", "amount", "description", "date"},
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="user_id", type="integer", example=1),
 *     @OA\Property(property="type", type="string", enum={"income", "expense"}, example="expense"),
 *     @OA\Property(property="amount", type="number", format="float", example=150.50),
 *     @OA\Property(property="description", type="string", example="Grocery shopping"),
 *     @OA\Property(property="date", type="string", format="date", example="2024-01-15"),
 *     @OA\Property(property="category_id", type="integer", nullable=true, example=1),
 *     @OA\Property(property="budget_id", type="integer", nullable=true, example=1),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 */
class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'type',
        'amount',
        'description',
        'date',
        'category_id',
        'budget_id',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'date' => 'date',
    ];

    protected static function boot()
    {
        parent::boot();

        static::addGlobalScope(new UserScope());
    }

    /**
     * Get the user that owns the transaction.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the budget associated with the transaction.
     */
    public function budget()
    {
        return $this->belongsTo(Budget::class);
    }

    /**
     * Get the category associated with the transaction.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
