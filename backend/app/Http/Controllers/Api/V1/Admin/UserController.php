<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

class UserController extends Controller
{
    /**
     * Display a listing of users with search, role filter, and pagination.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', User::class);

        $query = User::with('roles');

        // Search by keyword (name, email, phone)
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Filter by role name
        if ($roleName = $request->input('role')) {
            $query->whereHas('roles', fn ($q) => $q->where('name', $roleName));
        }

        // Filter by active status ("is_active=" from the "Semua Status" option arrives as null)
        if ($request->filled('is_active')) {
            $isActive = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN);
            $query->where('is_active', $isActive);
        }

        $perPage = min((int) $request->input('per_page', 10), 100);
        $users = $query->latest('id')->paginate($perPage);

        return UserResource::collection($users);
    }

    /**
     * Store a newly created user.
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'avatar_url' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=' . urlencode($validated['name']),
            'email_verified_at' => now(),
        ]);

        $role = Role::findOrFail($validated['role_id']);
        $user->roles()->sync([$role->id]);

        return response()->json([
            'success' => true,
            'message' => 'Pengguna berhasil didaftarkan.',
            'data' => new UserResource($user->load('roles')),
        ], Response::HTTP_CREATED);
    }

    /**
     * Display the specified user.
     */
    public function show(User $user): JsonResponse
    {
        $this->authorize('view', $user);

        return response()->json([
            'success' => true,
            'message' => 'Detail pengguna berhasil diambil.',
            'data' => new UserResource($user->load('roles')),
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $validated = $request->validated();

        $dataToUpdate = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'is_active' => $validated['is_active'],
        ];

        if (! empty($validated['password'])) {
            $dataToUpdate['password'] = Hash::make($validated['password']);
        }

        $user->update($dataToUpdate);

        $role = Role::findOrFail($validated['role_id']);
        $user->roles()->sync([$role->id]);

        return response()->json([
            'success' => true,
            'message' => 'Data pengguna berhasil diperbarui.',
            'data' => new UserResource($user->load('roles')),
        ]);
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(Request $request, User $user): JsonResponse
    {
        $this->authorize('delete', $user);

        if ($request->user()->id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak dapat menghapus akun Anda sendiri.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $user->roles()->detach();
        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pengguna berhasil dihapus.',
        ]);
    }

    /**
     * Export all users to CSV / JSON format for administrative audit.
     */
    public function export(Request $request)
    {
        $this->authorize('viewAny', User::class);

        $users = User::with('roles')->latest('id')->get();

        $format = $request->query('format', 'csv');

        if ($format === 'json') {
            return response()->json([
                'success' => true,
                'total' => $users->count(),
                'exported_at' => now()->toIso8601String(),
                'data' => UserResource::collection($users),
            ]);
        }

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="daftar_pengguna_maxy_lms_' . date('Ymd_His') . '.csv"',
        ];

        $callback = function () use ($users) {
            $file = fopen('php://output', 'w');
            // Add UTF-8 BOM
            fputs($file, "\xEF\xBB\xBF");
            fputcsv($file, ['ID', 'Nama Lengkap', 'Email', 'No Telepon', 'Peran Utama', 'Status Aktif', 'Terdaftar Pada']);

            foreach ($users as $user) {
                fputcsv($file, [
                    $user->id,
                    $user->name,
                    $user->email,
                    $user->phone ?? '-',
                    $user->roles->first()?->display_name ?? 'Siswa',
                    $user->is_active ? 'Aktif' : 'Nonaktif',
                    $user->created_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}

