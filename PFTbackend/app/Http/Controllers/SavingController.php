<?php

namespace App\Http\Controllers;

use App\Models\Saving;
use App\Http\Requests\CreateSavingsRequest;
use App\Http\Resources\SavingResource;
use App\Http\Resources\SavingCollection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class SavingController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        // 1. Run the sync check to ensure data integrity
        $this->syncStatuses();

        // 2. Start query
        $query = Saving::where('user_id', Auth::id());

        // 3. ✅ FIXED LOGIC:
        // Only filter by status if the frontend explicitly asks for it.
        // If 'status' is NOT in the request, we return EVERYTHING (Active + Completed).
        if ($request->has('status')) {
            $status = $request->get('status');

            if ($status === 'history') {
                $query->whereIn('status', ['completed', 'cancelled']);
            } elseif ($status === 'active') {
                $query->where('status', 'active');
            }
        }

        // 4. Search logic
        if ($request->has('name')) {
            $query->where('name', 'like', '%' . $request->name . '%');
        }

        // 5. Sort by newest
        $query->orderBy('created_at', 'desc');

        // 6. Return paginated results (increased to 50 to ensure we get enough history items on one page)
        return new SavingCollection($query->paginate(50));
    }

    public function store(CreateSavingsRequest $request)
    {
        $data = $request->validated();
        $data['status'] = 'active';

        // Check if created with full amount
        if (isset($data['current_amount']) && $data['current_amount'] >= $data['target_amount']) {
            $data['status'] = 'completed';
        }

        $saving = Auth::user()->savings()->create($data);

        return new SavingResource($saving);
    }

    public function update(CreateSavingsRequest $request, Saving $saving)
    {
        $this->authorize('update', $saving);

        $saving->fill($request->validated());

        // LOGIC: Check if 100% reached
        if ($saving->current_amount >= $saving->target_amount) {
            $saving->status = 'completed';
        } else {
            // If they withdraw money, flip it back to active
            $saving->status = 'active';
        }

        $saving->save();

        return new SavingResource($saving->fresh());
    }

    /**
     * Helper to ensure all database rows have correct status
     */
    private function syncStatuses()
    {
        $userId = Auth::id();

        // Find 'active' savings that should be 'completed'
        Saving::where('user_id', $userId)
            ->where('status', 'active')
            ->whereColumn('current_amount', '>=', 'target_amount')
            ->update(['status' => 'completed']);
    }

    public function destroy(Saving $saving)
    {
        $this->authorize('delete', $saving);
        $saving->delete();
        return response()->json(['success' => true]);
    }

    public function show(Saving $saving)
    {
        $this->authorize('view', $saving);
        return new SavingResource($saving);
    }
}