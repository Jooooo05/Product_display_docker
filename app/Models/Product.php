<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;
 
    protected $fillable = [
        'name',
        'description',
        'features',
        'specifications',
        'sku',
        'original_price',
        'dealer_price',
        'image',
        'status',
        'stock_status',
        'created_by',
        'edited_by',
    ];

    protected $casts = [
        'original_price' => 'integer',
        'dealer_price'   => 'integer',
    ];

    // ─────────────────────────────────────────────
    // RELATIONSHIPS
    // ─────────────────────────────────────────────

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }


    /**
     * Discount percentage compared to original price.
     * Returns null if dealer price is not set or not lower.
     */
    public function getDiscountPercentAttribute(): ?int
    {
        if (
            $this->dealer_price &&
            $this->original_price > $this->dealer_price
        ) {
            return (int) round(
                (($this->original_price - $this->dealer_price) / $this->original_price) * 100
            );
        }

        return null;
    }

    /**
     * Full image URL (returns null if no image stored).
     */
    public function getImageUrlAttribute(): ?string
    {
        return $this->image ? asset('storage/' . $this->image) : null;
    }

    // ─────────────────────────────────────────────
    // SCOPES
    // ─────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('status', 'Active');
    }

    public function scopeAvailable($query)
    {
        return $query->where('stock_status', 'available');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function editedBy()
    {
        return $this->belongsTo(User::class, 'edited_by');
    }
}
