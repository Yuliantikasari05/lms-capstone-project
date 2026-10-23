<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $progress = $this->resource->getAttribute('progress_data');
        $enrollmentStatus = $this->resource->getAttribute('enrollment_status');
        $enrolled = $this->resource->getAttribute('is_enrolled');

        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'category' => $this->category,
            'level' => $this->level,
            'audience' => $this->audience,
            'thumbnail_url' => $this->thumbnail_url,
            'status' => $this->status,
            'instructor_id' => $this->instructor_id,
            'instructor' => $this->whenLoaded('instructor', fn () => $this->instructor ? [
                'id' => $this->instructor->id,
                'name' => $this->instructor->name,
            ] : null),
            'modules_count' => $this->whenCounted('modules'),
            'lessons_count' => $this->whenCounted('lessons'),
            'students_count' => $this->whenCounted('enrollments'),
            'modules' => CourseModuleResource::collection($this->whenLoaded('modules')),
            'is_enrolled' => $this->when($enrolled !== null, (bool) $enrolled),
            'enrollment_status' => $this->when($enrollmentStatus !== null, $enrollmentStatus),
            'progress' => $this->when($progress !== null, $progress),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
