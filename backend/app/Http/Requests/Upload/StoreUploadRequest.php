<?php

namespace App\Http\Requests\Upload;

use Illuminate\Foundation\Http\FormRequest;

class StoreUploadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'max:51200', // 50 MB (em kilobytes)
                'mimes:jpg,jpeg,png,webp,mp4,mov,pdf',
            ],
            'category' => ['required', 'in:imagem,video,documento'],
        ];
    }

    public function messages(): array
    {
        return [
            'file.max' => 'O ficheiro não pode exceder 50 MB.',
            'file.mimes' => 'Formato não suportado. Usa JPG, PNG, WEBP, MP4, MOV ou PDF.',
        ];
    }
}