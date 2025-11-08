<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * @OA\Schema(
 *     schema="CreateTransactionRequest",
 *     type="object",
 *     required={"type", "amount", "date"},
 *     @OA\Property(property="type", type="string", enum={"income", "expense"}, example="income"),
 *     @OA\Property(property="amount", type="number", format="float", minimum=0, example=100.50),
 *     @OA\Property(property="description", type="string", nullable=true, example="Salary payment"),
 *     @OA\Property(property="date", type="string", format="date", example="2024-01-15"),
 *     @OA\Property(property="category_id", type="integer", nullable=true, example=1)
 * )
 */
class CreateTransactionsRequest extends FormRequest
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
            'type' => 'required|in:income,expense',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'date' => 'required|date',
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
