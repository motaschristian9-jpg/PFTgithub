<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Budget;
use App\Http\Requests\CreateTransactionsRequest;
use App\Http\Resources\TransactionResource;
use App\Http\Resources\TransactionCollection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'LIKE', '%' . $searchTerm . '%')
                    ->orWhere('description', 'LIKE', '%' . $searchTerm . '%');
            });
        }

        return $query;
    }

    public function index(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['error' => 'Authentication required'], 401);
        }

        $userId = Auth::id();

        $baseQuery = $this->buildTransactionQuery($request, $userId);
        $query = clone $baseQuery;

        $sortBy = $request->get('sort_by', 'date');
        $sortOrder = $request->get('sort_order', 'desc');
        $allowedSortFields = ['date', 'amount', 'type', 'name'];
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        $totalIncome = (clone $baseQuery)->where('type', 'income')->sum('amount');
        $totalExpenses = (clone $baseQuery)->where('type', 'expense')->sum('amount');

        $totalExpensesByCategory = (clone $baseQuery)
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

        $transaction = Auth::user()->transactions()->create($validatedData);

        return new TransactionResource($transaction);
    }

    public function show(Transaction $transaction)
    {
        $this->authorize('view', $transaction);
        return new TransactionResource($transaction);
    }

    public function update(CreateTransactionsRequest $request, Transaction $transaction)
    {
        $this->authorize('update', $transaction);

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