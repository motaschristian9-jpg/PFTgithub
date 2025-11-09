<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Http\Requests\CreateBudgetRequest;
use App\Http\Resources\BudgetResource;
use App\Http\Resources\BudgetCollection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
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
     *         name="name",
     *         in="query",
     *         description="Filter by budget name",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="start_date",
     *         in="query",
     *         description="Filter budgets from this date",
     *         required=false,
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Parameter(
     *         name="end_date",
     *         in="query",
     *         description="Filter budgets to this date",
     *         required=false,
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Parameter(
     *         name="category_id",
     *         in="query",
     *         description="Filter by category ID",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="List of budgets",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="user_id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Monthly Groceries Budget"),
     *                 @OA\Property(property="amount", type="number", format="float", example=500.00),
     *                 @OA\Property(property="category_id", type="integer", nullable=true, example=1),
     *                 @OA\Property(property="start_date", type="string", format="date", example="2024-01-01"),
     *                 @OA\Property(property="end_date", type="string", format="date", example="2024-01-31"),
     *                 @OA\Property(property="created_at", type="string", format="date-time", example="2024-01-01T00:00:00Z"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time", example="2024-01-01T00:00:00Z"),
     *                 @OA\Property(property="transactions", type="array", @OA\Items(type="object"))
     *             )),
     *             @OA\Property(property="links", type="object"),
     *             @OA\Property(property="meta", type="object")
     *         )
     *     )
     * )
     */
    public function index(Request $request)
    {
        $userId = Auth::id();
        $cacheKey = 'user_' . $userId . '_budgets_' . md5(serialize($request->all()));

        $budgets = Cache::remember($cacheKey, 3600, function () use ($request, $userId) {
            $query = Auth::user()->budgets()->orderBy('created_at', 'desc');

            // Filter by name
            if ($request->has('name')) {
                $query->where('name', 'like', '%' . $request->name . '%');
            }

            // Filter by date range
            if ($request->has('start_date')) {
                $query->where('start_date', '>=', $request->start_date);
            }
            if ($request->has('end_date')) {
                $query->where('end_date', '<=', $request->end_date);
            }

            // Filter by category_id
            if ($request->has('category_id')) {
                $query->where('category_id', $request->category_id);
            }

            return $query->paginate(15);
        });

        return new BudgetCollection($budgets);
    }

    /**
     * @OA\Post(
     *     path="/api/budgets",
     *     summary="Create a new budget",
     *     tags={"Budgets"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name", "amount", "start_date", "end_date"},
     *             @OA\Property(property="name", type="string", maxLength=255, example="Monthly Groceries Budget"),
     *             @OA\Property(property="amount", type="number", format="float", minimum=0, example=500.00),
     *             @OA\Property(property="category_id", type="integer", nullable=true, example=1),
     *             @OA\Property(property="start_date", type="string", format="date", example="2024-01-01"),
     *             @OA\Property(property="end_date", type="string", format="date", example="2024-01-31")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Budget created successfully",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="id", type="integer", example=1),
     *             @OA\Property(property="user_id", type="integer", example=1),
     *             @OA\Property(property="name", type="string", example="Monthly Groceries Budget"),
     *             @OA\Property(property="amount", type="number", format="float", example=500.00),
     *             @OA\Property(property="category_id", type="integer", nullable=true, example=1),
     *             @OA\Property(property="start_date", type="string", format="date", example="2024-01-01"),
     *             @OA\Property(property="end_date", type="string", format="date", example="2024-01-31"),
     *             @OA\Property(property="created_at", type="string", format="date-time", example="2024-01-01T00:00:00Z"),
     *             @OA\Property(property="updated_at", type="string", format="date-time", example="2024-01-01T00:00:00Z"),
     *             @OA\Property(property="transactions", type="array", @OA\Items(type="object"))
     *         )
     *     )
     * )
     */
    public function store(CreateBudgetRequest $request)
    {
        $budget = Auth::user()->budgets()->create($request->validated());

        // Clear cache for user's budgets
        Cache::forget('user_' . Auth::id() . '_budgets_*');

        return new BudgetResource($budget);
    }

    /**
     * @OA\Get(
     *     path="/api/budgets/{budget}",
     *     summary="Get a specific budget",
     *     tags={"Budgets"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="budget",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Budget details",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="id", type="integer", example=1),
     *             @OA\Property(property="user_id", type="integer", example=1),
     *             @OA\Property(property="name", type="string", example="Monthly Groceries Budget"),
     *             @OA\Property(property="amount", type="number", format="float", example=500.00),
     *             @OA\Property(property="category_id", type="integer", nullable=true, example=1),
     *             @OA\Property(property="start_date", type="string", format="date", example="2024-01-01"),
     *             @OA\Property(property="end_date", type="string", format="date", example="2024-01-31"),
     *             @OA\Property(property="created_at", type="string", format="date-time", example="2024-01-01T00:00:00Z"),
     *             @OA\Property(property="updated_at", type="string", format="date-time", example="2024-01-01T00:00:00Z"),
     *             @OA\Property(property="transactions", type="array", @OA\Items(type="object"))
     *         )
     *     ),
     *     @OA\Response(response=403, description="Unauthorized"),
     *     @OA\Response(response=404, description="Budget not found")
     * )
     */
    public function show(Budget $budget)
    {
        $this->authorize('view', $budget);
        return new BudgetResource($budget);
    }

    /**
     * @OA\Put(
     *     path="/api/budgets/{budget}",
     *     summary="Update a budget",
     *     tags={"Budgets"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="budget",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name", "amount", "start_date", "end_date"},
     *             @OA\Property(property="name", type="string", maxLength=255, example="Monthly Groceries Budget"),
     *             @OA\Property(property="amount", type="number", format="float", minimum=0, example=500.00),
     *             @OA\Property(property="category_id", type="integer", nullable=true, example=1),
     *             @OA\Property(property="start_date", type="string", format="date", example="2024-01-01"),
     *             @OA\Property(property="end_date", type="string", format="date", example="2024-01-31")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Budget updated successfully",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="id", type="integer", example=1),
     *             @OA\Property(property="user_id", type="integer", example=1),
     *             @OA\Property(property="name", type="string", example="Monthly Groceries Budget"),
     *             @OA\Property(property="amount", type="number", format="float", example=500.00),
     *             @OA\Property(property="category_id", type="integer", nullable=true, example=1),
     *             @OA\Property(property="start_date", type="string", format="date", example="2024-01-01"),
     *             @OA\Property(property="end_date", type="string", format="date", example="2024-01-31"),
     *             @OA\Property(property="created_at", type="string", format="date-time", example="2024-01-01T00:00:00Z"),
     *             @OA\Property(property="updated_at", type="string", format="date-time", example="2024-01-01T00:00:00Z"),
     *             @OA\Property(property="transactions", type="array", @OA\Items(type="object"))
     *         )
     *     )
     * )
     */
    public function update(CreateBudgetRequest $request, Budget $budget)
    {
        $this->authorize('update', $budget);
        $budget->update($request->validated());

        // Clear cache for user's budgets
        Cache::forget('user_' . Auth::id() . '_budgets_*');

        return new BudgetResource($budget);
    }

    /**
     * @OA\Delete(
     *     path="/api/budgets/{budget}",
     *     summary="Delete a budget",
     *     tags={"Budgets"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="budget",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Budget deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Budget deleted successfully.")
     *         )
     *     )
     * )
     */
    public function destroy(Budget $budget)
    {
        $this->authorize('delete', $budget);
        $budget->delete();

        // Clear cache for user's budgets
        Cache::forget('user_' . Auth::id() . '_budgets_*');

        return $this->success(null, 'Budget deleted successfully.');
    }
}