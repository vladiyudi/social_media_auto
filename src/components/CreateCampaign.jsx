'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from "@/components/ui/label";

export default function CreateCampaign({ onClose, onCampaignCreated }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
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
  const [brandLanguage, setBrandLanguage] = useState('');
  const [imageStyle, setImageStyle] = useState('');
  const [llmModels, setLlmModels] = useState([]);
  const [selectedLlmModel, setSelectedLlmModel] = useState('');
  const [llmModelDescription, setLlmModelDescription] = useState('');
  const [imageModels, setImageModels] = useState([]);
  const [selectedImageModel, setSelectedImageModel] = useState('');
  const [imageModelDescription, setImageModelDescription] = useState('');

  useEffect(() => {

    console.log('ROCESS', process.env);
    console.log('LLMs raw:', process.env.NEXT_PUBLIC_LLMS);
    console.log('Image Models raw:', process.env.NEXT_PUBLIC_IMAGE_MODELS);
    const fetchConnections = () => {
      try {
        const data = JSON.parse(process.env.NEXT_PUBLIC_CONNECTIONS || '{"connections":[]}');
        return data.connections || [];
      } catch (error) {
        console.error('Error parsing connections:', error);
        return [];
      }
    };

    const fetchModels = () => {
      try {
        const llms = JSON.parse(process.env.NEXT_PUBLIC_LLMS || '[]');
        const imgModels = JSON.parse(process.env.NEXT_PUBLIC_IMAGE_MODELS || '[]');
        console.log('Loaded LLMs:', llms);
        console.log('Loaded Image Models:', imgModels);
        setLlmModels(llms);
        setImageModels(imgModels);
        if (llms.length > 0) {
          setSelectedLlmModel(llms[0].model);
          setLlmModelDescription(llms[0].description);
        }
        if (imgModels.length > 0) {
          setSelectedImageModel(imgModels[0].model);
          setImageModelDescription(imgModels[0].description);
        }
      } catch (error) {
        console.error('Error parsing models:', error);
        console.error('LLMs raw:', process.env.NEXT_PUBLIC_LLMS);
        console.error('Image Models raw:', process.env.NEXT_PUBLIC_IMAGE_MODELS);
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

    fetchModels();
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
      setSelectedPlatforms([]);
    }
  };

  const handleLlmModelChange = (e) => {
    const model = e.target.value;
    setSelectedLlmModel(model);
    const selectedModel = llmModels.find(m => m.model === model);
    if (selectedModel) {
      setLlmModelDescription(selectedModel.description);
    }
  };

  const handleImageModelChange = (e) => {
    const model = e.target.value;
    setSelectedImageModel(model);
    const selectedModel = imageModels.find(m => m.model === model);
    if (selectedModel) {
      setImageModelDescription(selectedModel.description);
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

  const validateStep1 = () => {
    if (!name || !description || !startDate || !endDate || !selectedConnection || selectedPlatforms.length === 0) {
      setError('Please fill in all required fields');
      return false;
    }
    return true;
  };

  const handleCreateCampaign = (e) => {
    e.preventDefault();
    if (validateStep1()) {
      setCurrentStep(2);
      setError('');
    }
  };

  const handleSaveBrandLanguage = async () => {
    if (!brandLanguage.trim() || !selectedLlmModel) {
      setError('Please enter brand language preferences and select a language model');
      return;
    }
    setCurrentStep(3);
    setError('');
  };

  const handleSaveImageStyle = async () => {
    if (!imageStyle.trim() || !selectedImageModel) {
      setError('Please enter image style preferences and select an image model');
      return;
    }

    const formData = {
      name,
      description,
      startDate,
      endDate,
      platforms: selectedPlatforms,
      connection: selectedConnection,
      includeImages,
      brandLanguage,
      imageStyle,
      llmModel: selectedLlmModel,
      imageModel: selectedImageModel
    };

    onCampaignCreated(formData);
  };

  const renderStep1 = () => (
    <form onSubmit={handleCreateCampaign} className="space-y-6">
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
            type="date"
            id="startDate"
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
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
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
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="brandLanguage" className="block text-sm font-medium text-gray-700">
          Brand Language
        </label>
        <textarea
          id="brandLanguage"
          value={brandLanguage}
          onChange={(e) => setBrandLanguage(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="6"
          placeholder="Enter your brand language preferences..."
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="llmModel" className="block text-sm font-medium text-gray-700">
          Language Model
        </label>
        <select
          id="llmModel"
          value={selectedLlmModel}
          onChange={handleLlmModelChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {llmModels.map((model) => (
            <option key={model.model} value={model.model}>
              {model.model}
            </option>
          ))}
        </select>
        {llmModelDescription && (
          <p className="mt-1 text-sm text-gray-500">
            {llmModelDescription}
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSaveBrandLanguage}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Save
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
    
      <div className="space-y-2">
        <label htmlFor="imageStyle" className="block text-sm font-medium text-gray-700">
          Image Style Preferences
        </label>
        <textarea
          id="imageStyle"
          value={imageStyle}
          onChange={(e) => setImageStyle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="6"
          placeholder="Enter your image style preferences..."
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="imageModel" className="block text-sm font-medium text-gray-700">
          Image Generation Model
        </label>
        <select
          id="imageModel"
          value={selectedImageModel}
          onChange={handleImageModelChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {imageModels.map((model) => (
            <option key={model.model} value={model.model}>
              {model.model}
            </option>
          ))}
        </select>
        {imageModelDescription && (
          <p className="mt-1 text-sm text-gray-500">
            {imageModelDescription}
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSaveImageStyle}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Save
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">
          {currentStep === 1 ? "Create Campaign" : 
           currentStep === 2 ? "Brand Language" : "Image Style"}
        </h2>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>
    </div>
  );
}
