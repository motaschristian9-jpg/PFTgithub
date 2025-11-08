<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Http\Requests\CreateTransactionsRequest;
use App\Http\Resources\TransactionResource;
use App\Http\Resources\TransactionCollection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use OpenApi\Annotations as OA;

/**
 * @OA\Tag(
 *     name="Transactions",
 *     description="API Endpoints for managing transactions"
 * )
 */
class TransactionController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/transactions",
     *     summary="Get list of transactions",
     *     tags={"Transactions"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="type",
     *         in="query",
     *         description="Filter by transaction type",
     *         required=false,
     *         @OA\Schema(type="string", enum={"income", "expense"})
     *     ),
     *     @OA\Parameter(
     *         name="start_date",
     *         in="query",
     *         description="Filter transactions from this date",
     *         required=false,
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Parameter(
     *         name="end_date",
     *         in="query",
     *         description="Filter transactions to this date",
     *         required=false,
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Parameter(
     *         name="category_id",
     *         in="query",
     *         description="Filter by category ID",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="min_amount",
     *         in="query",
     *         description="Minimum amount",
     *         required=false,
     *         @OA\Schema(type="number")
     *     ),
     *     @OA\Parameter(
     *         name="max_amount",
     *         in="query",
     *         description="Maximum amount",
     *         required=false,
     *         @OA\Schema(type="number")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="List of transactions",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="user_id", type="integer", example=1),
     *                 @OA\Property(property="amount", type="number", format="float", example=100.50),
     *                 @OA\Property(property="type", type="string", example="expense"),
     *                 @OA\Property(property="description", type="string", nullable=true, example="Grocery shopping"),
     *                 @OA\Property(property="date", type="string", format="date", example="2024-01-15"),
     *                 @OA\Property(property="category_id", type="integer", nullable=true, example=1),
     *                 @OA\Property(property="created_at", type="string", format="date-time", example="2024-01-15T00:00:00Z"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time", example="2024-01-15T00:00:00Z")
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
        $cacheKey = 'user_' . $userId . '_transactions_' . md5(serialize($request->all()));

        $transactions = Cache::remember($cacheKey, 3600, function () use ($request, $userId) {
            $query = Auth::user()->transactions()->orderBy('date', 'desc');

            // Filter by type
            if ($request->has('type')) {
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

            // Filter by amount range
            if ($request->has('min_amount')) {
                $query->where('amount', '>=', $request->min_amount);
            }
            if ($request->has('max_amount')) {
                $query->where('amount', '<=', $request->max_amount);
            }

            return $query->paginate(15);
        });

        return new TransactionCollection($transactions);
    }

    /**
     * @OA\Post(
     *     path="/api/transactions",
     *     summary="Create a new transaction",
     *     tags={"Transactions"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"amount", "type", "date"},
     *             @OA\Property(property="amount", type="number", format="float", minimum=0, example=100.50),
     *             @OA\Property(property="type", type="string", enum={"income", "expense"}, example="expense"),
     *             @OA\Property(property="description", type="string", nullable=true, example="Grocery shopping"),
     *             @OA\Property(property="date", type="string", format="date", example="2024-01-15"),
     *             @OA\Property(property="category_id", type="integer", nullable=true, example=1)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Transaction created successfully",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="id", type="integer", example=1),
     *             @OA\Property(property="user_id", type="integer", example=1),
     *             @OA\Property(property="amount", type="number", format="float", example=100.50),
     *             @OA\Property(property="type", type="string", example="expense"),
     *             @OA\Property(property="description", type="string", nullable=true, example="Grocery shopping"),
     *             @OA\Property(property="date", type="string", format="date", example="2024-01-15"),
     *             @OA\Property(property="category_id", type="integer", nullable=true, example=1),
     *             @OA\Property(property="created_at", type="string", format="date-time", example="2024-01-15T00:00:00Z"),
     *             @OA\Property(property="updated_at", type="string", format="date-time", example="2024-01-15T00:00:00Z")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(CreateTransactionsRequest $request)
    {
        $transaction = Auth::user()->transactions()->create($request->validated());

        // Clear cache for user's transactions
        Cache::forget('user_' . Auth::id() . '_transactions_*');

        return new TransactionResource($transaction);
    }

    /**
     * @OA\Get(
     *     path="/api/transactions/{transaction}",
     *     summary="Get a specific transaction",
     *     tags={"Transactions"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="transaction",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Transaction details",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="id", type="integer", example=1),
     *             @OA\Property(property="user_id", type="integer", example=1),
     *             @OA\Property(property="amount", type="number", format="float", example=100.50),
     *             @OA\Property(property="type", type="string", example="expense"),
     *             @OA\Property(property="description", type="string", nullable=true, example="Grocery shopping"),
     *             @OA\Property(property="date", type="string", format="date", example="2024-01-15"),
     *             @OA\Property(property="category_id", type="integer", nullable=true, example=1),
     *             @OA\Property(property="created_at", type="string", format="date-time", example="2024-01-15T00:00:00Z"),
     *             @OA\Property(property="updated_at", type="string", format="date-time", example="2024-01-15T00:00:00Z")
     *         )
     *     ),
     *     @OA\Response(response=403, description="Unauthorized"),
     *     @OA\Response(response=404, description="Transaction not found")
     * )
     */
    public function show(Transaction $transaction)
    {
        $this->authorize('view', $transaction);
        return new TransactionResource($transaction);
    }

    /**
     * @OA\Put(
     *     path="/api/transactions/{transaction}",
     *     summary="Update a transaction",
     *     tags={"Transactions"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="transaction",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"amount", "type", "date"},
     *             @OA\Property(property="amount", type="number", format="float", minimum=0, example=100.50),
     *             @OA\Property(property="type", type="string", enum={"income", "expense"}, example="expense"),
     *             @OA\Property(property="description", type="string", nullable=true, example="Grocery shopping"),
     *             @OA\Property(property="date", type="string", format="date", example="2024-01-15"),
     *             @OA\Property(property="category_id", type="integer", nullable=true, example=1)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Transaction updated successfully",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="id", type="integer", example=1),
     *             @OA\Property(property="user_id", type="integer", example=1),
     *             @OA\Property(property="amount", type="number", format="float", example=100.50),
     *             @OA\Property(property="type", type="string", example="expense"),
     *             @OA\Property(property="description", type="string", nullable=true, example="Grocery shopping"),
     *             @OA\Property(property="date", type="string", format="date", example="2024-01-15"),
     *             @OA\Property(property="category_id", type="integer", nullable=true, example=1),
     *             @OA\Property(property="created_at", type="string", format="date-time", example="2024-01-15T00:00:00Z"),
     *             @OA\Property(property="updated_at", type="string", format="date-time", example="2024-01-15T00:00:00Z")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function update(CreateTransactionsRequest $request, Transaction $transaction)
    {
        $this->authorize('update', $transaction);
        $transaction->update($request->validated());

        // Clear cache for user's transactions
        Cache::forget('user_' . Auth::id() . '_transactions_*');

        return new TransactionResource($transaction);
    }

    /**
     * @OA\Delete(
     *     path="/api/transactions/{transaction}",
     *     summary="Delete a transaction",
     *     tags={"Transactions"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="transaction",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Transaction deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Transaction deleted successfully.")
     *         )
     *     )
     * )
     */
    public function destroy(Transaction $transaction)
    {
        $this->authorize('delete', $transaction);
        $transaction->delete();

        // Clear cache for user's transactions
        Cache::forget('user_' . Auth::id() . '_transactions_*');

        return $this->success(null, 'Transaction deleted successfully.');
    }
}
