<?php

namespace App\Http\Requests\Property;

use Illuminate\Foundation\Http\FormRequest;

class StorePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isProprietario() || $this->user()?->isAdmin();
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:5000'],
            'type' => ['required', 'in:venda,arrendamento'],
            'price' => ['required', 'integer', 'min:1'],
            'province' => ['required', 'string', 'max:100'],
            'municipality' => ['required', 'string', 'max:100'],
            'neighborhood' => ['required', 'string', 'max:100'],
            'bedrooms' => ['required', 'integer', 'min:0', 'max:50'],
            'bathrooms' => ['required', 'integer', 'min:0', 'max:50'],
            'area_m2' => ['nullable', 'integer', 'min:1'],

            'media' => ['required', 'array', 'min:1', 'max:20'],
            'media.*.type' => ['required', 'in:foto,video'],
            'media.*.url' => ['required', 'url', 'max:500'],
            'media.*.order' => ['nullable', 'integer', 'min:0'],

            'documents' => ['required', 'array', 'min:1', 'max:10'],
            'documents.*.type' => ['required', 'in:escritura,bi,comprovativo'],
            'documents.*.url' => ['required', 'url', 'max:500'],
        ];
    }
}