<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Throwable;

class HealthController extends Controller
{
    /**
     * System health check endpoint.
     */
    public function check(): JsonResponse
    {
        $dbStatus = 'healthy';
        $dbLatencyMs = 0;

        try {
            $startTime = microtime(true);
            DB::connection()->getPdo();
            $dbLatencyMs = round((microtime(true) - $startTime) * 1000, 2);
        } catch (Throwable $e) {
            $dbStatus = 'unhealthy: ' . $e->getMessage();
        }

        $allHealthy = $dbStatus === 'healthy' || str_starts_with($dbStatus, 'healthy');

        return response()->json([
            'success' => $allHealthy,
            'message' => $allHealthy ? 'LMS API Service is healthy' : 'LMS API Service has degraded components',
            'data' => [
                'service' => 'LMS Multi Segmen Berbasis Web - Maxy Academy',
                'version' => '1.0.0',
                'environment' => config('app.env'),
                'timestamp' => now()->toIso8601String(),
                'database' => [
                    'driver' => config('database.default'),
                    'status' => $dbStatus,
                    'latency_ms' => $dbLatencyMs,
                ],
            ],
        ], $allHealthy ? 200 : 503);
    }
}
