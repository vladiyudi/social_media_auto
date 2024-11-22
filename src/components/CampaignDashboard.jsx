'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import CampaignDetails from './CampaignDetails';
import CampaignCalendar from './CampaignCalendar';

export default function CampaignDashboard({ campaignId }) {
  const router = useRouter();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await fetch(`/api/campaigns?id=${campaignId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch campaign');
        }
        const data = await response.json();
        setCampaign(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (campaignId) {
      fetchCampaign();
    }
  }, [campaignId]);

  useEffect(() => {
    if (campaign) {
      setSelectedPlatform(campaign.platforms[0]);
    }
  }, [campaign]);

  const handlePlatformChange = (platform) => {
    setSelectedPlatform(platform);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Campaign not found</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          ← Back to Campaigns
        </Button>
        <h1 className="text-3xl font-bold">{campaign.name}</h1>
        {campaign.description && (
          <p className="text-muted-foreground mt-2">{campaign.description}</p>
        )}
      </div>

      <div className="space-y-6">
        <CampaignDetails 
          campaign={campaign}
          selectedPlatform={selectedPlatform}
          onPlatformChange={handlePlatformChange}
        />
        <CampaignCalendar 
          campaign={campaign}
          platform={selectedPlatform}
        />
      </div>
    </div>
  );
}
