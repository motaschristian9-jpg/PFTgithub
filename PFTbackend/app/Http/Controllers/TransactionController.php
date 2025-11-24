<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Category;
use App\Http\Requests\CreateTransactionsRequest;
use App\Http\Resources\TransactionResource;
use App\Http\Resources\TransactionCollection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use OpenApi\Annotations as OA;

/**
 * @OA\Tag(
 *     name="Transactions",
 *     description="API Endpoints for managing transactions"
 * )
 */
class TransactionController extends Controller
{
    use AuthorizesRequests;

    /**
     * Build the transactions query with optional filters.
     */
    private function buildTransactionQuery(Request $request, $userId)
    {
        $query = Transaction::with('category')->where('user_id', $userId);

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('start_date')) {
            $query->where('date', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->where('date', '<=', $request->end_date);
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('min_amount')) {
            $query->where('amount', '>=', $request->min_amount);
        }

        if ($request->filled('max_amount')) {
            $query->where('amount', '<=', $request->max_amount);
        }

        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'LIKE', '%' . $searchTerm . '%')
                  ->orWhere('description', 'LIKE', '%' . $searchTerm . '%');
            });
        }

        return $query;
    }

    /**
     * @OA\Get(
     *     path="/api/transactions",
 *     summary="Get list of transactions",
 *     tags={"Transactions"},
 *     security={{"sanctum":{}}},
 *     @OA\Parameter(
 *         name="type",
 *         in="query",
 *         description="Filter by transaction type",
 *         required=false,
 *         @OA\Schema(type="string", enum={"income", "expense"})
 *     ),
 *     @OA\Parameter(
 *         name="start_date",
 *         in="query",
 *         description="Filter transactions from this date",
 *         required=false,
 *         @OA\Schema(type="string", format="date")
 *     ),
 *     @OA\Parameter(
 *         name="end_date",
 *         in="query",
 *         description="Filter transactions to this date",
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
 *     @OA\Parameter(
 *         name="min_amount",
 *         in="query",
 *         description="Minimum amount",
 *         required=false,
 *         @OA\Schema(type="number")
 *     ),
 *     @OA\Parameter(
 *         name="max_amount",
 *         in="query",
 *         description="Maximum amount",
 *         required=false,
 *         @OA\Schema(type="number")
 *     ),
 *     @OA\Parameter(
 *         name="search",
 *         in="query",
 *         description="Search transactions by name or description",
 *         required=false,
 *         @OA\Schema(type="string")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="List of transactions",
 *         @OA\JsonContent(
 *             @OA\Property(property="data", type="array", @OA\Items(
 *                 type="object",
 *                 @OA\Property(property="id", type="integer", example=1),
 *                 @OA\Property(property="user_id", type="integer", example=1),
 *                 @OA\Property(property="name", type="string", example="Grocery"),
 *                 @OA\Property(property="amount", type="number", format="float", example=100.50),
 *                 @OA\Property(property="type", type="string", example="expense"),
 *                 @OA\Property(property="description", type="string", nullable=true, example="Grocery shopping"),
 *                 @OA\Property(property="date", type="string", format="date", example="2024-01-15"),
 *                 @OA\Property(property="category_id", type="integer", nullable=true, example=1),
 *                 @OA\Property(property="created_at", type="string", format="date-time", example="2024-01-15T00:00:00Z"),
 *                 @OA\Property(property="updated_at", type="string", format="date-time", example="2024-01-15T00:00:00Z")
 *             )),
 *             @OA\Property(property="links", type="object"),
 *             @OA\Property(property="meta", type="object")
 *         )
 *     )
 * )
 */

    public function index(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['error' => 'Authentication required'], 401);
        }

        $userId = Auth::id();

        // Build filtered query using consolidated method
        $query = $this->buildTransactionQuery($request, $userId);

        // Simple sorting
        $sortBy = $request->get('sort_by', 'date');
        $sortOrder = $request->get('sort_order', 'desc');
        $allowedSortFields = ['date', 'amount', 'type', 'name'];
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        // Calculate totals on base query before pagination
        $totalIncome = (clone $query)->where('type', 'income')->sum('amount');
        $totalExpenses = (clone $query)->where('type', 'expense')->sum('amount');

        $paginated = $query->paginate(15);

        return (new TransactionCollection($paginated))->additional([
            'totals' => [
                'income' => (float) $totalIncome,
                'expenses' => (float) $totalExpenses,
            ]
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/transactions",
     *     summary="Create a new transaction",
     *     tags={"Transactions"},
     *     security={{"sanctum":{}}},
     * @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name", "amount", "type", "date"},
     *             @OA\Property(property="name", type="string", example="Grocery"),
     *             @OA\Property(property="amount", type="number", format="float", minimum=0, example=100.50),
     *             @OA\Property(property="type", type="string", enum={"income", "expense"}, example="expense"),
     *             @OA\Property(property="description", type="string", nullable=true, example="Grocery shopping"),
     *             @OA\Property(property="date", type="string", format="date", example="2024-01-15"),
     *             @OA\Property(property="category_id", type="integer", nullable=true, example=1)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Transaction created successfully",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="id", type="integer", example=1),
     *             @OA\Property(property="user_id", type="integer", example=1),
     *             @OA\Property(property="amount", type="number", format="float", example=100.50),
     *             @OA\Property(property="type", type="string", example="expense"),
     *             @OA\Property(property="description", type="string", nullable=true, example="Grocery shopping"),
     *             @OA\Property(property="date", type="string", format="date", example="2024-01-15"),
     *             @OA\Property(property="category_id", type="integer", nullable=true, example=1),
     *             @OA\Property(property="created_at", type="string", format="date-time", example="2024-01-15T00:00:00Z"),
     *             @OA\Property(property="updated_at", type="string", format="date-time", example="2024-01-15T00:00:00Z")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(CreateTransactionsRequest $request)
    {
        $transaction = Auth::user()->transactions()->create($request->validated());

        return new TransactionResource($transaction);
    }

    /**
     * @OA\Get(
     *     path="/api/transactions/{transaction}",
     *     summary="Get a specific transaction",
     *     tags={"Transactions"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="transaction",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Transaction details",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="id", type="integer", example=1),
     *             @OA\Property(property="user_id", type="integer", example=1),
     *             @OA\Property(property="name", type="string", example="Grocery"),
     *             @OA\Property(property="amount", type="number", format="float", example=100.50),
     *             @OA\Property(property="type", type="string", example="expense"),
     *             @OA\Property(property="description", type="string", nullable=true, example="Grocery shopping"),
     *             @OA\Property(property="date", type="string", format="date", example="2024-01-15"),
     *             @OA\Property(property="category_id", type="integer", nullable=true, example=1),
     *             @OA\Property(property="created_at", type="string", format="date-time", example="2024-01-15T00:00:00Z"),
     *             @OA\Property(property="updated_at", type="string", format="date-time", example="2024-01-15T00:00:00Z")
     *         )
     *     ),
     *     @OA\Response(response=403, description="Unauthorized"),
     *     @OA\Response(response=404, description="Transaction not found")
     * )
     */
    public function show(Transaction $transaction)
    {
        $this->authorize('view', $transaction);
        return new TransactionResource($transaction);
    }

    /**
     * @OA\Put(
     *     path="/api/transactions/{transaction}",
     *     summary="Update a transaction",
     *     tags={"Transactions"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="transaction",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"amount", "type", "date"},
     *             @OA\Property(property="amount", type="number", format="float", minimum=0, example=100.50),
     *             @OA\Property(property="type", type="string", enum={"income", "expense"}, example="expense"),
     *             @OA\Property(property="description", type="string", nullable=true, example="Grocery shopping"),
     *             @OA\Property(property="date", type="string", format="date", example="2024-01-15"),
     *             @OA\Property(property="category_id", type="integer", nullable=true, example=1)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Transaction updated successfully",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="id", type="integer", example=1),
     *             @OA\Property(property="user_id", type="integer", example=1),
     *             @OA\Property(property="name", type="string", example="Grocery"),
     *             @OA\Property(property="amount", type="number", format="float", example=100.50),
     *             @OA\Property(property="type", type="string", example="expense"),
     *             @OA\Property(property="description", type="string", nullable=true, example="Grocery shopping"),
     *             @OA\Property(property="date", type="string", format="date", example="2024-01-15"),
     *             @OA\Property(property="category_id", type="integer", nullable=true, example=1),
     *             @OA\Property(property="created_at", type="string", format="date-time", example="2024-01-15T00:00:00Z"),
     *             @OA\Property(property="updated_at", type="string", format="date-time", example="2024-01-15T00:00:00Z")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function update(CreateTransactionsRequest $request, Transaction $transaction)
    {
        $this->authorize('update', $transaction);
        $transaction->update($request->validated());

        return new TransactionResource($transaction);
    }

    /**
     * @OA\Delete(
     *     path="/api/transactions/{transaction}",
     *     summary="Delete a transaction",
     *     tags={"Transactions"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="transaction",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Transaction deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Transaction deleted successfully.")
     *         )
     *     )
     * )
     */
    public function destroy(Transaction $transaction)
    {
        $this->authorize('delete', $transaction);
        $transaction->delete();

        return $this->success(null, 'Transaction deleted successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/transactions/search",
     *     summary="Search and filter transactions",
     *     tags={"Transactions"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="type",
     *         in="query",
     *         description="Filter by transaction type",
     *         required=false,
     *         @OA\Schema(type="string", enum={"income", "expense"})
     *     ),
     *     @OA\Parameter(
     *         name="start_date",
     *         in="query",
     *         description="Filter transactions from this date",
     *         required=false,
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Parameter(
     *         name="end_date",
     *         in="query",
     *         description="Filter transactions to this date",
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
     *     @OA\Parameter(
     *         name="min_amount",
     *         in="query",
     *         description="Minimum amount",
     *         required=false,
     *         @OA\Schema(type="number")
     *     ),
     *     @OA\Parameter(
     *         name="max_amount",
     *         in="query",
     *         description="Maximum amount",
     *         required=false,
     *         @OA\Schema(type="number")
     *     ),
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Search transactions by name or description",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Filtered list of transactions",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="user_id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Grocery"),
     *                 @OA\Property(property="amount", type="number", format="float", example=100.50),
     *                 @OA\Property(property="type", type="string", example="expense"),
     *                 @OA\Property(property="description", type="string", nullable=true, example="Grocery shopping"),
     *                 @OA\Property(property="date", type="string", format="date", example="2024-01-15"),
     *                 @OA\Property(property="category_id", type="integer", nullable=true, example=1),
     *                 @OA\Property(property="created_at", type="string", format="date-time", example="2024-01-15T00:00:00Z"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time", example="2024-01-15T00:00:00Z")
     *             )),
     *             @OA\Property(property="links", type="object"),
     *             @OA\Property(property="meta", type="object")
     *         )
     *     )
     * )
     */

    public function search(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['error' => 'Authentication required'], 401);
        }

        $userId = Auth::id();

        $query = Transaction::with('category')->where('user_id', $userId);

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->where('date', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->where('date', '<=', $request->end_date);
        }

        // Filter by category_id
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by amount range
        if ($request->has('min_amount')) {
            $query->where('amount', '>=', $request->min_amount);
        }
        if ($request->has('max_amount')) {
            $query->where('amount', '<=', $request->max_amount);
        }

        // Search filter
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'LIKE', '%' . $searchTerm . '%')
                  ->orWhere('description', 'LIKE', '%' . $searchTerm . '%');
            });
        }

        // Simple sorting
        $sortBy = $request->get('sort_by', 'date');
        $sortOrder = $request->get('sort_order', 'desc');
        $allowedSortFields = ['date', 'amount', 'type', 'name'];
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        $paginated = $query->paginate(15);

        // Calculate totals
        $totalIncome = (clone $query)->where('type', 'income')->sum('amount');
        $totalExpenses = (clone $query)->where('type', 'expense')->sum('amount');

        $response = (new TransactionCollection($paginated))->additional([
            'totals' => [
                'income' => (float) $totalIncome,
                'expenses' => (float) $totalExpenses,
            ]
        ]);

        return $response;
    }
}
