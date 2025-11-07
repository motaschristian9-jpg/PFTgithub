<?php

namespace App\Http\Controllers;

use App\Models\Saving;
use App\Http\Requests\CreateSavingsRequest;
use App\Http\Resources\SavingResource;
use App\Http\Resources\SavingCollection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class SavingController extends Controller
{
    public function index(Request $request)
    {
        $userId = Auth::id();
        $cacheKey = 'user_' . $userId . '_savings_' . md5(serialize($request->all()));

        $savings = Cache::remember($cacheKey, 3600, function () use ($request, $userId) {
            $query = Auth::user()->savings()->orderBy('created_at', 'desc');

            // Filter by name
            if ($request->has('name')) {
                $query->where('name', 'like', '%' . $request->name . '%');
            }

            // Filter by target_amount range
            if ($request->has('min_target')) {
                $query->where('target_amount', '>=', $request->min_target);
            }
            if ($request->has('max_target')) {
                $query->where('target_amount', '<=', $request->max_target);
            }

            // Filter by current_amount range
            if ($request->has('min_current')) {
                $query->where('current_amount', '>=', $request->min_current);
            }
            if ($request->has('max_current')) {
                $query->where('current_amount', '<=', $request->max_current);
            }

            return $query->paginate(15);
        });

        return new SavingCollection($savings);
    }

    public function store(CreateSavingsRequest $request)
    {
        $saving = Auth::user()->savings()->create($request->validated());

        // Clear cache for user's savings
        Cache::forget('user_' . Auth::id() . '_savings_*');

        return new SavingResource($saving);
    }

    public function show(Saving $saving)
    {
        $this->authorize('view', $saving);
        return new SavingResource($saving);
    }

    public function update(CreateSavingsRequest $request, Saving $saving)
    {
        $this->authorize('update', $saving);
        $saving->update($request->validated());

        // Clear cache for user's savings
        Cache::forget('user_' . Auth::id() . '_savings_*');

        return new SavingResource($saving);
    }

    public function destroy(Saving $saving)
    {
        $this->authorize('delete', $saving);
        $saving->delete();

        // Clear cache for user's savings
        Cache::forget('user_' . Auth::id() . '_savings_*');

        return response()->json(['message' => 'Saving deleted successfully']);
    }
}
