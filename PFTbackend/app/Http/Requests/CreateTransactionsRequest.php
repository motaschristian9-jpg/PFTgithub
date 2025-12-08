<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateTransactionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'type' => 'required|in:income,expense',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:1000',
            'date' => 'required|date|before_or_equal:today',
            'category_id' => 'nullable|integer|exists:categories,id',
            'budget_id' => 'nullable|integer',
            'savings_amount' => 'nullable|numeric|min:0',
            'transfer_category_id' => 'nullable|integer|exists:categories,id',
            'saving_goal_id' => 'nullable|integer|exists:savings,id',
        ];
    }
}