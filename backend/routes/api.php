<?php

use App\Http\Controllers\Api\V1\Admin\RoleController;
use App\Http\Controllers\Api\V1\Admin\UserController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\Assessment\AssignmentController;
use App\Http\Controllers\Api\V1\Assessment\ExamController;
use App\Http\Controllers\Api\V1\Assessment\ExamReviewController;
use App\Http\Controllers\Api\V1\Assessment\StudentAssessmentController;
use App\Http\Controllers\Api\V1\Course\CourseController;
use App\Http\Controllers\Api\V1\Course\LearnController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\HealthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Version 1 (/api/v1)
|--------------------------------------------------------------------------
|
| All endpoints adhere to REST conventions, return JSON, and enforce
| least privilege RBAC via Laravel Sanctum authentication.
|
*/

Route::prefix('v1')->group(function () {

    // 1. System Health Check
    Route::get('/health', [HealthController::class, 'check'])->name('api.v1.health');

    // 2. Public Authentication Endpoints
    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login'])->name('api.v1.auth.login');
    });

    // 3. Authenticated Routes (Sanctum Session / Token)
    Route::middleware('auth:sanctum')->group(function () {

        // User Identity & Profile
        Route::prefix('auth')->group(function () {
            Route::get('/me', [AuthController::class, 'me'])->name('api.v1.auth.me');
            Route::put('/profile', [AuthController::class, 'updateProfile'])->name('api.v1.auth.profile');
            Route::put('/password', [AuthController::class, 'updatePassword'])->name('api.v1.auth.password');
            Route::post('/logout', [AuthController::class, 'logout'])->name('api.v1.auth.logout');
        });

        // Role-tailored Dashboard Metrics
        Route::get('/dashboard/stats', [DashboardController::class, 'stats'])->name('api.v1.dashboard.stats');

        // Common Feature for All Roles: System Notifications
        Route::get('/notifications', [\App\Http\Controllers\Api\V1\NotificationController::class, 'index'])->name('api.v1.notifications.index');

        // Curriculum management — Admin (all courses) & Mentor (own courses)
        Route::middleware('permission:courses:manage')->prefix('manage')->group(function () {
            Route::get('/options', [CourseController::class, 'options'])->name('api.v1.manage.options');
            Route::apiResource('courses', CourseController::class)->names([
                'index' => 'api.v1.manage.courses.index',
                'store' => 'api.v1.manage.courses.store',
                'show' => 'api.v1.manage.courses.show',
                'update' => 'api.v1.manage.courses.update',
                'destroy' => 'api.v1.manage.courses.destroy',
            ]);
            Route::post('/courses/{course}/modules', [CourseController::class, 'storeModule'])->name('api.v1.manage.modules.store');
            Route::put('/modules/{module}', [CourseController::class, 'updateModule'])->name('api.v1.manage.modules.update');
            Route::delete('/modules/{module}', [CourseController::class, 'destroyModule'])->name('api.v1.manage.modules.destroy');
            Route::post('/modules/{module}/lessons', [CourseController::class, 'storeLesson'])->name('api.v1.manage.lessons.store');
            Route::put('/lessons/{lesson}', [CourseController::class, 'updateLesson'])->name('api.v1.manage.lessons.update');
            Route::delete('/lessons/{lesson}', [CourseController::class, 'destroyLesson'])->name('api.v1.manage.lessons.destroy');
            Route::get('/courses/{course}/enrollments', [CourseController::class, 'enrollments'])->name('api.v1.manage.enrollments.index');
            Route::post('/courses/{course}/enrollments', [CourseController::class, 'enroll'])->name('api.v1.manage.enrollments.store');
            Route::delete('/courses/{course}/enrollments/{user}', [CourseController::class, 'unenroll'])->name('api.v1.manage.enrollments.destroy');
        });

        // Assignments, exams & grading — Mentor (own courses) & Admin
        Route::middleware('permission:assignments:create')->prefix('teach')->group(function () {
            Route::get('/courses/{course}/assignments', [AssignmentController::class, 'index'])->name('api.v1.teach.assignments.index');
            Route::post('/courses/{course}/assignments', [AssignmentController::class, 'store'])->name('api.v1.teach.assignments.store');
            Route::put('/assignments/{assignment}', [AssignmentController::class, 'update'])->name('api.v1.teach.assignments.update');
            Route::delete('/assignments/{assignment}', [AssignmentController::class, 'destroy'])->name('api.v1.teach.assignments.destroy');
            Route::get('/assignments/{assignment}/submissions', [AssignmentController::class, 'submissions'])->name('api.v1.teach.submissions.index');
            Route::get('/submissions', [AssignmentController::class, 'queue'])->name('api.v1.teach.submissions.queue');
            Route::put('/submissions/{submission}/grade', [AssignmentController::class, 'grade'])
                ->middleware('permission:assignments:review')->name('api.v1.teach.submissions.grade');
        });

        Route::middleware('permission:exams:create')->prefix('teach')->group(function () {
            Route::get('/courses/{course}/exams', [ExamController::class, 'index'])->name('api.v1.teach.exams.index');
            Route::post('/courses/{course}/exams', [ExamController::class, 'store'])->name('api.v1.teach.exams.store');
            Route::get('/exams/{exam}', [ExamController::class, 'show'])->name('api.v1.teach.exams.show');
            Route::put('/exams/{exam}', [ExamController::class, 'update'])->name('api.v1.teach.exams.update');
            Route::delete('/exams/{exam}', [ExamController::class, 'destroy'])->name('api.v1.teach.exams.destroy');
            Route::post('/exams/{exam}/submit-review', [ExamController::class, 'submitReview'])
                ->middleware('permission:exams:submit_review')->name('api.v1.teach.exams.submit_review');
            Route::get('/exams/{exam}/attempts', [ExamController::class, 'attempts'])->name('api.v1.teach.exams.attempts');
        });

        // Admin quality review of mentor-proposed exams
        Route::middleware('permission:exams:review')->prefix('exam-reviews')->group(function () {
            Route::get('/', [ExamReviewController::class, 'index'])->name('api.v1.exam_reviews.index');
            Route::get('/{exam}', [ExamReviewController::class, 'show'])->name('api.v1.exam_reviews.show');
            Route::post('/{exam}/approve', [ExamReviewController::class, 'approve'])->name('api.v1.exam_reviews.approve');
            Route::post('/{exam}/reject', [ExamReviewController::class, 'reject'])->name('api.v1.exam_reviews.reject');
        });

        // Certifications — Employee submits, Admin reviews and issues certificate
        Route::prefix('certifications')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\V1\CertificationController::class, 'index'])->name('api.v1.certifications.index');
            Route::post('/', [\App\Http\Controllers\Api\V1\CertificationController::class, 'store'])->name('api.v1.certifications.store');
            Route::post('/{certification}/approve', [\App\Http\Controllers\Api\V1\CertificationController::class, 'approve'])->name('api.v1.certifications.approve');
            Route::post('/{certification}/reject', [\App\Http\Controllers\Api\V1\CertificationController::class, 'reject'])->name('api.v1.certifications.reject');
        });

        // Schedules — Live Mentoring & Webinars (Mentor creates, Students/all roles view)
        Route::prefix('schedules')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\V1\ScheduleController::class, 'index'])->name('api.v1.schedules.index');
            Route::post('/', [\App\Http\Controllers\Api\V1\ScheduleController::class, 'store'])->name('api.v1.schedules.store');
            Route::patch('/{schedule}/toggle-finished', [\App\Http\Controllers\Api\V1\ScheduleController::class, 'toggleFinished'])->name('api.v1.schedules.toggle_finished');
            Route::delete('/{schedule}', [\App\Http\Controllers\Api\V1\ScheduleController::class, 'destroy'])->name('api.v1.schedules.destroy');
        });

        // Student learning — enrolled courses, catalog, lesson progress
        Route::middleware('permission:courses:enrolled')->prefix('learn')->group(function () {
            Route::get('/courses', [LearnController::class, 'index'])->name('api.v1.learn.courses.index');
            Route::get('/catalog', [LearnController::class, 'catalog'])->name('api.v1.learn.catalog');
            Route::post('/courses/{course}/enroll', [LearnController::class, 'enroll'])->name('api.v1.learn.courses.enroll');
            Route::get('/courses/{course}', [LearnController::class, 'show'])->name('api.v1.learn.courses.show');
            Route::post('/lessons/{lesson}/complete', [LearnController::class, 'complete'])->name('api.v1.learn.lessons.complete');
            Route::delete('/lessons/{lesson}/complete', [LearnController::class, 'uncomplete'])->name('api.v1.learn.lessons.uncomplete');
            Route::get('/assignments', [StudentAssessmentController::class, 'assignments'])
                ->middleware('permission:assignments:submit')->name('api.v1.learn.assignments.index');
            Route::post('/assignments/{assignment}/submit', [StudentAssessmentController::class, 'submitAssignment'])
                ->middleware('permission:assignments:submit')->name('api.v1.learn.assignments.submit');
            Route::get('/exams', [StudentAssessmentController::class, 'exams'])
                ->middleware('permission:exams:take')->name('api.v1.learn.exams.index');
            Route::post('/exams/{exam}/start', [StudentAssessmentController::class, 'startExam'])
                ->middleware('permission:exams:take')->name('api.v1.learn.exams.start');
            Route::post('/exams/{exam}/attempts/{attempt}/submit', [StudentAssessmentController::class, 'submitExam'])
                ->middleware('permission:exams:take')->name('api.v1.learn.exams.submit');
        });

        // Admin Only Routes (Role-Based Access Control)
        Route::middleware('role:admin')->prefix('admin')->group(function () {
            Route::get('/roles', [RoleController::class, 'index'])->name('api.v1.admin.roles.index');
            Route::get('/users/export', [UserController::class, 'export'])->name('api.v1.admin.users.export');
            Route::apiResource('users', UserController::class)->names([
                'index' => 'api.v1.admin.users.index',
                'store' => 'api.v1.admin.users.store',
                'show' => 'api.v1.admin.users.show',
                'update' => 'api.v1.admin.users.update',
                'destroy' => 'api.v1.admin.users.destroy',
            ]);
        });
    });
});
