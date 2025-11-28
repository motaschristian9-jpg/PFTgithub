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
        'budget_id', // <--- IMPORTANT: This allows the ID to be saved
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
}