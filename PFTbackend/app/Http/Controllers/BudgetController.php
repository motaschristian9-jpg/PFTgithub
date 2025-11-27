<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Http\Requests\CreateBudgetRequest;
use App\Http\Resources\BudgetResource;
use App\Http\Resources\BudgetCollection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use OpenApi\Annotations as OA;

/**
 * @OA\Tag(
 *     name="Budgets",
 *     description="API Endpoints for managing budgets"
 * )
 */
class BudgetController extends Controller
{
    use AuthorizesRequests;

    /**
     * @OA\Get(
     *     path="/api/budgets",
     *     summary="Get list of budgets",
     *     tags={"Budgets"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="status",
     *         in="query",
     *         description="Filter budgets by status: active or completed",
     *         required=false,
     *         @OA\Schema(type="string", example="active")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="List of budgets",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Budget"))
     *         )
     *     )
     * )
     */
    public function index(Request $request)
    {
        $status = $request->get('status', 'active'); // default active

        // Cleaner conditional using ternary
        $query = $status === 'completed'
            ? Auth::user()->budgets()->completed()
            : ($status === 'all'
                ? Auth::user()->budgets()
                : Auth::user()->budgets()->active());

        $query->orderBy('created_at', 'desc');

        if ($request->has('name')) {
            $query->where('name', 'like', '%' . $request->name . '%');
        }

        if ($request->has('start_date')) {
            $query->where('start_date', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->where('end_date', '<=', $request->end_date);
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $budgets = $query->get(); // fetch all, no pagination

        return new BudgetCollection($budgets);
    }

    public function store(CreateBudgetRequest $request)
    {
        // Check for existing active budget in the same category
        if ($request->category_id) {
            $activeBudgetExists = Auth::user()->budgets()
                ->where('category_id', $request->category_id)
                ->where('start_date', '<=', now())
                ->where('end_date', '>=', now())
                ->exists();

            if ($activeBudgetExists) {
                return response()->json([
                    'message' => 'You already have an active budget for this category.'
                ], 422);
            }
        }

        $budget = Auth::user()->budgets()->create($request->validated());
        return new BudgetResource($budget);
    }

    public function show(Budget $budget)
    {
        $this->authorize('view', $budget);
        return new BudgetResource($budget);
    }

    public function update(CreateBudgetRequest $request, Budget $budget)
    {
        $this->authorize('update', $budget);

        // Check if updating category would violate active budget rule
        if ($request->category_id && $request->category_id != $budget->category_id) {
            $activeBudgetExists = Auth::user()->budgets()
                ->where('category_id', $request->category_id)
                ->where('start_date', '<=', now())
                ->where('end_date', '>=', now())
                ->exists();

            if ($activeBudgetExists) {
                return response()->json([
                    'message' => 'You already have an active budget for this category.'
                ], 422);
            }
        }

        $budget->update($request->validated());
        return new BudgetResource($budget);
    }

    public function destroy(Budget $budget)
    {
        $this->authorize('delete', $budget);
        $budget->delete();

        return response()->json([
            'success' => true,
            'message' => 'Budget deleted successfully.'
        ]);
    }
}
