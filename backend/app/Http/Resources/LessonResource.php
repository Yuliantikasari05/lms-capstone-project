<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LessonResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $completed = $this->resource->getAttribute('completed');

        return [
            'id' => $this->id,
            'course_module_id' => $this->course_module_id,
            'title' => $this->title,
            'type' => $this->type,
            'content' => $this->content,
            'video_url' => $this->video_url,
            'duration_minutes' => (int) $this->duration_minutes,
            'position' => (int) $this->position,
            'completed' => $this->when($completed !== null, (bool) $completed),
        ];
    }
}
