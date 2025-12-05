<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Transaction;
use App\Http\Requests\CreateBudgetRequest;
use App\Http\Resources\BudgetResource;
use App\Http\Resources\BudgetCollection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Carbon\Carbon;

class BudgetController extends Controller
{
    use AuthorizesRequests;

    private function getCacheKey(Request $request, $userId)
    {
        $params = $request->all();
        ksort($params);
        return 'budgets_' . $userId . '_' . md5(json_encode($params));
    }

    private function clearUserCache($userId)
    {
        // Clear budget list
        Cache::tags(['user_budgets_' . $userId])->flush();

        // CRITICAL: Clear transaction list because deleting a budget deletes transactions
        Cache::tags(['user_transactions_' . $userId])->flush();
    }

    public function index(Request $request)
    {
        $userId = Auth::id();
        $cacheKey = $this->getCacheKey($request, $userId);

        return Cache::tags(['user_budgets_' . $userId])->remember($cacheKey, 3600, function () use ($request, $userId) {
            $query = Budget::where('user_id', $userId)
                ->withSum([
                    'transactions' => function ($q) {
                        $q->where('type', 'expense');
                    }
                ], 'amount');

            $status = $request->get('status', 'active');

            if ($request->has('search') && $request->search) {
                $query->where('name', 'like', '%' . $request->search . '%');
            }

            if ($request->has('category_id') && $request->category_id) {
                $query->where('category_id', $request->category_id);
            }

            $sortBy = $request->get('sort_by', 'created_at');
            $sortDir = $request->get('sort_dir', 'desc');

            $allowedSorts = ['name', 'amount', 'start_date', 'end_date', 'created_at', 'updated_at'];

            if (in_array($sortBy, $allowedSorts)) {
                $query->orderBy($sortBy, $sortDir);
            } else {
                $query->orderBy('created_at', 'desc');
            }

            if ($status === 'history') {
                $query->whereIn('status', ['completed', 'expired', 'reached']);
                return new BudgetCollection($query->paginate(10));
            }

            if ($status === 'active') {
                $query->where('status', 'active');
                return new BudgetCollection($query->get());
            }

            return new BudgetCollection($query->get());
        });
    }

    public function store(CreateBudgetRequest $request)
    {
        // Force update statuses to ensure we don't block creation if a budget just finished
        // $this->updateBudgetStatuses(true); // Moved to scheduled job

        if ($request->category_id) {
            $exists = Budget::where('user_id', Auth::id())
                ->where('status', 'active')
                ->where('category_id', $request->category_id)
                ->exists();

            if ($exists) {
                return response()->json(['message' => 'Active budget exists for this category.'], 422);
            }
        }

        $data = $request->validated();
        $data['status'] = 'active';

        $budget = Auth::user()->budgets()->create($data);

        $this->clearUserCache(Auth::id());

        return new BudgetResource($budget->fresh());
    }

    public function show(Budget $budget)
    {
        $this->authorize('view', $budget);
        return new BudgetResource($budget);
    }

    public function update(CreateBudgetRequest $request, Budget $budget)
    {
        $this->authorize('update', $budget);
        $budget->update($request->validated());
        // $this->updateBudgetStatuses(); // Moved to scheduled job

        $this->clearUserCache(Auth::id());

        return new BudgetResource($budget->fresh());
    }

    public function destroy(Budget $budget)
    {
        $this->authorize('delete', $budget);
        // $budget->transactions()->delete(); // REMOVED: Let DB 'set null' constraint handle unlinking
        $budget->delete();

        $this->clearUserCache(Auth::id());

        return response()->json(['success' => true]);
    }
}