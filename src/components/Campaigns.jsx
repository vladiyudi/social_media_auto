'use client';

import { useState, useEffect } from 'react';
import Campaign from './Campaign';
import CreateCampaign from './CreateCampaign';

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/campaigns');
      if (!res.ok) throw new Error('Failed to fetch campaigns');
      const data = await res.json();
      setCampaigns(data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setError('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCampaignCreated = (newCampaignData) => {
    // Extract just the campaign data from the response
    const newCampaign = newCampaignData.campaign || newCampaignData;
    setCampaigns(prev => [newCampaign, ...prev]);
  };

  const handleCampaignDelete = async (id) => {
    try {
      const res = await fetch(`/api/campaigns?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete campaign');
      setCampaigns(prev => prev.filter(campaign => campaign._id !== id));
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
        {[...Array(4)].map((_, i) => (
          <div 
            key={i}
            className="aspect-square bg-card animate-pulse rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      <div className="aspect-square">
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full h-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
        >
          <span className="text-4xl">+</span>
          <span>New Campaign</span>
        </button>
      </div>
      
      {campaigns.map((campaign) => (
        <Campaign
          key={campaign._id}
          id={campaign._id}
          name={campaign.name}
          description={campaign.description}
          startDate={new Date(campaign.startDate)}
          endDate={new Date(campaign.endDate)}
          platforms={campaign.platforms}
          connection={campaign.connection}
          onDelete={() => handleCampaignDelete(campaign._id)}
        />
      ))}

      {showCreateModal && (
        <CreateCampaign
          onClose={() => setShowCreateModal(false)}
          onCampaignCreated={handleCampaignCreated}
        />
      )}
    </div>
  );
}
