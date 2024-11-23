'use client';

export default function CampaignPost({ day, platform, postData, styles }) {
  console.log('CampaignPost data:', { day, platform, postData, styles });

  if (!postData) {
    return (
      <div className="relative h-full p-2 group cursor-pointer hover:bg-gray-50">
        <div className={`absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${styles.active}`}>
          {day}
        </div>
        <div className="text-sm text-gray-500">No post scheduled</div>
      </div>
    );
  }

  return (
    <div className="relative h-full p-2 group cursor-pointer hover:bg-gray-50">
      <div className={`absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${styles.active}`}>
        {day}
      </div>
      <div className="space-y-2">
        {postData.imageUrl && (
          <div className="relative aspect-square w-full overflow-hidden rounded-lg">
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
        <p className={`text-sm line-clamp-2 ${styles.text}`}>
          {postData.content || postData.idea || 'No content available'}
        </p>
        {postData.imagePrompt && !postData.imageUrl && (
          <p className="text-xs text-gray-500 italic">
            Image prompt: {postData.imagePrompt}
          </p>
        )}
      </div>
    </div>
  );
}
