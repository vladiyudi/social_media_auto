'use client';

export default function CampaignDetails({ campaign }) {
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
          <p className="text-sm text-muted-foreground">Platforms</p>
          <div className="flex gap-2 mt-1">
            {campaign.platforms.map((platform) => (
              <span
                key={platform}
                className={`px-2 py-1 rounded text-sm ${
                  platform === 'facebook'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-pink-100 text-pink-800'
                }`}
              >
                {platform}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
