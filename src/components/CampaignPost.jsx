'use client';

export default function CampaignPost({ day, platform, postData, styles }) {
  return (
    <div className="relative h-full p-2 group cursor-pointer hover:bg-gray-50">
      <div className={`absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${styles.active}`}>
        {day}
      </div>
      <div className="pt-6">
        <div className="w-full aspect-square bg-gray-200 rounded-lg mb-2"></div>
        <p className={`text-sm line-clamp-2 ${styles.text}`}>
          {postData?.idea || `No content for ${platform} post #${day}`}
        </p>
      </div>
    </div>
  );
}
