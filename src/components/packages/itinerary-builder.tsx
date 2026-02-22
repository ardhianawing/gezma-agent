'use client';

import * as React from 'react';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import type { ItineraryDay, ItineraryActivity, MealType } from '@/types/package';

interface ItineraryBuilderProps {
  value: ItineraryDay[];
  onChange: (days: ItineraryDay[]) => void;
  duration: number;
}

const cities = ['Jakarta', 'Madinah', 'Makkah', 'Jeddah'];
const mealOptions: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
];

export function ItineraryBuilder({ value, onChange, duration }: ItineraryBuilderProps) {
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const [expandedDays, setExpandedDays] = React.useState<number[]>([1]);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    color: c.textPrimary,
    backgroundColor: c.cardBgHover,
    border: `1px solid ${c.border}`,
    borderRadius: '12px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 16px center',
    paddingRight: '40px',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: c.textMuted,
    marginBottom: '8px',
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: '60px',
    resize: 'vertical' as const,
  };

  const addDay = () => {
    const newDay: ItineraryDay = {
      day: value.length + 1,
      title: `Day ${value.length + 1}`,
      city: 'Madinah',
      activities: [],
      meals: [],
    };
    onChange([...value, newDay]);
    setExpandedDays([...expandedDays, newDay.day]);
  };

  const updateDay = (index: number, updates: Partial<ItineraryDay>) => {
    const newDays = [...value];
    newDays[index] = { ...newDays[index], ...updates };
    onChange(newDays);
  };

  const removeDay = (index: number) => {
    const newDays = value.filter((_, i) => i !== index).map((day, i) => ({ ...day, day: i + 1 }));
    onChange(newDays);
  };

  const addActivity = (dayIndex: number) => {
    const newActivity: ItineraryActivity = {
      id: Math.random().toString(36).substring(2, 9),
      time: '08:00',
      title: '',
    };
    const newDays = [...value];
    newDays[dayIndex] = {
      ...newDays[dayIndex],
      activities: [...newDays[dayIndex].activities, newActivity],
    };
    onChange(newDays);
  };

  const updateActivity = (dayIndex: number, activityIndex: number, updates: Partial<ItineraryActivity>) => {
    const newDays = [...value];
    newDays[dayIndex].activities[activityIndex] = {
      ...newDays[dayIndex].activities[activityIndex],
      ...updates,
    };
    onChange(newDays);
  };

  const removeActivity = (dayIndex: number, activityIndex: number) => {
    const newDays = [...value];
    newDays[dayIndex].activities = newDays[dayIndex].activities.filter((_, i) => i !== activityIndex);
    onChange(newDays);
  };

  const toggleMeal = (dayIndex: number, meal: MealType) => {
    const newDays = [...value];
    const currentMeals = newDays[dayIndex].meals;
    if (currentMeals.includes(meal)) {
      newDays[dayIndex].meals = currentMeals.filter((m) => m !== meal);
    } else {
      newDays[dayIndex].meals = [...currentMeals, meal];
    }
    onChange(newDays);
  };

  const toggleExpanded = (day: number) => {
    if (expandedDays.includes(day)) {
      setExpandedDays(expandedDays.filter((d) => d !== day));
    } else {
      setExpandedDays([...expandedDays, day]);
    }
  };

  return (
    <div
      style={{
        backgroundColor: c.cardBg,
        borderRadius: '16px',
        border: `1px solid ${c.border}`,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: isMobile ? '16px 20px' : '20px 28px',
          borderBottom: `1px solid ${c.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calendar style={{ width: '18px', height: '18px', color: c.textMuted }} />
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
            Itinerary ({value.length}/{duration} days)
          </h3>
        </div>
        <button
          type="button"
          onClick={addDay}
          disabled={value.length >= duration}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: '500',
            color: value.length >= duration ? c.textLight : c.textSecondary,
            backgroundColor: c.cardBg,
            border: `1px solid ${c.border}`,
            borderRadius: '10px',
            cursor: value.length >= duration ? 'not-allowed' : 'pointer',
            opacity: value.length >= duration ? 0.5 : 1,
          }}
        >
          <Plus style={{ width: '14px', height: '14px' }} />
          Add Day
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: isMobile ? '20px' : '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {value.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: c.textMuted, fontSize: '14px' }}>
            No itinerary yet. Click &quot;Add Day&quot; to start building.
          </div>
        ) : (
          value.map((day, dayIndex) => (
            <div
              key={day.day}
              style={{
                border: `1px solid ${c.border}`,
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
              {/* Day Header */}
              <div
                onClick={() => toggleExpanded(day.day)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  backgroundColor: c.cardBgHover,
                  cursor: 'pointer',
                }}
              >
                <GripVertical style={{ width: '16px', height: '16px', color: c.textLight }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontWeight: '600', color: c.textPrimary, fontSize: '14px' }}>Day {day.day}</span>
                  <span style={{ color: c.textMuted, margin: '0 8px' }}>-</span>
                  <span style={{ color: c.textMuted, fontSize: '14px' }}>{day.title}</span>
                  <span style={{ fontSize: '12px', color: c.textLight, marginLeft: '8px' }}>({day.city})</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeDay(dayIndex);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    color: c.error,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Trash2 style={{ width: '16px', height: '16px' }} />
                </button>
                {expandedDays.includes(day.day) ? (
                  <ChevronUp style={{ width: '16px', height: '16px', color: c.textMuted }} />
                ) : (
                  <ChevronDown style={{ width: '16px', height: '16px', color: c.textMuted }} />
                )}
              </div>

              {/* Day Content */}
              {expandedDays.includes(day.day) && (
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={labelStyle}>Day Title</label>
                      <input
                        value={day.title}
                        onChange={(e) => updateDay(dayIndex, { title: e.target.value })}
                        placeholder="e.g., Arrival in Madinah"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>City</label>
                      <select
                        value={day.city}
                        onChange={(e) => updateDay(dayIndex, { city: e.target.value })}
                        style={selectStyle}
                      >
                        {cities.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Hotel (Optional)</label>
                      <input
                        value={day.hotel || ''}
                        onChange={(e) => updateDay(dayIndex, { hotel: e.target.value })}
                        placeholder="Hotel name"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  {/* Meals */}
                  <div>
                    <label style={labelStyle}>Meals Included</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {mealOptions.map((meal) => (
                        <button
                          key={meal.value}
                          type="button"
                          onClick={() => toggleMeal(dayIndex, meal.value)}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '500',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            backgroundColor: day.meals.includes(meal.value) ? c.primary : c.cardBgHover,
                            color: day.meals.includes(meal.value) ? 'white' : c.textMuted,
                          }}
                        >
                          {meal.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Activities */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <label style={{ ...labelStyle, marginBottom: 0 }}>Activities</label>
                      <button
                        type="button"
                        onClick={() => addActivity(dayIndex)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '500',
                          color: c.primary,
                          padding: '4px 8px',
                        }}
                      >
                        <Plus style={{ width: '14px', height: '14px' }} />
                        Add Activity
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {day.activities.map((activity, actIndex) => (
                        <div key={activity.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input
                            type="time"
                            value={activity.time}
                            onChange={(e) => updateActivity(dayIndex, actIndex, { time: e.target.value })}
                            style={{ ...inputStyle, width: '120px', flexShrink: 0 }}
                          />
                          <input
                            value={activity.title}
                            onChange={(e) => updateActivity(dayIndex, actIndex, { title: e.target.value })}
                            placeholder="Activity title"
                            style={{ ...inputStyle, flex: 1 }}
                          />
                          <button
                            type="button"
                            onClick={() => removeActivity(dayIndex, actIndex)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px',
                              color: c.error,
                              display: 'flex',
                              alignItems: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Trash2 style={{ width: '16px', height: '16px' }} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label style={labelStyle}>Description (Optional)</label>
                    <textarea
                      value={day.description || ''}
                      onChange={(e) => updateDay(dayIndex, { description: e.target.value })}
                      placeholder="Additional notes for this day..."
                      rows={2}
                      style={textareaStyle}
                    />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
