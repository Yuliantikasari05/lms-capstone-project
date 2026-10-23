<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\RoleResource;
use App\Models\Role;
use Illuminate\Http\JsonResponse;

class RoleController extends Controller
{
    /**
     * List all available roles with user counts.
     */
    public function index(): JsonResponse
    {
        $roles = Role::withCount('users')->orderBy('id')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar peran berhasil diambil.',
            'data' => RoleResource::collection($roles),
        ]);
    }
}
