<?php

namespace App\Http\Requests\Admin;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'role' => ['sometimes', 'in:proprietario,interessado,admin'],
            'verification_status' => ['sometimes', 'in:pendente,verificado,rejeitado'],
        ];
    }
}