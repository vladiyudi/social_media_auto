'use client';

import { useState } from 'react';

export default function EditPost({ isOpen, onClose, post, onSave }) {
  const [content, setContent] = useState(post?.idea || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      setError('');
      setIsSaving(true);
      await onSave(content);
      onClose();
    } catch (error) {
      console.error('Error saving post:', error);
      setError('Failed to update post content');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div 
          className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Edit Post</h2>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {/* Image */}
              {post?.imageUrl && (
                <div className="flex justify-center">
                  <img
                    src={post.imageUrl}
                    alt={post.imagePrompt || 'Post image'}
                    className="max-h-[50vh] object-contain"
                    onError={(e) => {
                      console.error('Image failed to load:', post.imageUrl);
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Text Area */}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter post content..."
                className="min-h-[150px] w-full p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Footer */}
            <div className="p-4 border-t flex justify-end space-x-2">
              <button
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
