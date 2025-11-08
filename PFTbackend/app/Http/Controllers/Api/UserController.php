<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use OpenApi\Annotations as OA;  // <-- Required import

/**
 * @OA\Info(title="Your API", version="1.0")  // Global API info (add to one file)
 */
class UserController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/users",
     *     summary="Get list of users",
     *     tags={"Users"},
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/User"))
     *     )
     * )
     */
    public function index()
    {
        // Your code
    }

    /**
     * @OA\Schema(
     *     schema="User",
     *     @OA\Property(property="id", type="integer"),
     *     @OA\Property(property="name", type="string")
     * )
     */
}