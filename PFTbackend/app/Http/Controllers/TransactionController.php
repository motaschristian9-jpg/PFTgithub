<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Http\Requests\CreateTransactionsRequest;
use App\Http\Requests\UpdateTransactionsRequest;
use App\Http\Resources\TransactionResource;
use App\Http\Resources\TransactionCollection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $userId = Auth::id();
        $cacheKey = 'user_' . $userId . '_transactions_' . md5(serialize($request->all()));

        $transactions = Cache::remember($cacheKey, 3600, function () use ($request, $userId) {
            $query = Auth::user()->transactions()->with('budget')->orderBy('date', 'desc');

            // Filter by type
            if ($request->has('type') && in_array($request->type, ['income', 'expense'])) {
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

            return $query->paginate(15);
        });

        return new TransactionCollection($transactions);
    }

    public function store(CreateTransactionsRequest $request)
    {
        $transaction = Auth::user()->transactions()->create($request->validated());

        // Clear cache for user's transactions and monthly summaries
        Cache::forget('user_' . Auth::id() . '_transactions_*');
        Cache::forget('user_' . Auth::id() . '_monthly_summary_*');

        return new TransactionResource($transaction);
    }

    public function show(Transaction $transaction)
    {
        $this->authorize('view', $transaction);
        return new TransactionResource($transaction);
    }

    public function update(UpdateTransactionsRequest $request, Transaction $transaction)
    {
        $this->authorize('update', $transaction);
        $transaction->update($request->validated());

        // Clear cache for user's transactions and monthly summaries
        Cache::forget('user_' . Auth::id() . '_transactions_*');
        Cache::forget('user_' . Auth::id() . '_monthly_summary_*');

        return new TransactionResource($transaction);
    }

    public function destroy(Transaction $transaction)
    {
        $this->authorize('delete', $transaction);
        $transaction->delete();

        // Clear cache for user's transactions and monthly summaries
        Cache::forget('user_' . Auth::id() . '_transactions_*');
        Cache::forget('user_' . Auth::id() . '_monthly_summary_*');

        return response()->json(['message' => 'Transaction deleted successfully']);
    }

    public function monthlySummary(Request $request)
    {
        $userId = Auth::id();
        $year = $request->get('year', date('Y'));
        $month = $request->get('month', date('m'));
        $cacheKey = 'user_' . $userId . '_monthly_summary_' . $year . '_' . $month;

        $summary = Cache::remember($cacheKey, 3600, function () use ($userId, $year, $month) {
            $startDate = $year . '-' . str_pad($month, 2, '0', STR_PAD_LEFT) . '-01';
            $endDate = date('Y-m-t', strtotime($startDate));

            $transactions = Auth::user()->transactions()
                ->whereBetween('date', [$startDate, $endDate])
                ->get();

            $totalIncome = $transactions->where('type', 'income')->sum('amount');
            $totalExpense = $transactions->where('type', 'expense')->sum('amount');
            $netIncome = $totalIncome - $totalExpense;

            $categoryBreakdown = $transactions->groupBy('category_id')->map(function ($group) {
                return [
                    'category_id' => $group->first()->category_id,
                    'total' => $group->sum('amount'),
                    'count' => $group->count(),
                ];
            });

            return [
                'year' => $year,
                'month' => $month,
                'total_income' => $totalIncome,
                'total_expense' => $totalExpense,
                'net_income' => $netIncome,
                'category_breakdown' => $categoryBreakdown,
                'transaction_count' => $transactions->count(),
            ];
        });

        return response()->json($summary);
    }
}
