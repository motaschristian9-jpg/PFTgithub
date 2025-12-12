<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BulkStoreTransactionsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'transactions' => ['required', 'array', 'min:1', 'max:100'], // Limit batch size for safety
            'transactions.*.name' => ['required', 'string', 'max:255'],
            'transactions.*.amount' => ['required', 'numeric', 'min:0.01'],
            'transactions.*.type' => ['required', 'in:income,expense'],
            'transactions.*.date' => ['required', 'date'],
            'transactions.*.description' => ['nullable', 'string', 'max:1000'],
            'transactions.*.category_id' => ['nullable', 'exists:categories,id'],
            // We consciously omit budget_id and saving_goal_id for bulk import MVP 
            // to avoid complexity with auto-assignment logic failure in batches.
            // Users can categorize/budgetize later if needed, or we implement simple matching.
        ];
    }
}
