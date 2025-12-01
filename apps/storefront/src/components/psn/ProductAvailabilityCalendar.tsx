'use client'

import React, { useState } from 'react';
import { Calendar, CheckCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { ProductAvailabilityCalendar as AvailabilityData } from '../types';

interface ProductAvailabilityCalendarProps {
  productId: string;
}

export default function ProductAvailabilityCalendar({
  productId
}: ProductAvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: availability, isLoading } = useQuery({
    queryKey: ['productAvailability', productId, currentMonth.getMonth(), currentMonth.getFullYear()],
    queryFn: async () => {
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from('product_availability_calendar')
        .select('*')
        .eq('product_id', productId)
        .gte('availability_date', startOfMonth.toISOString().split('T')[0])
        .lte('availability_date', endOfMonth.toISOString().split('T')[0])
        .order('availability_date', { ascending: true });

      if (error) throw error;
      return data as AvailabilityData[];
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 5
  });

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const getAvailabilityForDate = (date: Date): AvailabilityData | null => {
    if (!availability) return null;
    const dateStr = date.toISOString().split('T')[0];
    return availability.find(a => a.availability_date === dateStr) || null;
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-700 rounded w-48 mb-4"></div>
        <div className="h-64 bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (!availability || availability.length === 0) {
    return null;
  }

  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="aspect-square" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dayAvailability = getAvailabilityForDate(date);
    const isToday = date.toDateString() === new Date().toDateString();
    const isPast = date < new Date() && !isToday;

    days.push(
      <div
        key={day}
        className={`aspect-square p-2 rounded-lg border ${
          isPast
            ? 'bg-gray-900/30 border-gray-800'
            : dayAvailability
            ? dayAvailability.is_confirmed
              ? 'bg-green-500/20 border-green-500/30'
              : 'bg-blue-500/20 border-blue-500/30'
            : 'bg-gray-800/50 border-gray-700'
        } ${isToday ? 'ring-2 ring-[#F4A024]' : ''}`}
      >
        <div className="flex flex-col h-full">
          <span
            className={`text-sm font-medium ${
              isPast ? 'text-gray-600' : 'text-white'
            }`}
          >
            {day}
          </span>
          {dayAvailability && !isPast && (
            <div className="flex-1 flex flex-col items-center justify-center mt-1">
              {dayAvailability.is_confirmed ? (
                <CheckCircle className="w-4 h-4 text-green-400 mb-1" />
              ) : (
                <Clock className="w-4 h-4 text-blue-400 mb-1" />
              )}
              {dayAvailability.estimated_quantity && (
                <span className="text-xs text-gray-300">
                  {dayAvailability.estimated_quantity}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-[#F4A024]" />
        <h3 className="text-lg font-semibold text-white">Availability Calendar</h3>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-300" />
        </button>

        <h4 className="text-lg font-medium text-white">{monthName}</h4>

        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-300" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">{days}</div>

      <div className="mt-6 pt-4 border-t border-gray-700 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="text-gray-300">Confirmed Availability</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-blue-400" />
          <span className="text-gray-300">Estimated Availability</span>
        </div>
      </div>
    </div>
  );
}
