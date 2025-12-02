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

    private function getCacheKey(Request $request, $userId)
    {
        $params = $request->all();
        ksort($params);
        return 'savings_' . $userId . '_' . md5(json_encode($params));
    }

    private function clearUserCache($userId)
    {
        Cache::tags(['user_savings_' . $userId])->flush();
    }

    public function index(Request $request)
    {
        $userId = Auth::id();
        $cacheKey = $this->getCacheKey($request, $userId);

        return Cache::tags(['user_savings_' . $userId])->remember($cacheKey, 3600, function () use ($request, $userId) {
            $this->syncStatuses();

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

        Saving::where('user_id', $userId)
            ->where('status', 'active')
            ->whereColumn('current_amount', '>=', 'target_amount')
            ->update(['status' => 'completed']);
    }

    public function destroy(Saving $saving)
    {
        $this->authorize('delete', $saving);
        $saving->delete();

        $this->clearUserCache(Auth::id());

        return response()->json(['success' => true]);
    }

    public function show(Saving $saving)
    {
        $this->authorize('view', $saving);
        return new SavingResource($saving);
    }
}