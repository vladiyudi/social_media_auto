'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export default function EditPost({ isOpen, onClose, post, onSave }) {
  const [content, setContent] = useState(post?.idea || '');
  const [imagePrompt, setImagePrompt] = useState(post?.imagePrompt || '');
  const [displayPrompt, setDisplayPrompt] = useState(post?.imagePrompt || '');
  const [imageUrl, setImageUrl] = useState(post?.imageUrl || '');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [imageAspectRatio, setImageAspectRatio] = useState(1);
  const [isUploadedImage, setIsUploadedImage] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (imageUrl) {
      const imgElement = document.createElement('img');
      imgElement.onload = () => {
        setImageAspectRatio(imgElement.width / imgElement.height);
      };
      imgElement.src = imageUrl;
    }
  }, [imageUrl]);

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

      setImageUrl(data.url);
      setIsUploadedImage(true);
      setDisplayPrompt('Uploaded Image');
      setImagePrompt('');
    } catch (error) {
      console.error('Error uploading image:', error);
      setError(error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePromptChange = (e) => {
    const value = e.target.value;
    setDisplayPrompt(value);
    setImagePrompt(value);
    if (value !== 'Uploaded Image') {
      setIsUploadedImage(false);
    }
  };

  const handlePromptFocus = () => {
    if (isUploadedImage && displayPrompt === 'Uploaded Image') {
      setDisplayPrompt('');
    }
  };

  const handlePromptBlur = () => {
    if (isUploadedImage && !displayPrompt.trim()) {
      setDisplayPrompt('Uploaded Image');
    }
  };

  const handleRegenerateImage = async () => {
    if (!imagePrompt.trim() || imagePrompt === 'Uploaded Image') {
      setError('Please provide an image prompt');
      return;
    }

    try {
      setIsGeneratingImage(true);
      setError('');

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
      setIsUploadedImage(false);
      setDisplayPrompt(imagePrompt);
    } catch (error) {
      console.error('Error generating image:', error);
      setError(error.message || 'Failed to generate image');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');
      
      const dataToSave = {
        postId: post._id.toString(), 
        content: content || post.idea,
        imagePrompt: imagePrompt || post.imagePrompt,
        imageUrl: imageUrl || post.imageUrl,
        idea: content || post.idea,
      };

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
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-xl w-[800px] max-w-[90vw] max-h-[90vh] flex flex-col relative z-10">
        <div className="p-4 flex justify-between items-center border-b">
          <h3 className="text-lg font-medium text-gray-900">
            Edit Post
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          {error && (
            <div className="mb-4 p-2 text-sm text-red-600 bg-red-50 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="imagePrompt" className="block text-sm font-medium text-gray-700">
                {isUploadedImage ? 'Image Prompt (optional - enter to generate new image)' : 'Image Prompt'}
              </label>
              <div className="flex space-x-2 items-stretch h-[66px]">
                <button
                  type="button"
                  className="aspect-square h-full inline-flex items-center justify-center border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  title="Upload image"
                >
                  {isUploading ? (
                    <span className="material-icons animate-spin">refresh</span>
                  ) : (
                    <span className="material-icons">upload</span>
                  )}
                </button>
                <textarea
                  id="imagePrompt"
                  className="flex-1 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  value={displayPrompt}
                  onChange={handlePromptChange}
                  onFocus={handlePromptFocus}
                  onBlur={handlePromptBlur}
                  disabled={isGeneratingImage}
                  placeholder="Enter image prompt..."
                />
                <button
                  type="button"
                  className="aspect-square h-full inline-flex items-center justify-center border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  onClick={handleRegenerateImage}
                  disabled={isGeneratingImage || !imagePrompt.trim() || imagePrompt === 'Uploaded Image'}
                  title={isUploadedImage ? "Generate new image from prompt" : "Regenerate image"}
                >
                  {isGeneratingImage ? (
                    <span className="material-icons animate-spin">refresh</span>
                  ) : (
                    <span className="material-icons">auto_fix_high</span>
                  )}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </div>
            </div>

            {imageUrl && (
              <div className="relative w-full" style={{ paddingBottom: `${100 / imageAspectRatio}%` }}>
                <Image
                  src={imageUrl}
                  alt="Post image"
                  fill
                  className="rounded-lg object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Content
              </label>
              <textarea
                id="content"
                className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter post content..."
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t flex justify-end space-x-2">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <span className="material-icons animate-spin mr-2">refresh</span>
                Saving...
              </>
            ) : (
              <>
                <span className="material-icons mr-2">save</span>
                Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
