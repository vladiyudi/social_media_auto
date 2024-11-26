'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from "@/components/ui/label";

export default function CreateCampaign({ onClose, onCampaignCreated }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [connections, setConnections] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState('');
  const [availablePlatforms, setAvailablePlatforms] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [error, setError] = useState('');
  const [includeImages, setIncludeImages] = useState(true);

  useEffect(() => {
    const fetchConnections = () => {
      try {
        const data = JSON.parse(process.env.NEXT_PUBLIC_CONNECTIONS || '{"connections":[]}');
        return data.connections || [];
      } catch (error) {
        console.error('Error parsing connections:', error);
        return [];
      }
    };

    const connectionsData = fetchConnections();
    setConnections(connectionsData);
    if (connectionsData.length > 0) {
      setSelectedConnection(connectionsData[0].name_connection);
      const platforms = Object.keys(connectionsData[0]).filter(key => 
        key !== 'name_connection' && key !== 'webhook' && connectionsData[0][key]
      );
      setAvailablePlatforms(platforms);
    }
  }, []);

  const handleConnectionChange = (e) => {
    const value = e.target.value;
    setSelectedConnection(value);
    const connection = connections.find(conn => conn.name_connection === value);
    if (connection) {
      const platforms = Object.keys(connection).filter(key => 
        key !== 'name_connection' && key !== 'webhook' && connection[key]
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
    
    if (!validateForm()) {
      return;
    }

    // Ensure dates are in ISO format
    const formattedStartDate = new Date(startDate + 'T00:00:00Z').toISOString();
    const formattedEndDate = new Date(endDate + 'T00:00:00Z').toISOString();

    const formData = {
      name,
      description,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      platforms: selectedPlatforms,
      connection: selectedConnection,
      includeImages,
    };

    onCampaignCreated(formData);
  };

  const validateForm = () => {
    if (!selectedConnection) {
      setError('Please select a connection');
      return false;
    }
    if (selectedPlatforms.length === 0) {
      setError('Please select at least one platform');
      return false;
    }
    return true;
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

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Connection
            </label>
            <select
              value={selectedConnection}
              onChange={handleConnectionChange}
              required
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="flex justify-between items-start space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platforms
                </label>
                <div className="space-y-2">
                  {availablePlatforms.map((platform) => (
                    <label key={platform} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedPlatforms.includes(platform)}
                        onChange={() => handlePlatformToggle(platform)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">{platform}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="mt-8">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={includeImages}
                    onClick={() => setIncludeImages(!includeImages)}
                    className={`${
                      includeImages ? 'bg-blue-600' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        includeImages ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out`}
                    />
                  </button>
                  <span className="text-sm font-medium text-gray-700">Include Images</span>
                </div>
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
