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
  },
  twitter: {
    highlight: 'bg-sky-50',
    active: 'bg-sky-500',
    text: 'text-sky-600'
  },
  linkedin: {
    highlight: 'bg-indigo-50',
    active: 'bg-indigo-500',
    text: 'text-indigo-600'
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
    
    // Create dates using the date string only (YYYY-MM-DD)
    const campaignStart = new Date(new Date(campaign.startDate).toISOString().split('T')[0]);
    const campaignEnd = new Date(new Date(campaign.endDate).toISOString().split('T')[0]);
    const compareDate = new Date(date.toISOString().split('T')[0]);
    
    return compareDate >= campaignStart && compareDate <= campaignEnd;
  };

  const getPostForDate = (date) => {
    if (!campaign.generatedPosts) return null;
    
    // Get just the date part (YYYY-MM-DD)
    const dateStr = date.toISOString().split('T')[0];
    
    // Find post for this date and platform
    return campaign.generatedPosts.find(post => {
      // Get just the date part from the post date
      const postDateStr = new Date(post.date).toISOString().split('T')[0];
      return postDateStr === dateStr && post.platform === platform;
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-start-${i}`} className="min-h-[150px] border-t border-l first:border-l-0"></div>
      );
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      // Create date at midnight UTC
      const date = new Date(Date.UTC(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      ));
      
      const isInCampaign = isDateInCampaign(date);
      const styles = platformStyles[platform] || platformStyles.facebook;

      // Get post data for this date if it exists
      const post = isInCampaign ? getPostForDate(date) : null;

      days.push(
        <div
          key={`day-${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`}
          className={`min-h-[150px] border-t border-l first:border-l-0 ${
            isInCampaign ? styles.highlight : ''
          }`}
        >
          {isInCampaign ? (
            <CampaignPost 
              key={`post-${platform}-${day}`}
              day={day} 
              platform={platform} 
              postData={post}
              styles={styles}
            />
          ) : (
            <div key={`empty-${day}`} className="p-2 text-sm text-gray-400">{day}</div>
          )}
        </div>
      );
    }

    // Calculate how many empty cells we need to add to complete the last row
    const totalDays = firstDayOfMonth + daysInMonth;
    const remainingCells = 7 - (totalDays % 7);
    
    // Only add empty cells if we need to complete the last row
    if (remainingCells < 7) {
      for (let i = 0; i < remainingCells; i++) {
        days.push(
          <div key={`empty-end-${i}`} className="min-h-[150px] border-t border-l first:border-l-0"></div>
        );
      }
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
