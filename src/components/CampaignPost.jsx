'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import EditPost from './EditPost';

export default function CampaignPost({ day, platform, postData, styles, onUpdate }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPostData, setCurrentPostData] = useState(postData);
  const [imageAspectRatio, setImageAspectRatio] = useState(1);

  useEffect(() => {
    setCurrentPostData(postData);
  }, [postData]);

  useEffect(() => {
    if (currentPostData?.imageUrl) {
      const imgElement = document.createElement('img');
      imgElement.onload = () => {
        setImageAspectRatio(imgElement.width / imgElement.height);
      };
      imgElement.src = currentPostData.imageUrl;
    }
  }, [currentPostData?.imageUrl]);

  const handleSavePost = async ({ postId, content, idea, imagePrompt, imageUrl }) => {
    if (!postId || !content) {
      console.error('Missing required fields:', { postId, content });
      throw new Error('Post ID and content are required');
    }

    try {
      const requestData = {
        postId: postId.toString(),
        content,
        idea: idea || content,
        imagePrompt,
        imageUrl,
      };

      const response = await fetch('/api/v1/posts/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update post');
      }

      const updatedPost = {
        ...currentPostData,
        idea: idea || content,
        imagePrompt,
        imageUrl,
        updatedAt: new Date().toISOString()
      };

      setCurrentPostData(updatedPost);
      setIsEditModalOpen(false);

      // Notify parent component if onUpdate is provided
      if (typeof onUpdate === 'function') {
        onUpdate(updatedPost);
      }

      return responseData;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  };

  return (
    <div 
      className="relative h-full group cursor-pointer hover:bg-gray-50"
      onClick={() => setIsEditModalOpen(true)}
    >
      <div className={`absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${styles.active} z-10`}>
        {day}
      </div>

      <div className="p-4 pt-12 h-full flex flex-col">
        {!currentPostData ? (
          <div className="text-sm text-gray-500">No post scheduled</div>
        ) : (
          <div className="h-full flex flex-col">
            {/* Image section - fixed height based on container width */}
            <div className="flex-[2] min-h-0 mb-4">
              {currentPostData.imageUrl && (
                <div className="relative w-full" style={{ paddingBottom: `${100 / imageAspectRatio}%` }}>
                  <Image 
                    src={currentPostData.imageUrl} 
                    alt={currentPostData.imagePrompt || 'Generated image'} 
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onError={(e) => {
                      console.error('Image failed to load:', currentPostData.imageUrl);
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Text section */}
            <div className="flex flex-col flex-1">
              <div className="flex-1 overflow-y-auto max-h-32 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <p className="text-sm text-gray-900">
                  {currentPostData.idea}
                </p>
              </div>

              <div className="flex items-center justify-between mt-2 pt-2 border-t">
                <span className="text-xs text-gray-500">
                  {platform}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {isEditModalOpen && (
        <EditPost
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          post={currentPostData}
          onSave={handleSavePost}
        />
      )}
    </div>
  );
}
