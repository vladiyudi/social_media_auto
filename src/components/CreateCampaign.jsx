'use client';

import { useState, useEffect } from 'react';

export default function CreateCampaign({ onClose, onCampaignCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedConnection, setSelectedConnection] = useState('');
  const [availablePlatforms, setAvailablePlatforms] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [connections, setConnections] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchConnections = () => {
      try {
        const connectionsData = JSON.parse(process.env.NEXT_PUBLIC_CONNECTIONS || '[]');
        setConnections(connectionsData);
      } catch (err) {
        setError('Failed to load connections');
        console.error('Error loading connections:', err);
      }
    };

    fetchConnections();
  }, []);

  const handleConnectionChange = (e) => {
    const value = e.target.value;
    setSelectedConnection(value);
    const connection = connections.find(conn => conn.name_connection === value);
    if (connection) {
      const platforms = Object.keys(connection).filter(key => 
        key !== 'name_connection' && connection[key]
      );
      setAvailablePlatforms(platforms);
      setSelectedPlatforms([]); // Reset selected platforms when connection changes
    }
  };

  const handlePlatformToggle = (platform) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(platform)) {
        return prev.filter(p => p !== platform);
      }
      return [...prev, platform];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedConnection) {
      setError('Please select a connection');
      return;
    }
    if (selectedPlatforms.length === 0) {
      setError('Please select at least one platform');
      return;
    }

    const connection = connections.find(conn => conn.name_connection === selectedConnection);
    const platformWebhooks = {};
    selectedPlatforms.forEach(platform => {
      platformWebhooks[platform] = connection[platform];
    });

    const campaign = {
      name,
      description,
      startDate,
      endDate,
      connection: selectedConnection,
      platforms: selectedPlatforms,
      platformWebhooks,
    };

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaign),
      });

      if (!response.ok) {
        throw new Error('Failed to create campaign');
      }

      const data = await response.json();
      onCampaignCreated(data);
      onClose();
    } catch (err) {
      setError('Failed to create campaign');
      console.error('Error creating campaign:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Create Campaign</h2>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Campaign Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="connection" className="block text-sm font-medium text-gray-700">
              Connection
            </label>
            <select
              id="connection"
              value={selectedConnection}
              onChange={handleConnectionChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a connection</option>
              {connections.map((connection) => (
                <option
                  key={connection.name_connection}
                  value={connection.name_connection}
                >
                  {connection.name_connection}
                </option>
              ))}
            </select>
          </div>

          {selectedConnection && availablePlatforms.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Platforms
              </label>
              <div className="space-y-2">
                {availablePlatforms.map((platform) => (
                  <label key={platform} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={platform}
                      checked={selectedPlatforms.includes(platform)}
                      onChange={() => handlePlatformToggle(platform)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {platform}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
