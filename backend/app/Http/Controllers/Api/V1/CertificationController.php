<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Certification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CertificationController extends Controller
{
    /**
     * Display a listing of certifications.
     * Admin sees all applications; regular users (karyawan) see only their own.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $isAdmin = $user->roles()->where('name', 'admin')->exists();

        $query = Certification::query()->latest();

        if (! $isAdmin) {
            $query->where('user_id', $user->id);
        }

        $items = $query->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar pengajuan sertifikasi berhasil dimuat.',
            'data' => $items,
        ]);
    }

    /**
     * Store a new certification application (submitted by karyawan).
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'track' => 'required|string|max:255',
            'training_hours' => 'required|integer|min:1',
            'portfolio_url' => 'required|url|max:500',
            'company' => 'nullable|string|max:255',
        ]);

        $user = $request->user();

        $certification = Certification::create([
            'user_id' => $user->id,
            'employee_name' => $user->name,
            'email' => $user->email,
            'company' => $request->input('company', 'Tech Corp Nusantara'),
            'track' => $request->input('track'),
            'training_hours' => $request->input('training_hours'),
            'portfolio_url' => $request->input('portfolio_url'),
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan sertifikasi berhasil dikirimkan ke Admin untuk verifikasi.',
            'data' => $certification,
        ], 201);
    }

    /**
     * Approve and issue certification (Admin only).
     */
    public function approve(Request $request, Certification $certification): JsonResponse
    {
        $user = $request->user();
        if (! $user->roles()->where('name', 'admin')->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya Administrator yang memiliki wewenang menerbitkan sertifikat.',
            ], 403);
        }

        $certNumber = $certification->certificate_number;
        if (! $certNumber) {
            $prefix = match (true) {
                str_contains(strtolower($certification->track), 'cloud') => 'CLD',
                str_contains(strtolower($certification->track), 'sec') => 'SEC',
                str_contains(strtolower($certification->track), 'data') => 'DAT',
                default => 'DEV',
            };
            $certNumber = "MX-CERT-2026-{$prefix}-" . rand(1000, 9999);
        }

        $certification->update([
            'status' => 'issued',
            'certificate_number' => $certNumber,
            'issued_at' => now(),
            'admin_notes' => $request->input('notes', 'Memenuhi seluruh standar kelayakan jam pelatihan dan portofolio teknis.'),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Sertifikat resmi berhasil diterbitkan dengan nomor {$certNumber}.",
            'data' => $certification,
        ]);
    }

    /**
     * Reject certification application (Admin only).
     */
    public function reject(Request $request, Certification $certification): JsonResponse
    {
        $user = $request->user();
        if (! $user->roles()->where('name', 'admin')->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya Administrator yang memiliki wewenang menolak pengajuan.',
            ], 403);
        }

        $certification->update([
            'status' => 'rejected',
            'admin_notes' => $request->input('notes', 'Jam pelatihan terverifikasi belum memenuhi standar minimum atau portofolio tidak lengkap.'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan sertifikasi ditolak.',
            'data' => $certification,
        ]);
    }
}
