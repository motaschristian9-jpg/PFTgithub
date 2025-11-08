<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * @OA\Schema(
 *     schema="UpdateTransactionRequest",
 *     type="object",
 *     @OA\Property(property="type", type="string", enum={"income", "expense"}, example="expense"),
 *     @OA\Property(property="amount", type="number", format="float", minimum=0, example=50.00),
 *     @OA\Property(property="description", type="string", nullable=true, example="Updated description"),
 *     @OA\Property(property="date", type="string", format="date", example="2024-01-20"),
 *     @OA\Property(property="category_id", type="integer", nullable=true, example=2)
 * )
 */
class UpdateTransactionsRequest extends FormRequest
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
            'type' => 'sometimes|in:income,expense',
            'amount' => 'sometimes|numeric|min:0',
            'description' => 'nullable|string',
            'date' => 'sometimes|date',
            'category_id' => 'nullable|exists:budgets,id',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        $this->merge([
            'description' => $this->description ? trim(strip_tags($this->description)) : null,
        ]);
    }
}
