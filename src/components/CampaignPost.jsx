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

  const handleSavePost = async (newContent) => {
    try {
      console.log('Updating post:', { 
        postId: currentPostData._id, 
        content: newContent,
        currentIdea: currentPostData.idea 
      });
      
      const response = await fetch('/api/v1/posts/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: currentPostData._id.toString(),
          content: newContent,
        }),
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
        idea: responseData.idea,
        updatedAt: responseData.updatedAt
      };
      
      setCurrentPostData(updatedPost);
      onUpdate?.(updatedPost);
      
      return responseData;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  };

  return (
    <div className="relative h-full group cursor-pointer hover:bg-gray-50">
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
                className="relative aspect-square w-full overflow-hidden rounded-lg flex-shrink-0 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditModalOpen(true);
                }}
              >
                <img 
                  src={currentPostData.imageUrl} 
                  alt={currentPostData.imagePrompt || 'Post image'}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    console.error('Image failed to load:', currentPostData.imageUrl);
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            <div className={`relative flex-grow min-h-0 ${isExpanded ? 'overflow-y-auto' : ''}`}>
              <p 
                className={`text-sm ${isExpanded ? '' : 'line-clamp-3'} ${styles.text}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
              >
                {currentPostData.idea || 'No content available'}
              </p>
              
              {!isExpanded && currentPostData.idea?.length > 150 && (
                <div 
                  className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(true);
                  }}
                />
              )}
            </div>

            {isExpanded && (
              <button
                className="text-xs text-blue-500 hover:text-blue-600 mt-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
              >
                Show less
              </button>
            )}
            
            {currentPostData.imagePrompt && !currentPostData.imageUrl && (
              <p className="text-xs text-gray-500 italic flex-shrink-0">
                Image prompt: {currentPostData.imagePrompt}
              </p>
            )}
          </div>
        )}
      </div>

      <EditPost
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        post={currentPostData}
        onSave={handleSavePost}
      />
    </div>
  );
}
