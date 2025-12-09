<?php

namespace App\Http\Controllers;

use App\Models\Saving;
use App\Http\Requests\CreateSavingsRequest;
use App\Http\Resources\SavingResource;
use App\Http\Resources\SavingCollection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class SavingController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $userId = Auth::id();
        // Sync statuses before returning data
        $this->syncStatuses();

        $cacheKey = 'savings_' . $userId . '_' . md5(json_encode($request->all()));

        return Cache::tags(['user_savings_' . $userId])->remember($cacheKey, 3600, function () use ($request, $userId) {
            $query = Saving::where('user_id', $userId);
            $status = $request->get('status', 'active');

            if ($request->has('search') && $request->search) {
                $query->where('name', 'like', '%' . $request->search . '%');
            }

            $sortBy = $request->get('sort_by', 'created_at');
            $sortDir = $request->get('sort_dir', 'desc');

            $allowedSorts = ['name', 'target_amount', 'current_amount', 'target_date', 'created_at', 'updated_at'];

            if (in_array($sortBy, $allowedSorts)) {
                $query->orderBy($sortBy, $sortDir);
            } else {
                $query->orderBy('created_at', 'desc');
            }

            if ($status === 'history') {
                $query->whereIn('status', ['completed', 'cancelled']);
                return new SavingCollection($query->paginate(10));
            }

            if ($status === 'active') {
                $query->where('status', 'active');
                return new SavingCollection($query->get());
            }

            return new SavingCollection($query->get());
        });
    }

    public function store(CreateSavingsRequest $request)
    {
        $data = $request->validated();
        $data['status'] = 'active';

        if (isset($data['current_amount']) && $data['current_amount'] >= $data['target_amount']) {
            $data['status'] = 'completed';
        }

        $saving = Auth::user()->savings()->create($data);

        $this->clearUserCache(Auth::id());

        return new SavingResource($saving);
    }

    public function update(CreateSavingsRequest $request, Saving $saving)
    {
        $this->authorize('update', $saving);

        $saving->fill($request->validated());

        $wasCompleted = $saving->getOriginal('status') === 'completed' || $saving->getOriginal('current_amount') >= $saving->getOriginal('target_amount');

        if ($saving->current_amount == 0 && $wasCompleted) {
            $saving->delete();
            return response()->json(['deleted' => true, 'message' => 'Saving goal deleted as it was fully withdrawn.']);
        }

        if ($saving->current_amount >= $saving->target_amount) {
            $saving->status = 'completed';
        } else {
            $saving->status = 'active';
        }

        $saving->save();

        $this->clearUserCache(Auth::id());

        return new SavingResource($saving->fresh());
    }

    private function syncStatuses()
    {
        $userId = Auth::id();
        $cacheKey = 'saving_status_check_' . $userId;

        // Optimization: Only run status updates once per hour
        if (Cache::has($cacheKey)) {
            return;
        }

        // Use bulk update directly instead of fetching and looping
        Saving::where('user_id', $userId)
            ->where('status', 'active')
            ->whereColumn('current_amount', '>=', 'target_amount')
            ->update(['status' => 'completed']);

        // Set cache to prevent re-running for 1 hour
        Cache::put($cacheKey, true, 3600);
    }

    public function destroy(Request $request, Saving $saving)
    {
        $this->authorize('delete', $saving);

        $refundParam = $request->query('refund_transactions');
        $shouldRefund = filter_var($refundParam, FILTER_VALIDATE_BOOLEAN);

        if ($shouldRefund) {
            $saving->transactions()
                ->where(function ($query) {
                    $query->where('type', 'expense')
                          ->orWhere(function ($q) {
                              $q->where('type', 'income')
                                ->where('name', 'like', 'Withdrawal:%');
                          });
                })
                ->delete();
        }

        $saving->delete();

        $this->clearUserCache(Auth::id());

        return response()->json(['success' => true]);
    }

    private function clearUserCache($userId)
    {
        // Clear transactions list
        Cache::tags(['user_transactions_' . $userId])->flush();

        // Clear budgets list because budgets calculate 'total spent' from transactions
        Cache::tags(['user_budgets_' . $userId])->flush();

        // Clear savings list
        Cache::tags(['user_savings_' . $userId])->flush();
    }

    public function show(Saving $saving)
    {
        $this->authorize('view', $saving);
        return new SavingResource($saving);
    }
}