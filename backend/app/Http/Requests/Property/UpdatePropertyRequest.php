<?php

namespace App\Http\Requests\Property;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('property')) ?? false;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string', 'max:5000'],
            'type' => ['sometimes', 'in:venda,arrendamento'],
            'price' => ['sometimes', 'integer', 'min:1'],
            'province' => ['sometimes', 'string', 'max:100'],
            'municipality' => ['sometimes', 'string', 'max:100'],
            'neighborhood' => ['sometimes', 'string', 'max:100'],
            'bedrooms' => ['sometimes', 'integer', 'min:0', 'max:50'],
            'bathrooms' => ['sometimes', 'integer', 'min:0', 'max:50'],
            'area_m2' => ['nullable', 'integer', 'min:1'],
        ];
    }
}