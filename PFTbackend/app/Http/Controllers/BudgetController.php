<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Http\Requests\CreateBudgetRequest;
use App\Http\Resources\BudgetResource;
use App\Http\Resources\BudgetCollection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class BudgetController extends Controller
{
    public function index(Request $request)
    {
        $userId = Auth::id();
        $cacheKey = 'user_' . $userId . '_budgets_' . md5(serialize($request->all()));

        $budgets = Cache::remember($cacheKey, 3600, function () use ($request, $userId) {
            $query = Auth::user()->budgets()->with('transactions')->orderBy('created_at', 'desc');

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

    public function store(CreateBudgetRequest $request)
    {
        $budget = Auth::user()->budgets()->create($request->validated());

        // Clear cache for user's budgets
        Cache::forget('user_' . Auth::id() . '_budgets_*');

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
        $budget->update($request->validated());

        // Clear cache for user's budgets
        Cache::forget('user_' . Auth::id() . '_budgets_*');

        return new BudgetResource($budget);
    }

    public function destroy(Budget $budget)
    {
        $this->authorize('delete', $budget);
        $budget->delete();

        // Clear cache for user's budgets
        Cache::forget('user_' . Auth::id() . '_budgets_*');

        return response()->json(['message' => 'Budget deleted successfully']);
    }
}
