'use client';

import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import CampaignPost from './CampaignPost';

const platformStyles = {
  facebook: {
    highlight: 'bg-blue-50',
    active: 'bg-blue-500',
    text: 'text-blue-600'
  },
  instagram: {
    highlight: 'bg-pink-50',
    active: 'bg-pink-500',
    text: 'text-pink-600'
  }
};

export default function CampaignCalendar({ campaign, platform }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Return early if no platform is selected
  if (!platform) {
    return (
      <div className="bg-card p-6 rounded-lg shadow w-full">
        <div className="text-center text-gray-500">
          Loading calendar...
        </div>
      </div>
    );
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const isDateInCampaign = (date) => {
    if (!campaign?.startDate || !campaign?.endDate) return false;
    const campaignStart = new Date(campaign.startDate);
    const campaignEnd = new Date(campaign.endDate);
    return date >= campaignStart && date <= campaignEnd;
  };

  const getPlatformPostData = (date) => {
    if (isDateInCampaign(date)) {
      return {
        platform,
        date,
      };
    }
    return null;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} className="min-h-[150px] border-t border-l first:border-l-0"></div>
      );
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const isInCampaign = isDateInCampaign(date);
      const postData = getPlatformPostData(date);
      const styles = platformStyles[platform] || platformStyles.facebook; // Fallback to facebook styles

      days.push(
        <div
          key={day}
          className={`min-h-[150px] border-t border-l first:border-l-0 ${
            isInCampaign ? styles.highlight : ''
          }`}
        >
          {isInCampaign ? (
            <CampaignPost 
              day={day} 
              platform={platform} 
              postData={postData}
              styles={styles}
            />
          ) : (
            <div className="p-2 text-sm text-gray-400">{day}</div>
          )}
        </div>
      );
    }

    return days;
  };

  const changeMonth = (increment) => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + increment)));
  };

  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);

  return (
    <div className="bg-card p-6 rounded-lg shadow w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          {platformName} Calendar
        </h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <span className="text-lg font-medium">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 bg-gray-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="p-4 text-center font-semibold text-sm border-b border-gray-200"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {renderCalendar()}
        </div>
      </div>
    </div>
  );
}
