'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export default function EditPost({ isOpen, onClose, post, onSave }) {
  const [content, setContent] = useState(post?.idea || '');
  const [imagePrompt, setImagePrompt] = useState(post?.imagePrompt || '');
  const [imageUrl, setImageUrl] = useState(post?.imageUrl || '');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/v1/images/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      setImageUrl(data.url); // Changed from data.imageUrl to data.url
      setImagePrompt(''); // Clear image prompt since we're using an uploaded image
    } catch (error) {
      console.error('Error uploading image:', error);
      setError(error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRegenerateImage = async () => {
    if (!imagePrompt.trim()) {
      setError('Please provide an image prompt');
      return;
    }

    try {
      setIsGeneratingImage(true);
      setError('');
      console.log('Post data in EditPost:', post); // Debug log

      const response = await fetch('/api/v1/images/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: imagePrompt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      const newImageUrl = data.imageUrl;
      setImageUrl(newImageUrl);
      
      // Save the changes with all required fields
      const saveData = {
        postId: post._id,
        content: content || post.idea,
        imagePrompt,
        imageUrl: newImageUrl,
        idea: content || post.idea,
      };
      
      console.log('Saving data in EditPost:', saveData);
      await onSave(saveData);
    } catch (error) {
      console.error('Error generating image:', error);
      setError(error.message || 'Failed to generate image');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSave = async () => {
    console.log('HandleSave called with post:', post);
    
    const dataToSave = {
      postId: post._id,
      content: content || post.idea,
      imagePrompt,
      imageUrl,
      idea: content || post.idea,
    };
    
    console.log('Data to save:', dataToSave);
    
    try {
      setIsSaving(true);
      setError('');
      await onSave(dataToSave);
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      setError(error.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Edit Post
            </h3>

            {error && (
              <div className="mb-4 p-2 text-sm text-red-600 bg-red-50 rounded">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="imagePrompt" className="block text-sm font-medium text-gray-700">
                    Image Prompt
                  </label>
                  <div className="flex space-x-2">
                    <textarea
                      id="imagePrompt"
                      className="flex-1 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      placeholder="Enter image prompt..."
                    />
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      onClick={handleRegenerateImage}
                      disabled={isGeneratingImage || !imagePrompt.trim()}
                    >
                      {isGeneratingImage ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating...
                        </>
                      ) : (
                        'Regenerate'
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Or</span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      'Upload Image'
                    )}
                  </button>
                </div>

                {(imageUrl || isGeneratingImage || isUploading) && (
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                    {imageUrl && imageUrl.includes('storage.googleapis.com') ? (
                      <img
                        src={imageUrl}
                        alt={imagePrompt || 'Post image'}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <Image
                        src={imageUrl}
                        alt={imagePrompt || 'Post image'}
                        className="object-cover"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  Post Content
                </label>
                <textarea
                  id="content"
                  className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter post content..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                onClick={onClose}
                disabled={isSaving || isGeneratingImage || isUploading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                onClick={handleSave}
                disabled={isSaving || isGeneratingImage || isUploading}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
