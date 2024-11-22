'use client';

import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function CampaignCalendar({ campaign }) {
  const [currentDate, setCurrentDate] = useState(new Date());

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
    const campaignStart = new Date(campaign.startDate);
    const campaignEnd = new Date(campaign.endDate);
    return date >= campaignStart && date <= campaignEnd;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-4"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const isInCampaign = isDateInCampaign(date);

      days.push(
        <div
          key={day}
          className={`p-4 text-center border-t border-l first:border-l-0 ${
            isInCampaign ? 'bg-blue-50 text-blue-600' : ''
          }`}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  const changeMonth = (increment) => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + increment)));
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow w-full">
      <h2 className="text-xl font-semibold mb-4">Calendar</h2>
      <div className="text-xl font-semibold text-center mb-4">
        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
      </div>
      <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
        {/* Calendar header */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="p-4 text-center font-semibold bg-gray-50 border-b border-gray-200">
            {day}
          </div>
        ))}
        {/* Calendar days */}
        {renderCalendar()}
      </div>
      <div className="flex justify-center gap-4 mt-4">
        <button
          onClick={() => changeMonth(-1)}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </button>
        <button
          onClick={() => changeMonth(1)}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <ChevronRightIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
