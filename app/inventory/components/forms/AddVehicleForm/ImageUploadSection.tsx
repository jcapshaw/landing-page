"use client"

import React, { useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { VehicleFormData } from "@/app/inventory/schemas/vehicle.schema"
import { X } from "lucide-react"

interface ImageUploadSectionProps {
  form: UseFormReturn<VehicleFormData>
  onUploadStateChange?: (isUploading: boolean) => void
}

export function ImageUploadSection({ form, onUploadStateChange }: ImageUploadSectionProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  const images = form.watch("images") || []

  // Function to compress image before upload
  const compressImage = async (file: File, maxWidth = 1200, quality = 0.8): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Canvas to Blob conversion failed'));
              }
            },
            file.type,
            quality
          );
        };
        img.onerror = () => {
          reject(new Error('Image loading error'));
        };
      };
      reader.onerror = () => {
        reject(new Error('File reading error'));
      };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    
    // Check file sizes - limit to 5MB per file
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = Array.from(e.target.files).filter(file => file.size > MAX_FILE_SIZE);
    
    if (oversizedFiles.length > 0) {
      alert(`Some images are too large (max 5MB per image). Please resize them and try again.`);
      e.target.value = "";
      return;
    }
    
    setUploading(true)
    onUploadStateChange?.(true)
    setUploadProgress(0)
    
    try {
      const newImageUrls = [...images]
      
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i]
        const fileExtension = file.name.split('.').pop()
        const fileName = `vehicles/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`
        
        try {
          // Compress the image before uploading
          const compressedImage = await compressImage(file);
          
          console.log(`Uploading compressed image to ${fileName}, original size: ${file.size}, compressed size: ${compressedImage.size}`);
          
          // Upload the compressed file to Supabase Storage
          const { data, error: uploadError } = await supabase.storage
            .from('vehicle-images')
            .upload(fileName, compressedImage, {
              cacheControl: '3600',
              upsert: false
            });
          
          if (uploadError) {
            throw uploadError;
          }
          
          console.log(`Successfully uploaded ${fileName} to Supabase Storage`);
        } catch (compressionError) {
          console.error("Image compression failed, uploading original:", compressionError);
          
          try {
            // Fall back to uploading the original file if compression fails
            console.log(`Uploading original image to ${fileName}, size: ${file.size}`);
            const { data, error: uploadError } = await supabase.storage
              .from('vehicle-images')
              .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
              });
            
            if (uploadError) {
              throw uploadError;
            }
            
            console.log(`Successfully uploaded original ${fileName} to Supabase Storage`);
          } catch (uploadError) {
            console.error("Error uploading original image:", uploadError);
            throw new Error(`Failed to upload image: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
          }
        }
        
        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('vehicle-images')
          .getPublicUrl(fileName);
        
        newImageUrls.push(publicUrl)
        
        // Update progress
        setUploadProgress(Math.round(((i + 1) / e.target.files.length) * 100))
      }
      
      // Update form with new image URLs
      form.setValue("images", newImageUrls)
    } catch (error) {
      console.error("Error uploading images:", error)
      
      // Provide more detailed error message
      let errorMessage = "Failed to upload images. ";
      
      if (error instanceof Error) {
        console.error("Error details:", error.message);
        errorMessage += error.message;
      } else {
        errorMessage += "Please check your network connection and try again.";
      }
      
      alert(errorMessage)
    } finally {
      setUploading(false)
      onUploadStateChange?.(false)
      setUploadProgress(0)
      // Clear the file input
      e.target.value = ""
    }
  }

  const removeImage = (indexToRemove: number) => {
    const updatedImages = images.filter((_, index) => index !== indexToRemove)
    form.setValue("images", updatedImages)
  }

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="images"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Vehicle Images</FormLabel>
            <div className="space-y-2">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploading}
              />
              
              {uploading && (
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
              
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {images.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Vehicle image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                        onError={(e) => {
                          console.error(`Failed to load image: ${url}`);
                          e.currentTarget.src = '/placeholder-image.png'; // Add a placeholder image
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        disabled={uploading}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FormItem>
        )}
      />
    </div>
  )
}