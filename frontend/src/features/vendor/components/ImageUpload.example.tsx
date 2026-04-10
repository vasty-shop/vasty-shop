/**
 * ImageUpload Component - Usage Examples
 *
 * This file demonstrates various ways to use the ImageUpload component
 * in your product forms and image management interfaces.
 */

import React, { useState } from 'react';
import { ImageUpload, UploadedImage } from './ImageUpload';
import { api } from '@/lib/api';

// ============================================================================
// Example 1: Basic Usage
// ============================================================================

export const BasicImageUploadExample: React.FC = () => {
  const [images, setImages] = useState<UploadedImage[]>([]);

  return (
    <div className="p-6 glass-solid rounded-2xl">
      <h2 className="text-xl font-semibold text-white mb-6">Basic Image Upload</h2>

      <ImageUpload
        images={images}
        onChange={setImages}
      />

      {/* Display selected images */}
      {images.length > 0 && (
        <div className="mt-6">
          <h3 className="text-white font-medium mb-2">Selected Images:</h3>
          <pre className="text-xs text-white/60 bg-black/30 p-4 rounded-lg overflow-auto">
            {JSON.stringify(images, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Example 2: With Custom Upload Handler
// ============================================================================

export const CustomUploadExample: React.FC = () => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Custom upload handler that uploads to your backend
  const handleUpload = async (file: File): Promise<{ url: string; thumbnailUrl?: string }> => {
    setIsUploading(true);

    try {
      // Use the proper API client from lib/api
      const data = await api.uploadProductImage(file);

      return {
        url: data.url,
        thumbnailUrl: data.url // Use same URL for thumbnail (backend should handle this)
      };
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 glass-solid rounded-2xl">
      <h2 className="text-xl font-semibold text-white mb-6">Custom Upload Handler</h2>

      <ImageUpload
        images={images}
        onChange={setImages}
        onUpload={handleUpload}
        maxFiles={8}
        maxFileSize={10 * 1024 * 1024} // 10MB
      />

      {isUploading && (
        <div className="mt-4 text-center text-purple-400">
          Uploading to server...
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Example 3: In a Product Form
// ============================================================================

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  images: UploadedImage[];
}

export const ProductFormExample: React.FC = () => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    images: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that at least one image is uploaded
    if (formData.images.length === 0) {
      alert('Please upload at least one product image');
      return;
    }

    // Validate that there's a primary image
    const hasPrimaryImage = formData.images.some(img => img.isPrimary);
    if (!hasPrimaryImage && formData.images.length > 0) {
      // Set first image as primary
      formData.images[0].isPrimary = true;
    }

    // Submit form data
    console.log('Submitting product:', formData);

    // Use the proper API client from lib/api
    try {
      await api.createProduct({
        ...formData,
        images: formData.images.map(img => ({
          url: img.url,
          thumbnailUrl: img.thumbnailUrl,
          isPrimary: img.isPrimary,
          order: img.order
        }))
      });

      alert('Product created successfully!');
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: 0,
        images: []
      });
    } catch (error) {
      console.error('Failed to create product:', error);
      alert('Failed to create product');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Name */}
        <div className="glass-solid rounded-2xl p-6">
          <label className="block text-white font-medium mb-2">
            Product Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            placeholder="Enter product name"
            required
          />
        </div>

        {/* Product Description */}
        <div className="glass-solid rounded-2xl p-6">
          <label className="block text-white font-medium mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 min-h-[120px]"
            placeholder="Describe your product"
            required
          />
        </div>

        {/* Price */}
        <div className="glass-solid rounded-2xl p-6">
          <label className="block text-white font-medium mb-2">
            Price
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">$</span>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        {/* Product Images */}
        <div className="glass-solid rounded-2xl p-6">
          <label className="block text-white font-medium mb-4">
            Product Images
          </label>
          <ImageUpload
            images={formData.images}
            onChange={(images) => setFormData({ ...formData, images })}
            maxFiles={10}
            maxFileSize={5 * 1024 * 1024} // 5MB
            recommendedDimensions={{ width: 1200, height: 1200 }}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              if (confirm('Are you sure you want to cancel?')) {
                setFormData({
                  name: '',
                  description: '',
                  price: 0,
                  images: []
                });
              }
            }}
            className="px-6 py-3 glass hover:bg-white/10 rounded-xl text-white font-medium transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/30"
          >
            Create Product
          </button>
        </div>
      </form>
    </div>
  );
};

// ============================================================================
// Example 4: With Pre-loaded Images (Edit Mode)
// ============================================================================

export const EditProductExample: React.FC = () => {
  // Simulate loading existing product images
  const [images, setImages] = useState<UploadedImage[]>([
    {
      id: 'existing_1',
      url: 'https://example.com/product-image-1.jpg',
      thumbnailUrl: 'https://example.com/product-image-1-thumb.jpg',
      fileName: 'product-image-1.jpg',
      fileSize: 245678,
      isPrimary: true,
      order: 0
    },
    {
      id: 'existing_2',
      url: 'https://example.com/product-image-2.jpg',
      thumbnailUrl: 'https://example.com/product-image-2-thumb.jpg',
      fileName: 'product-image-2.jpg',
      fileSize: 198765,
      isPrimary: false,
      order: 1
    }
  ]);

  return (
    <div className="p-6 glass-solid rounded-2xl">
      <h2 className="text-xl font-semibold text-white mb-6">Edit Product Images</h2>

      <ImageUpload
        images={images}
        onChange={setImages}
        maxFiles={10}
      />

      <div className="mt-6">
        <button
          onClick={() => {
            console.log('Saving images:', images);
            alert('Images saved!');
          }}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/30"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// Example 5: With Custom Validation
// ============================================================================

export const CustomValidationExample: React.FC = () => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [validationError, setValidationError] = useState<string>('');

  const handleImageChange = (newImages: UploadedImage[]) => {
    // Custom validation: at least one image must be marked as primary
    if (newImages.length > 0 && !newImages.some(img => img.isPrimary)) {
      setValidationError('Please select a primary image');
    } else {
      setValidationError('');
    }

    setImages(newImages);
  };

  return (
    <div className="p-6 glass-solid rounded-2xl">
      <h2 className="text-xl font-semibold text-white mb-6">Custom Validation</h2>

      <ImageUpload
        images={images}
        onChange={handleImageChange}
        maxFiles={5}
        acceptedFormats={['.jpg', '.jpeg', '.png']} // Only JPG and PNG
        maxFileSize={3 * 1024 * 1024} // 3MB limit
      />

      {validationError && (
        <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
          <p className="text-red-400 text-sm">{validationError}</p>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Example 6: Disabled State
// ============================================================================

export const DisabledExample: React.FC = () => {
  const [images] = useState<UploadedImage[]>([
    {
      id: '1',
      url: 'https://example.com/locked-image.jpg',
      fileName: 'locked-image.jpg',
      fileSize: 150000,
      isPrimary: true,
      order: 0
    }
  ]);

  return (
    <div className="p-6 glass-solid rounded-2xl">
      <h2 className="text-xl font-semibold text-white mb-6">Disabled State (View Only)</h2>

      <ImageUpload
        images={images}
        disabled={true}
        maxFiles={10}
      />

      <div className="mt-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
        <p className="text-yellow-400 text-sm">
          Image uploads are disabled. This product is published and cannot be modified.
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// Example 7: All Examples Combined
// ============================================================================

export const AllExamples: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('basic');

  const examples = [
    { id: 'basic', label: 'Basic Usage', component: BasicImageUploadExample },
    { id: 'custom', label: 'Custom Upload', component: CustomUploadExample },
    { id: 'form', label: 'Product Form', component: ProductFormExample },
    { id: 'edit', label: 'Edit Mode', component: EditProductExample },
    { id: 'validation', label: 'Custom Validation', component: CustomValidationExample },
    { id: 'disabled', label: 'Disabled', component: DisabledExample }
  ];

  const ActiveComponent = examples.find(ex => ex.id === activeTab)?.component || BasicImageUploadExample;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gradient-purple mb-8">
          ImageUpload Component Examples
        </h1>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {examples.map(example => (
            <button
              key={example.id}
              onClick={() => setActiveTab(example.id)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all
                ${
                  activeTab === example.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'glass hover:bg-white/10 text-white/80'
                }
              `}
            >
              {example.label}
            </button>
          ))}
        </div>

        {/* Active Example */}
        <div>
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
};
