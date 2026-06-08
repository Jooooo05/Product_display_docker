<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->text('description');
            $table->text('features');
            $table->text('specifications');
            $table->string('sku', 50)->nullable()->unique();
            $table->unsignedBigInteger('original_price');
            $table->unsignedBigInteger('dealer_price')->nullable();
            $table->string('image')->nullable();
            $table->enum('status', ['Active', 'Inactive', 'Draft'])->default('Active');
            $table->enum('stock_status', ['available', 'low_stock', 'out_of_stock'])->default('available');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('edited_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
