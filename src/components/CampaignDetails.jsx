'use client';

import { LinkIcon } from '@heroicons/react/24/outline';
import { getConnectionName } from '@/lib/utils/connections';

const platformStyles = {
  facebook: {
    active: 'bg-blue-500 text-white',
    inactive: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
  },
  instagram: {
    active: 'bg-pink-500 text-white',
    inactive: 'bg-pink-100 text-pink-800 hover:bg-pink-200'
  },
  twitter: {
    active: 'bg-sky-500 text-white',
    inactive: 'bg-sky-100 text-sky-800 hover:bg-sky-200'
  },
  linkedin: {
    active: 'bg-indigo-500 text-white',
    inactive: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
  }
};

export default function CampaignDetails({ campaign, selectedPlatform, onPlatformChange }) {
  const connectionName = getConnectionName(campaign.connection);

  return (
    <div className="bg-card p-6 rounded-lg shadow mb-6 w-full">
      <h2 className="text-xl font-semibold mb-4">Campaign Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <p className="text-sm text-muted-foreground">Start Date</p>
          <p>{new Date(campaign.startDate).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">End Date</p>
          <p>{new Date(campaign.endDate).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Connection</p>
          <div className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
            <p>{connectionName}</p>
          </div>
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
                    ? platformStyles[platform].active
                    : platformStyles[platform].inactive
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
