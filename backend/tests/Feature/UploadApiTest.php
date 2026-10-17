<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class UploadApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    public function test_user_can_upload_image(): void
    {
        $user = User::factory()->create();

        $file = UploadedFile::fake()->image('casa.jpg', 800, 600);

        $response = $this->actingAs($user)->postJson('/api/uploads', [
            'file' => $file,
            'category' => 'imagem',
        ]);

        $response->assertCreated()
            ->assertJsonStructure(['url', 'path', 'type', 'size']);

        $this->assertStringContainsString('uploads/imagem', $response->json('path'));
        Storage::disk('public')->assertExists($response->json('path'));
    }

    public function test_user_can_upload_video(): void
    {
        $user = User::factory()->create();

        $file = UploadedFile::fake()->create('tour.mp4', 5000, 'video/mp4');

        $response = $this->actingAs($user)->postJson('/api/uploads', [
            'file' => $file,
            'category' => 'video',
        ]);

        $response->assertCreated();
        Storage::disk('public')->assertExists($response->json('path'));
    }

    public function test_user_can_upload_pdf_document(): void
    {
        $user = User::factory()->create();

        $file = UploadedFile::fake()->create('escritura.pdf', 2000, 'application/pdf');

        $response = $this->actingAs($user)->postJson('/api/uploads', [
            'file' => $file,
            'category' => 'documento',
        ]);

        $response->assertCreated();
    }

    public function test_rejects_invalid_file_type(): void
    {
        $user = User::factory()->create();

        $file = UploadedFile::fake()->create('script.exe', 100, 'application/x-msdownload');

        $response = $this->actingAs($user)->postJson('/api/uploads', [
            'file' => $file,
            'category' => 'imagem',
        ]);

        $response->assertUnprocessable();
    }

    public function test_rejects_file_over_50mb(): void
    {
        $user = User::factory()->create();

        $file = UploadedFile::fake()->create('grande.mp4', 60000, 'video/mp4'); // 60 MB

        $response = $this->actingAs($user)->postJson('/api/uploads', [
            'file' => $file,
            'category' => 'video',
        ]);

        $response->assertUnprocessable();
    }

    public function test_guest_cannot_upload(): void
    {
        $file = UploadedFile::fake()->image('casa.jpg');

        $response = $this->postJson('/api/uploads', [
            'file' => $file,
            'category' => 'imagem',
        ]);

        $response->assertUnauthorized();
    }
}