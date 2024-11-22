'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import CampaignDashboard from '@/components/CampaignDashboard';

export default function CampaignPage() {
  const params = useParams();
  const campaignId = params?.id;

  if (!campaignId) {
    return <div>Campaign not found</div>;
  }

  return (
    <Suspense fallback={<div>Loading campaign...</div>}>
      <CampaignDashboard campaignId={campaignId} />
    </Suspense>
  );
}
