<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'name' => $this->name,
            'type' => $this->type,
            'amount' => (float) $this->amount,
            'description' => $this->description,
            'date' => $this->date?->format('Y-m-d'),
            'category_id' => $this->category_id,
            'category_name' => $this->category?->name,
            'budget_id' => $this->budget_id,
            'saving_goal_id' => $this->saving_goal_id,
            'category' => $this->category,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}