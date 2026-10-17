<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@imobiliaria.ao'],
            [
                'name' => 'Administrador',
                'phone' => '900000000',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'verification_status' => 'verificado',
            ]
        );
    }
}