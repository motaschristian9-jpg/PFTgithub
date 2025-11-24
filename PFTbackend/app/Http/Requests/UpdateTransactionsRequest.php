<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTransactionsRequest extends FormRequest
{
    public function authorize()
    {
        // Authorization is managed in controller via policies
        return true;
    }

    public function rules()
    {
        // Validation rules for update - allow partial updates
        return [
            'name' => 'sometimes|string|max:255',
            'amount' => 'sometimes|numeric|min:0',
            'type' => 'sometimes|in:income,expense',
            'description' => 'sometimes|string|nullable',
            'date' => 'sometimes|date',
            'category_id' => 'sometimes|integer|exists:categories,id|nullable',
        ];
    }
}
