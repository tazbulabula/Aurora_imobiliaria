<?php

namespace Tests\Unit\Models;

use App\Models\Interest;
use App\Models\Property;
use App\Models\Transaction;
use App\Models\User;
use Tests\TestCase;          
use Illuminate\Foundation\Testing\RefreshDatabase;

class InterestTest extends TestCase
{
    public function test_interest_belongs_to_property_and_interested(): void
    {
        $interest = Interest::factory()->create();

        $this->assertInstanceOf(Property::class, $interest->property);
        $this->assertInstanceOf(User::class, $interest->interested);
    }

    public function test_interest_has_one_transaction(): void
    {
        $interest = Interest::factory()->create();
        Transaction::factory()->create(['interest_id' => $interest->id]);

        $this->assertInstanceOf(Transaction::class, $interest->transaction);
    }

    public function test_unique_property_interested_constraint(): void
    {
        $interest = Interest::factory()->create();

        $this->expectException(\Illuminate\Database\QueryException::class);

        Interest::factory()->create([
            'property_id' => $interest->property_id,
            'interested_id' => $interest->interested_id,
        ]);
    }

    public function test_interest_has_public_id(): void
    {
        $interest = Interest::factory()->create();

        $this->assertNotNull($interest->public_id);
    }
}
