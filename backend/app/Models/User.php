<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'avatar_url',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Roles associated with this user.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_user')->withTimestamps();
    }

    /**
     * Determine if the user has a specific role.
     */
    public function hasRole(string $roleName): bool
    {
        return $this->roles->contains('name', $roleName);
    }

    /**
     * Determine if the user has any of the given roles.
     *
     * @param  array<int, string>  $roleNames
     */
    public function hasAnyRole(array $roleNames): bool
    {
        return $this->roles->contains(function (Role $role) use ($roleNames) {
            return in_array($role->name, $roleNames, true);
        });
    }

    /**
     * Determine if the user has a specific permission via their roles.
     */
    public function hasPermission(string $permissionName): bool
    {
        // Admin role automatically has all permissions
        if ($this->hasRole('admin')) {
            return true;
        }

        return $this->roles->flatMap(function (Role $role) {
            return $role->permissions;
        })->contains('name', $permissionName);
    }

    /**
     * Retrieve all unique permission names the user has.
     *
     * @return array<int, string>
     */
    public function getAllPermissions(): array
    {
        if ($this->hasRole('admin')) {
            return Permission::pluck('name')->toArray();
        }

        return $this->roles->loadMissing('permissions')
            ->flatMap(fn (Role $role) => $role->permissions->pluck('name'))
            ->unique()
            ->values()
            ->toArray();
    }

    /**
     * Assign a role to the user.
     */
    public function assignRole(Role|string $role): void
    {
        $roleModel = is_string($role) ? Role::where('name', $role)->firstOrFail() : $role;
        $this->roles()->syncWithoutDetaching([$roleModel->id]);
    }

    /**
     * Sync user roles.
     *
     * @param  array<int, int|string|Role>  $roles
     */
    public function syncRoles(array $roles): void
    {
        $roleIds = [];
        foreach ($roles as $role) {
            if ($role instanceof Role) {
                $roleIds[] = $role->id;
            } elseif (is_numeric($role)) {
                $roleIds[] = (int) $role;
            } elseif (is_string($role)) {
                $found = Role::where('name', $role)->first();
                if ($found) {
                    $roleIds[] = $found->id;
                }
            }
        }
        $this->roles()->sync($roleIds);
    }
}
