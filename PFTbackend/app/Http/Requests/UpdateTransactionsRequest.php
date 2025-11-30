<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTransactionsRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
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