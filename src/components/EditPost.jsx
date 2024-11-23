'use client';

import { useState } from 'react';

export default function EditPost({ isOpen, onClose, post, onSave }) {
  const [content, setContent] = useState(post?.idea || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');
      await onSave(content);
      onClose();
    } catch (error) {
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
              {post?.imageUrl && (
                <div className="space-y-4">
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                    <img 
                      src={post.imageUrl} 
                      alt={post.imagePrompt || 'Post image'} 
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        console.error('Image failed to load:', post.imageUrl);
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="imagePrompt" className="block text-sm font-medium text-gray-700">
                      Image Prompt
                    </label>
                    <textarea
                      id="imagePrompt"
                      className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                      value={post.imagePrompt || ''}
                      readOnly
                      placeholder="No image prompt available"
                    />
                  </div>
                </div>
              )}

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
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                onClick={handleSave}
                disabled={isSaving}
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
