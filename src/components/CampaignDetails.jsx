'use client';

export default function CampaignDetails({ campaign, selectedPlatform, onPlatformChange }) {
  return (
    <div className="bg-card p-6 rounded-lg shadow mb-6 w-full">
      <h2 className="text-xl font-semibold mb-4">Campaign Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <p className="text-sm text-muted-foreground">Start Date</p>
          <p>{new Date(campaign.startDate).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">End Date</p>
          <p>{new Date(campaign.endDate).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-2">Platforms</p>
          <div className="flex gap-2">
            {campaign.platforms.map((platform) => (
              <button
                key={platform}
                onClick={() => onPlatformChange(platform)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  platform === selectedPlatform
                    ? platform === 'facebook'
                      ? 'bg-blue-500 text-white'
                      : 'bg-pink-500 text-white'
                    : platform === 'facebook'
                    ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                    : 'bg-pink-100 text-pink-800 hover:bg-pink-200'
                }`}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
