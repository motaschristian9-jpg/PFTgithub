<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Transaction;
use App\Http\Requests\CreateBudgetRequest;
use App\Http\Resources\BudgetResource;
use App\Http\Resources\BudgetCollection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Carbon\Carbon;

class BudgetController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $this->updateBudgetStatuses();

        $query = Budget::where('user_id', Auth::id());

        $status = $request->get('status', 'active');

        if ($status === 'history') {
            $query->whereIn('status', ['completed', 'expired', 'reached']);
        } elseif ($status === 'active') {
            $query->where('status', 'active');
        }

        $query->orderBy('created_at', 'desc');

        if ($request->has('name'))
            $query->where('name', 'like', '%' . $request->name . '%');
        if ($request->has('category_id'))
            $query->where('category_id', $request->category_id);

        return new BudgetCollection($query->get());
    }

    private function updateBudgetStatuses()
    {
        $userId = Auth::id();
        $today = Carbon::now()->format('Y-m-d');

        // 1. Time Expiration
        Budget::where('user_id', $userId)
            ->where('status', 'active')
            ->where('end_date', '<', $today)
            ->update(['status' => 'expired']);

        // 2. Limit Reached (STRICT ID LINKING)
        $activeBudgets = Budget::where('user_id', $userId)
            ->where('status', 'active')
            ->get();

        foreach ($activeBudgets as $budget) {
            // FIX: We ONLY sum transactions that are explicitly linked to this budget ID.
            $totalSpent = Transaction::where('budget_id', $budget->id)->sum('amount');

            if ($totalSpent >= $budget->amount) {
                $budget->update(['status' => 'reached']);
            }
        }
    }

    public function store(CreateBudgetRequest $request)
    {
        // Check for existing ACTIVE budget
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

        // 1. Create the Budget
        $budget = Auth::user()->budgets()->create($data);

        // NOTE: Retroactive linking block has been removed here.
        // Old transactions will NOT be automatically linked to this new budget.
        // They will remain with budget_id = null (or whatever they had before).

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

        // Also ensure linked transactions are still valid or check if more need to be added?
        // For now, simpler to just re-calc status. 
        // Note: Changing dates on update might orphan transactions, 
        // but that's complex logic. We stick to status update.
        $this->updateBudgetStatuses();

        return new BudgetResource($budget->fresh());
    }

    public function destroy(Budget $budget)
    {
        $this->authorize('delete', $budget);

        // CASCADING DELETE
        // Delete all transactions tied to this budget first
        $budget->transactions()->delete();

        // Then delete the budget
        $budget->delete();

        return response()->json(['success' => true]);
    }
}