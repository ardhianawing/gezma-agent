'use client';

import * as React from 'react';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
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
  const [expandedDays, setExpandedDays] = React.useState<number[]>([1]);

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Itinerary ({value.length}/{duration} days)</CardTitle>
        <Button type="button" variant="outline" size="sm" onClick={addDay} disabled={value.length >= duration}>
          <Plus className="h-4 w-4 mr-1" />
          Add Day
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {value.length === 0 ? (
          <div className="text-center py-8 text-[var(--gray-600)]">
            <p>No itinerary yet. Click "Add Day" to start building.</p>
          </div>
        ) : (
          value.map((day, dayIndex) => (
            <div
              key={day.day}
              className="border border-[var(--gray-border)] rounded-[12px] overflow-hidden"
            >
              {/* Day Header */}
              <div
                className="flex items-center gap-3 p-4 bg-[var(--gray-100)] cursor-pointer"
                onClick={() => toggleExpanded(day.day)}
              >
                <GripVertical className="h-4 w-4 text-[var(--gray-400)]" />
                <div className="flex-1">
                  <span className="font-semibold text-[var(--charcoal)]">Day {day.day}</span>
                  <span className="text-[var(--gray-600)] mx-2">-</span>
                  <span className="text-[var(--gray-600)]">{day.title}</span>
                  <span className="text-xs text-[var(--gray-400)] ml-2">({day.city})</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeDay(dayIndex);
                  }}
                  className="text-[var(--error)]"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                {expandedDays.includes(day.day) ? (
                  <ChevronUp className="h-4 w-4 text-[var(--gray-600)]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[var(--gray-600)]" />
                )}
              </div>

              {/* Day Content */}
              {expandedDays.includes(day.day) && (
                <div className="p-4 space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label>Day Title</Label>
                      <Input
                        value={day.title}
                        onChange={(e) => updateDay(dayIndex, { title: e.target.value })}
                        placeholder="e.g., Arrival in Madinah"
                      />
                    </div>
                    <div>
                      <Label>City</Label>
                      <select
                        value={day.city}
                        onChange={(e) => updateDay(dayIndex, { city: e.target.value })}
                        className="w-full h-10 rounded-[12px] border border-[var(--gray-border)] px-3 text-sm"
                      >
                        {cities.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Hotel (Optional)</Label>
                      <Input
                        value={day.hotel || ''}
                        onChange={(e) => updateDay(dayIndex, { hotel: e.target.value })}
                        placeholder="Hotel name"
                      />
                    </div>
                  </div>

                  {/* Meals */}
                  <div>
                    <Label>Meals Included</Label>
                    <div className="flex gap-2 mt-2">
                      {mealOptions.map((meal) => (
                        <button
                          key={meal.value}
                          type="button"
                          onClick={() => toggleMeal(dayIndex, meal.value)}
                          className={cn(
                            'px-3 py-1.5 rounded-[8px] text-sm transition-colors',
                            day.meals.includes(meal.value)
                              ? 'bg-[var(--gezma-red)] text-white'
                              : 'bg-[var(--gray-100)] text-[var(--gray-600)] hover:bg-[var(--gray-200)]'
                          )}
                        >
                          {meal.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Activities */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Activities</Label>
                      <Button type="button" variant="ghost" size="sm" onClick={() => addActivity(dayIndex)}>
                        <Plus className="h-3 w-3 mr-1" />
                        Add Activity
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {day.activities.map((activity, actIndex) => (
                        <div key={activity.id} className="flex gap-2 items-start">
                          <Input
                            type="time"
                            value={activity.time}
                            onChange={(e) => updateActivity(dayIndex, actIndex, { time: e.target.value })}
                            className="w-28"
                          />
                          <Input
                            value={activity.title}
                            onChange={(e) => updateActivity(dayIndex, actIndex, { title: e.target.value })}
                            placeholder="Activity title"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeActivity(dayIndex, actIndex)}
                            className="text-[var(--error)]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <Label>Description (Optional)</Label>
                    <Textarea
                      value={day.description || ''}
                      onChange={(e) => updateDay(dayIndex, { description: e.target.value })}
                      placeholder="Additional notes for this day..."
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
