<?php

namespace App\Http\Controllers\Api\V1\Concerns;

use App\Models\Course;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

trait ChecksCourseOwnership
{
    /**
     * Admin may touch every course; a mentor only the courses they teach.
     */
    protected function ensureCanTeach(Request $request, Course $course): void
    {
        $user = $request->user()->loadMissing('roles');

        if (! $user->hasRole('admin') && $course->instructor_id !== $user->id) {
            throw new AccessDeniedHttpException('Anda hanya dapat mengelola kursus milik Anda sendiri.');
        }
    }

    protected function isAdmin(Request $request): bool
    {
        return $request->user()->loadMissing('roles')->hasRole('admin');
    }
}
