'use client';

import { useState, useEffect } from 'react';
import EditPost from './EditPost';

export default function CampaignPost({ day, platform, postData, styles, onUpdate }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPostData, setCurrentPostData] = useState(postData);

  useEffect(() => {
    setCurrentPostData(postData);
  }, [postData]);

  const handleSavePost = async ({ postId, content, idea, imagePrompt, imageUrl }) => {
    console.log('HandleSavePost received:', {
      postId,
      content,
      idea,
      imagePrompt,
      imageUrl,
      currentPostData
    });

    if (!postId || !content) {
      console.error('Missing required fields:', { postId, content });
      throw new Error('Post ID and content are required');
    }

    try {
      const requestData = {
        postId: postId.toString(),
        content,
        idea,
        imagePrompt,
        imageUrl,
      };

      console.log('Sending update request:', requestData);
      
      const response = await fetch('/api/v1/posts/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const responseData = await response.json();
      console.log('Server response:', responseData);

      if (!response.ok) {
        const errorMessage = responseData.error || 'Failed to update post';
        if (responseData.details) {
          console.error('Error details:', responseData.details);
        }
        throw new Error(errorMessage);
      }

      const updatedPost = {
        ...currentPostData,
        idea: idea || content,
        content,
        imagePrompt,
        imageUrl,
        updatedAt: new Date().toISOString()
      };
      
      console.log('Updating post with:', updatedPost);
      setCurrentPostData(updatedPost);
      onUpdate?.(updatedPost);
      
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
          <div className="space-y-2 h-full flex flex-col">
            {currentPostData.imageUrl && (
              <div 
                className="relative aspect-square w-full overflow-hidden rounded-lg flex-shrink-0 group"
              >
                <img 
                  src={currentPostData.imageUrl} 
                  alt={currentPostData.imagePrompt || 'Generated image'} 
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    console.error('Image failed to load:', currentPostData.imageUrl);
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            <div className={`relative flex-grow min-h-0 ${isExpanded ? 'overflow-y-auto' : ''}`}>
              <p className={`text-sm text-gray-900 ${!isExpanded && 'line-clamp-3'}`}>
                {currentPostData.idea}
              </p>
              {currentPostData.idea?.length > 150 && !isExpanded && (
                <div 
                  className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(true);
                  }}
                />
              )}
            </div>

            <div className="flex items-center justify-between mt-auto pt-2">
              <div className="flex items-center space-x-2">
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
