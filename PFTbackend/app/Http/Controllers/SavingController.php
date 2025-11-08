<?php

namespace App\Http\Controllers;

use App\Models\Saving;
use App\Http\Requests\CreateSavingsRequest;
use App\Http\Resources\SavingResource;
use App\Http\Resources\SavingCollection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="CreateSavingsRequest",
 *     type="object",
 *     required={"name", "target_amount"},
 *     @OA\Property(property="name", type="string", maxLength=255, example="Emergency Fund"),
 *     @OA\Property(property="target_amount", type="number", format="float", minimum=0, example=1000.00),
 *     @OA\Property(property="current_amount", type="number", format="float", minimum=0, example=0.00),
 *     @OA\Property(property="description", type="string", nullable=true, example="For unexpected expenses")
 * )
 */

/**
 * @OA\Tag(
 *     name="Savings",
 *     description="API Endpoints for managing savings goals"
 * )
 */
class SavingController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/savings",
     *     summary="Get list of savings",
     *     tags={"Savings"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="name",
     *         in="query",
     *         description="Filter by saving name",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="min_target",
     *         in="query",
     *         description="Minimum target amount",
     *         required=false,
     *         @OA\Schema(type="number")
     *     ),
     *     @OA\Parameter(
     *         name="max_target",
     *         in="query",
     *         description="Maximum target amount",
     *         required=false,
     *         @OA\Schema(type="number")
     *     ),
     *     @OA\Parameter(
     *         name="min_current",
     *         in="query",
     *         description="Minimum current amount",
     *         required=false,
     *         @OA\Schema(type="number")
     *     ),
     *     @OA\Parameter(
     *         name="max_current",
     *         in="query",
     *         description="Maximum current amount",
     *         required=false,
     *         @OA\Schema(type="number")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="List of savings",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="user_id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Emergency Fund"),
     *                 @OA\Property(property="target_amount", type="number", format="float", example=1000.00),
     *                 @OA\Property(property="current_amount", type="number", format="float", example=500.00),
     *                 @OA\Property(property="created_at", type="string", format="date-time", example="2024-01-01T00:00:00Z"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time", example="2024-01-01T00:00:00Z")
     *             )),
     *             @OA\Property(property="links", type="object"),
     *             @OA\Property(property="meta", type="object")
     *         )
     *     )
     * )
     */
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

    /**
     * @OA\Post(
     *     path="/api/savings",
     *     summary="Create a new saving goal",
     *     tags={"Savings"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name", "target_amount"},
     *             @OA\Property(property="name", type="string", maxLength=255, example="Emergency Fund"),
     *             @OA\Property(property="target_amount", type="number", format="float", minimum=0, example=1000.00),
     *             @OA\Property(property="current_amount", type="number", format="float", minimum=0, example=0.00)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Saving goal created successfully",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="id", type="integer", example=1),
     *             @OA\Property(property="user_id", type="integer", example=1),
     *             @OA\Property(property="name", type="string", example="Emergency Fund"),
     *             @OA\Property(property="target_amount", type="number", format="float", example=1000.00),
     *             @OA\Property(property="current_amount", type="number", format="float", example=0.00),
     *             @OA\Property(property="created_at", type="string", format="date-time", example="2024-01-01T00:00:00Z"),
     *             @OA\Property(property="updated_at", type="string", format="date-time", example="2024-01-01T00:00:00Z")
     *         )
     *     )
     * )
     */
    public function store(CreateSavingsRequest $request)
    {
        $saving = Auth::user()->savings()->create($request->validated());

        // Clear cache for user's savings
        Cache::forget('user_' . Auth::id() . '_savings_*');

        return new SavingResource($saving);
    }

    /**
     * @OA\Get(
     *     path="/api/savings/{saving}",
     *     summary="Get a specific saving goal",
     *     tags={"Savings"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="saving",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Saving goal details",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="id", type="integer", example=1),
     *             @OA\Property(property="user_id", type="integer", example=1),
     *             @OA\Property(property="name", type="string", example="Emergency Fund"),
     *             @OA\Property(property="target_amount", type="number", format="float", example=1000.00),
     *             @OA\Property(property="current_amount", type="number", format="float", example=500.00),
     *             @OA\Property(property="created_at", type="string", format="date-time", example="2024-01-01T00:00:00Z"),
     *             @OA\Property(property="updated_at", type="string", format="date-time", example="2024-01-01T00:00:00Z")
     *         )
     *     ),
     *     @OA\Response(response=403, description="Unauthorized"),
     *     @OA\Response(response=404, description="Saving goal not found")
     * )
     */
    public function show(Saving $saving)
    {
        $this->authorize('view', $saving);
        return new SavingResource($saving);
    }

    /**
     * @OA\Put(
     *     path="/api/savings/{saving}",
     *     summary="Update a saving goal",
     *     tags={"Savings"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="saving",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name", "target_amount"},
     *             @OA\Property(property="name", type="string", maxLength=255, example="Emergency Fund"),
     *             @OA\Property(property="target_amount", type="number", format="float", minimum=0, example=1000.00),
     *             @OA\Property(property="current_amount", type="number", format="float", minimum=0, example=0.00)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Saving goal updated successfully",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="id", type="integer", example=1),
     *             @OA\Property(property="user_id", type="integer", example=1),
     *             @OA\Property(property="name", type="string", example="Emergency Fund"),
     *             @OA\Property(property="target_amount", type="number", format="float", example=1000.00),
     *             @OA\Property(property="current_amount", type="number", format="float", example=500.00),
     *             @OA\Property(property="created_at", type="string", format="date-time", example="2024-01-01T00:00:00Z"),
     *             @OA\Property(property="updated_at", type="string", format="date-time", example="2024-01-01T00:00:00Z")
     *         )
     *     )
     * )
     */
    public function update(CreateSavingsRequest $request, Saving $saving)
    {
        $this->authorize('update', $saving);
        $saving->update($request->validated());

        // Clear cache for user's savings
        Cache::forget('user_' . Auth::id() . '_savings_*');

        return new SavingResource($saving);
    }

    /**
     * @OA\Delete(
     *     path="/api/savings/{saving}",
     *     summary="Delete a saving goal",
     *     tags={"Savings"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="saving",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Saving goal deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Saving deleted successfully.")
     *         )
     *     )
     * )
     */
    public function destroy(Saving $saving)
    {
        $this->authorize('delete', $saving);
        $saving->delete();

        // Clear cache for user's savings
        Cache::forget('user_' . Auth::id() . '_savings_*');

        return $this->success(null, 'Saving deleted successfully.');
    }
}
