<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Http\Requests\CreateBudgetRequest;
use App\Http\Resources\BudgetResource;
use App\Http\Resources\BudgetCollection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BudgetController extends Controller
{
    public function index(Request $request)
    {
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

        $budgets = $query->paginate(15);
        return new BudgetCollection($budgets);
    }

    public function store(CreateBudgetRequest $request)
    {
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
        $budget->update($request->validated());
        return new BudgetResource($budget);
    }

    public function destroy(Budget $budget)
    {
        $this->authorize('delete', $budget);
        $budget->delete();
        return response()->json(['message' => 'Budget deleted successfully']);
    }
}
