<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * Accepts one permission or several separated by "|" (user needs any one of them).
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated. Silakan masuk terlebih dahulu.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        if (! $user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda dinonaktifkan. Hubungi Administrator.',
            ], Response::HTTP_FORBIDDEN);
        }

        $allowed = collect(explode('|', $permission))
            ->contains(fn (string $name) => $user->hasPermission($name));

        if (! $allowed) {
            return response()->json([
                'success' => false,
                'message' => "Akses ditolak. Anda tidak memiliki izin '{$permission}'.",
                'required_permission' => $permission,
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
