<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Category;
use App\Models\Budget; // <--- Added Budget Model
use App\Http\Requests\CreateTransactionsRequest;
use App\Http\Resources\TransactionResource;
use App\Http\Resources\TransactionCollection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use OpenApi\Annotations as OA;

/**
 * @OA\Tag(
 * name="Transactions",
 * description="API Endpoints for managing transactions"
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
        $query = Transaction::with('category', 'budget')->where('user_id', $userId);

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
     * path="/api/transactions",
     * summary="Get list of transactions",
     * tags={"Transactions"},
     * security={{"sanctum":{}}},
     * @OA\Parameter(name="type", in="query", required=false, @OA\Schema(type="string", enum={"income", "expense"})),
     * @OA\Parameter(name="start_date", in="query", required=false, @OA\Schema(type="string", format="date")),
     * @OA\Parameter(name="end_date", in="query", required=false, @OA\Schema(type="string", format="date")),
     * @OA\Parameter(name="category_id", in="query", required=false, @OA\Schema(type="integer")),
     * @OA\Parameter(name="min_amount", in="query", required=false, @OA\Schema(type="number")),
     * @OA\Parameter(name="max_amount", in="query", required=false, @OA\Schema(type="number")),
     * @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     * @OA\Response(
     * response=200,
     * description="List of transactions",
     * @OA\JsonContent(
     * @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Transaction")),
     * @OA\Property(property="links", type="object"),
     * @OA\Property(property="meta", type="object")
     * )
     * )
     * )
     */
    public function index(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['error' => 'Authentication required'], 401);
        }

        $userId = Auth::id();

        $query = $this->buildTransactionQuery($request, $userId);

        $sortBy = $request->get('sort_by', 'date');
        $sortOrder = $request->get('sort_order', 'desc');
        $allowedSortFields = ['date', 'amount', 'type', 'name'];
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        // Totals Calculation
        $totalIncome = (clone $query)->where('type', 'income')->sum('amount');
        $totalExpenses = (clone $query)->where('type', 'expense')->sum('amount');

        $totalExpensesByCategory = (clone $query)
            ->where('type', 'expense')
            ->whereHas('category', function ($q) {
                $q->where('type', 'expense');
            })
            ->selectRaw('category_id, SUM(amount) as total')
            ->groupBy('category_id')
            ->with('category')
            ->get()
            ->map(function ($item) {
                return [
                    'category_id' => $item->category_id,
                    'category_name' => $item->category ? $item->category->name : 'Uncategorized',
                    'total' => (float) $item->total,
                ];
            });

        $paginated = $query->paginate(15);

        return (new TransactionCollection($paginated))->additional([
            'totals' => [
                'income' => (float) $totalIncome,
                'expenses' => (float) $totalExpenses,
            ],
            'expense_by_category' => $totalExpensesByCategory,
        ]);
    }

    /**
     * @OA\Post(
     * path="/api/transactions",
     * summary="Create a new transaction",
     * tags={"Transactions"},
     * security={{"sanctum":{}}},
     * @OA\RequestBody(
     * required=true,
     * @OA\JsonContent(ref="#/components/schemas/Transaction")
     * ),
     * @OA\Response(response=201, description="Transaction created successfully", @OA\JsonContent(ref="#/components/schemas/Transaction")),
     * @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(CreateTransactionsRequest $request)
    {
        $validatedData = $request->validated();

        // STRICT LINKING LOGIC:
        // If frontend didn't provide a budget_id, try to find one automatically.
        // This ensures the transaction is linked to a SPECIFIC budget ID, not just a generic category match.
        if (empty($validatedData['budget_id']) && $validatedData['type'] === 'expense' && !empty($validatedData['category_id'])) {
            $activeBudget = Budget::where('user_id', Auth::id())
                ->where('category_id', $validatedData['category_id'])
                ->where('status', 'active')
                ->where('start_date', '<=', $validatedData['date'])
                ->where('end_date', '>=', $validatedData['date'])
                ->first();

            if ($activeBudget) {
                $validatedData['budget_id'] = $activeBudget->id;
            }
        }

        $transaction = Auth::user()->transactions()->create($validatedData);

        return new TransactionResource($transaction);
    }

    /**
     * @OA\Get(
     * path="/api/transactions/{transaction}",
     * summary="Get a specific transaction",
     * tags={"Transactions"},
     * security={{"sanctum":{}}},
     * @OA\Parameter(name="transaction", in="path", required=true, @OA\Schema(type="integer")),
     * @OA\Response(response=200, description="Transaction details", @OA\JsonContent(ref="#/components/schemas/Transaction")),
     * @OA\Response(response=403, description="Unauthorized"),
     * @OA\Response(response=404, description="Transaction not found")
     * )
     */
    public function show(Transaction $transaction)
    {
        $this->authorize('view', $transaction);
        return new TransactionResource($transaction);
    }

    /**
     * @OA\Put(
     * path="/api/transactions/{transaction}",
     * summary="Update a transaction",
     * tags={"Transactions"},
     * security={{"sanctum":{}}},
     * @OA\Parameter(name="transaction", in="path", required=true, @OA\Schema(type="integer")),
     * @OA\RequestBody(required=true, @OA\JsonContent(ref="#/components/schemas/Transaction")),
     * @OA\Response(response=200, description="Transaction updated successfully", @OA\JsonContent(ref="#/components/schemas/Transaction")),
     * @OA\Response(response=422, description="Validation error")
     * )
     */
    public function update(CreateTransactionsRequest $request, Transaction $transaction)
    {
        $this->authorize('update', $transaction);

        $validatedData = $request->validated();

        // RE-EVALUATE LINKING:
        // If the user changed the Category OR the Date, we need to check if it still fits the current budget_id.
        // If budget_id was NOT sent by frontend (meaning they didn't manually lock it), we recalculate.
        if ($validatedData['type'] === 'expense' && isset($validatedData['category_id'])) {
            if (empty($validatedData['budget_id'])) {
                $activeBudget = Budget::where('user_id', Auth::id())
                    ->where('category_id', $validatedData['category_id'])
                    ->where('status', 'active')
                    ->where('start_date', '<=', $validatedData['date'])
                    ->where('end_date', '>=', $validatedData['date'])
                    ->first();

                if ($activeBudget) {
                    $validatedData['budget_id'] = $activeBudget->id;
                } else {
                    // Explicitly set to null if no matching budget is found (orphaned transaction)
                    $validatedData['budget_id'] = null;
                }
            }
        }

        $transaction->update($validatedData);

        return new TransactionResource($transaction);
    }

    /**
     * @OA\Delete(
     * path="/api/transactions/{transaction}",
     * summary="Delete a transaction",
     * tags={"Transactions"},
     * security={{"sanctum":{}}},
     * @OA\Parameter(name="transaction", in="path", required=true, @OA\Schema(type="integer")),
     * @OA\Response(
     * response=200,
     * description="Transaction deleted successfully",
     * @OA\JsonContent(
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Transaction deleted successfully.")
     * )
     * )
     * )
     */
    public function destroy(Transaction $transaction)
    {
        $this->authorize('delete', $transaction);
        $transaction->delete();

        // Note: We don't use $this->success because it's not a standard Laravel method unless you created a trait.
        // Returning standard JSON response.
        return response()->json([
            'success' => true,
            'message' => 'Transaction deleted successfully.'
        ]);
    }

    // Keep search for backward compatibility if routes point to it, 
    // but the logic is now inside index()
    public function search(Request $request)
    {
        return $this->index($request);
    }
}