'use client';

import { useState } from 'react';

export default function CampaignPost({ day, platform, postData, styles }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative h-full group cursor-pointer hover:bg-gray-50">
      {/* Date circle - positioned relative to the parent cell */}
      <div className={`absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${styles.active} z-10`}>
        {day}
      </div>

      {/* Content container - padded to accommodate the date circle */}
      <div className="p-4 pt-12 h-full flex flex-col">
        {!postData ? (
          <div className="text-sm text-gray-500">No post scheduled</div>
        ) : (
          <div className="space-y-2 h-full flex flex-col">
            {postData.imageUrl && (
              <div className="relative aspect-square w-full overflow-hidden rounded-lg flex-shrink-0">
                <img 
                  src={postData.imageUrl} 
                  alt={postData.imagePrompt || 'Post image'}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    console.error('Image failed to load:', postData.imageUrl);
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
                {postData.content || postData.idea || 'No content available'}
              </p>
              
              {!isExpanded && postData.content?.length > 150 && (
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
            
            {postData.imagePrompt && !postData.imageUrl && (
              <p className="text-xs text-gray-500 italic flex-shrink-0">
                Image prompt: {postData.imagePrompt}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
