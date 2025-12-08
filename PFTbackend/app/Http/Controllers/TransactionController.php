<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Budget;
use App\Http\Requests\CreateTransactionsRequest;
use App\Http\Resources\TransactionResource;
use App\Http\Resources\TransactionCollection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class TransactionController extends Controller
{
    use AuthorizesRequests;

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

        if ($request->filled('saving_goal_id')) {
            $query->where('saving_goal_id', $request->saving_goal_id);
        }

        if ($request->filled('budget_id')) {
            $query->where('budget_id', $request->budget_id);
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

    private function getCacheKey(Request $request, $userId)
    {
        $params = $request->all();
        ksort($params);
        return 'transactions_' . $userId . '_' . md5(json_encode($params));
    }

    public function index(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['error' => 'Authentication required'], 401);
        }

        $userId = Auth::id();
        $cacheKey = $this->getCacheKey($request, $userId);

        return Cache::tags(['user_transactions_' . $userId])->remember($cacheKey, 3600, function () use ($request, $userId) {
            $baseQuery = $this->buildTransactionQuery($request, $userId);

            // Optimization: Remove eager loading for aggregate queries to improve performance
            $aggregateQuery = clone $baseQuery;
            $aggregateQuery->setEagerLoads([]); // Remove eager loads

            // Optimization: Combine totals into single query
            $totals = (clone $aggregateQuery)
                ->selectRaw("SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income")
                ->selectRaw("SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses")
                ->first();

            $totalIncome = $totals->total_income ?? 0;
            $totalExpenses = $totals->total_expenses ?? 0;

            $totalExpensesByCategory = (clone $aggregateQuery)
                ->where('type', 'expense')
                ->whereNotNull('category_id') // Ensure category exists
                ->selectRaw('category_id, SUM(amount) as total')
                ->groupBy('category_id')
                ->with('category:id,name,type') // Select only necessary fields
                ->get()
                ->map(function ($item) {
                    return [
                        'category_id' => $item->category_id,
                        'category_name' => $item->category ? $item->category->name : 'Uncategorized',
                        'total' => (float) $item->total,
                    ];
                });

            $query = clone $baseQuery;
            $sortBy = $request->get('sort_by', 'date');
            $sortOrder = $request->get('sort_order', 'desc');
            $allowedSortFields = ['date', 'amount', 'type', 'name'];

            if (in_array($sortBy, $allowedSortFields)) {
                $query->orderBy($sortBy, $sortOrder)->orderBy('id', 'desc');
            }

            if ($request->has('all') && $request->all == 'true') {
                $transactions = $query->get();
                return (new TransactionCollection($transactions))->additional([
                    'totals' => [
                        'income' => (float) $totalIncome,
                        'expenses' => (float) $totalExpenses,
                    ],
                    'expense_by_category' => $totalExpensesByCategory,
                ]);
            }

            $paginated = $query->paginate(15);

            return (new TransactionCollection($paginated))->additional([
                'totals' => [
                    'income' => (float) $totalIncome,
                    'expenses' => (float) $totalExpenses,
                ],
                'expense_by_category' => $totalExpensesByCategory,
            ]);
        });
    }

    public function store(CreateTransactionsRequest $request)
    {
        $validatedData = $request->validated();

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

        if ($request->has('saving_goal_id')) {
            $validatedData['saving_goal_id'] = $request->saving_goal_id;
        }

        // Atomic Lock to prevent double submission
        // Lock for 10 seconds, wait up to 5 seconds to acquire
        $lock = Cache::lock('transaction_store_' . Auth::id(), 10);

        try {
            // Try to acquire lock, wait 5s if needed
            $lock->block(5);

            $transaction = \Illuminate\Support\Facades\DB::transaction(function () use ($validatedData, $request) {
                \Illuminate\Support\Facades\Log::info('Transaction Store Request:', $validatedData);
                
                // 1. Create Main Transaction
                // CRITICAL: If this is a split (savings allocation), do NOT link the main income to the savings goal.
                // The savings goal should only be linked to the transfer (expense) transaction.
                $mainTxData = $validatedData;
                if ($request->filled('savings_amount') && $request->savings_amount > 0) {
                    unset($mainTxData['saving_goal_id']);
                }
                
                $transaction = Auth::user()->transactions()->create($mainTxData);
                \Illuminate\Support\Facades\Log::info('Created Main Transaction:', $transaction->toArray());

                // 2. Handle Savings Split (Atomic)
                if ($request->filled('savings_amount') && $request->filled('saving_goal_id') && $request->savings_amount > 0) {
                    $saving = \App\Models\Saving::find($request->saving_goal_id);
                    
                    if ($saving) {
                        // Create Transfer Transaction (Expense)
                        Auth::user()->transactions()->create([
                            'name' => 'Transfer to ' . $saving->name,
                            'type' => 'expense',
                            'amount' => $request->savings_amount,
                            'description' => 'Auto-allocation from ' . $transaction->name,
                            'date' => $transaction->date,
                            'category_id' => $request->transfer_category_id,
                            'saving_goal_id' => $saving->id,
                            'budget_id' => null,
                        ]);
                    }
                }

                return $transaction;
            });

            return new TransactionResource($transaction);

        } catch (\Illuminate\Contracts\Cache\LockTimeoutException $e) {
            return response()->json(['message' => 'Too many requests. Please try again.'], 429);
        } finally {
            optional($lock)->release();
        }
    }

    public function show(Transaction $transaction)
    {
        $this->authorize('view', $transaction);
        return new TransactionResource($transaction);
    }

    public function update(CreateTransactionsRequest $request, Transaction $transaction)
    {
        $this->authorize('update', $transaction);

        // Check if transaction is older than 1 hour
        if ($transaction->created_at->diffInHours(now()) >= 1) {
            return response()->json([
                'message' => 'Transactions cannot be edited after 1 hour.'
            ], 403);
        }

        $validatedData = $request->validated();

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
                    $validatedData['budget_id'] = null;
                }
            }
        }

        if ($request->has('saving_goal_id')) {
            $validatedData['saving_goal_id'] = $request->saving_goal_id;
        }

        $transaction->update($validatedData);

        return new TransactionResource($transaction);
    }

    public function destroy(Transaction $transaction)
    {
        $this->authorize('delete', $transaction);
        $transaction->delete();

        return response()->json([
            'success' => true,
            'message' => 'Transaction deleted successfully.'
        ]);
    }

    public function search(Request $request)
    {
        return $this->index($request);
    }
}