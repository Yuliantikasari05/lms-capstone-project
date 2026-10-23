<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\UpdatePasswordRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Map role names to their corresponding dashboard routes.
     */
    private const DASHBOARD_ROUTES = [
        'admin' => '/admin/dashboard',
        'mentor' => '/mentor/dashboard',
        'siswa' => '/siswa/dashboard',
        'karyawan' => '/karyawan/dashboard',
        'lembaga_bimbingan' => '/lembaga/dashboard',
    ];

    /**
     * Authenticate user and issue session / token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->only('email', 'password');

        $user = User::with('roles')->where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Kredensial yang diberikan tidak cocok dengan data kami.'],
            ]);
        }

        if (! $user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda dinonaktifkan oleh administrator. Silakan hubungi admin.',
            ], 403);
        }

        // If request is from SPA with session support, log in through session guard
        if ($request->hasSession()) {
            Auth::login($user);
            $request->session()->regenerate();
        }

        // Generate Sanctum token for Bearer authentication fallback / cross-client API use
        $token = $user->createToken('auth-token')->plainTextToken;

        $primaryRole = $user->roles->first()?->name ?? 'siswa';
        $redirectUrl = self::DASHBOARD_ROUTES[$primaryRole] ?? '/siswa/dashboard';

        return response()->json([
            'success' => true,
            'message' => 'Berhasil masuk ke dalam sistem.',
            'data' => [
                'user' => new UserResource($user),
                'token' => $token,
                'token_type' => 'Bearer',
                'primary_role' => $primaryRole,
                'redirect_url' => $redirectUrl,
            ],
        ], 200);
    }

    /**
     * Get the authenticated user profile.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->loadMissing('roles.permissions');

        $primaryRole = $user->roles->first()?->name ?? 'siswa';
        $redirectUrl = self::DASHBOARD_ROUTES[$primaryRole] ?? '/siswa/dashboard';

        return response()->json([
            'success' => true,
            'message' => 'Profil pengguna berhasil dimuat.',
            'data' => [
                'user' => new UserResource($user),
                'primary_role' => $primaryRole,
                'redirect_url' => $redirectUrl,
            ],
        ], 200);
    }

    /**
     * Update current user profile.
     */
    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update($request->only('name', 'phone', 'avatar_url'));

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui.',
            'data' => new UserResource($user->loadMissing('roles')),
        ]);
    }

    /**
     * Update current user password.
     */
    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kata sandi berhasil diubah.',
        ]);
    }

    /**
     * Log out current user (revoke tokens & destroy session).
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user) {
            // Revoke current Sanctum token
            $user->currentAccessToken()?->delete();
        }

        // Invalidate session if active
        if ($request->hasSession()) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->json([
            'success' => true,
            'message' => 'Berhasil keluar dari sistem.',
        ], 200);
    }
}
