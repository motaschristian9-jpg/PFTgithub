<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Scopes\UserScope;

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
        'saving_goal_id', // <--- IMPORTANT: Required to save the relationship
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'date' => 'date',
    ];

    protected static function boot()
    {
        parent::boot();
        if (class_exists(UserScope::class)) {
            static::addGlobalScope(new UserScope());
        }
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function budget()
    {
        return $this->belongsTo(Budget::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // Defines the relationship to the Savings Goal
    public function savingsGoal()
    {
        // Assuming your savings table model is named 'Saving' or 'SavingsGoal'
        // adjust the class name if necessary (e.g. Saving::class)
        return $this->belongsTo(Saving::class, 'saving_goal_id');
    }
}