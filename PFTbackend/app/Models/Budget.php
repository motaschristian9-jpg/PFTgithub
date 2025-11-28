<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Scopes\UserScope;
use Illuminate\Database\Eloquent\Builder;

class Budget extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'amount',
        'start_date',
        'end_date',
        'category_id',
        'status',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    protected static function booted(): void
    {
        if (class_exists(UserScope::class)) {
            static::addGlobalScope(new UserScope);
        }
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // --- STRICT RELATIONSHIP ---
    // Only includes transactions that have this specific budget_id column set
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeHistory($query)
    {
        return $query->whereIn('status', ['completed', 'expired', 'reached']);
    }
}