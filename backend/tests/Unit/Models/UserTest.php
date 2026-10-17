<?php

namespace Tests\Unit\Models;

use App\Models\User;
use Tests\TestCase;          
use Illuminate\Foundation\Testing\RefreshDatabase;

class UserTest extends TestCase
{
    public function test_user_has_public_id_on_creation(): void
    {
        $user = User::factory()->create();

        $this->assertNotNull($user->public_id);
        $this->assertSame(36, strlen($user->public_id));
    }

    public function test_user_is_admin(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->create();

        $this->assertTrue($admin->isAdmin());
        $this->assertFalse($user->isAdmin());
    }

    public function test_route_key_name_is_public_id(): void
    {
        $user = User::factory()->create();

        $this->assertSame('public_id', $user->getRouteKeyName());
    }
}
