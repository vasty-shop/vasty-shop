import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Flower, Sun, Leaf, Snowflake } from 'lucide-react';
import { useFilterStore } from '@/stores/useFilterStore';
import { EventType, Season } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Pill } from '@/components/ui/pill';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectLabel, SelectSeparator } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { STYLES, WEATHER_CONDITIONS, EVENT_TYPES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface FilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const seasonIcons = {
  Spring: Flower,
  Summer: Sun,
  Autumn: Leaf,
  Winter: Snowflake,
};

export const FilterModal: React.FC<FilterModalProps> = ({ open, onOpenChange }) => {
  const { t } = useTranslation();
  const filters = useFilterStore((state) => state.filters);
  const toggleStyle = useFilterStore((state) => state.toggleStyle);
  const setEvent = useFilterStore((state) => state.setEvent);
  const setSeason = useFilterStore((state) => state.setSeason);
  const toggleWeather = useFilterStore((state) => state.toggleWeather);
  const setTemperature = useFilterStore((state) => state.setTemperature);
  const reset = useFilterStore((state) => state.reset);

  const handleApply = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-cloud-gradient">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-h2">Filters</DialogTitle>
          <Button variant="ghost" size="sm" onClick={reset}>
            Reset
          </Button>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Style Section */}
          <div>
            <Label className="text-sm font-semibold mb-3 block">Style:</Label>
            <div className="flex flex-wrap gap-2">
              {STYLES.map((style) => (
                <Pill
                  key={style}
                  label={style}
                  selected={filters.styles.includes(style)}
                  onClick={() => toggleStyle(style)}
                />
              ))}
            </div>
          </div>

          {/* Event Section */}
          <div>
            <Label className="text-sm font-semibold mb-3 block">Event:</Label>
            <Select value={filters.event} onValueChange={(value) => setEvent(value as EventType)}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-text-secondary" />
                  <SelectValue placeholder={t('common.placeholders.selectEventType')} />
                </div>
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((category, idx) => (
                  <React.Fragment key={category.category}>
                    {idx > 0 && <SelectSeparator />}
                    {idx > 0 && <SelectLabel>{category.category}:</SelectLabel>}
                    {category.events.map((event) => (
                      <SelectItem key={event} value={event}>
                        {event}
                      </SelectItem>
                    ))}
                  </React.Fragment>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Season Section */}
          <div>
            <Label className="text-sm font-semibold mb-3 block">Season:</Label>
            <div className="grid grid-cols-4 gap-3">
              {(['Spring', 'Summer', 'Autumn', 'Winter'] as Season[]).map((season) => {
                const Icon = seasonIcons[season];
                const isSelected = filters.season === season;
                return (
                  <button
                    key={season}
                    onClick={() => setSeason(isSelected ? undefined : season)}
                    className={cn(
                      'aspect-square rounded-card p-4 flex flex-col items-center justify-center gap-2 transition-all border-2',
                      isSelected
                        ? 'bg-accent-blue text-white border-accent-blue shadow-lg'
                        : 'bg-white text-text-primary border-gray-200 hover:border-accent-blue'
                    )}
                  >
                    <Icon className={cn('w-6 h-6', isSelected ? 'text-white' : 'text-accent-blue')} />
                    <span className="text-caption font-medium">{season}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Weather Section */}
          <div>
            <Label className="text-sm font-semibold mb-3 block">Weather:</Label>
            <div className="flex flex-wrap gap-2">
              {WEATHER_CONDITIONS.map((condition) => (
                <Pill
                  key={condition}
                  label={condition}
                  selected={filters.weather.includes(condition)}
                  onClick={() => toggleWeather(condition)}
                />
              ))}
            </div>
          </div>

          {/* Temperature Slider */}
          <div>
            <Label className="text-sm font-semibold mb-3 block">Temperature:</Label>
            <div className="px-2">
              <Slider
                min={-20}
                max={45}
                step={1}
                value={[filters.temperature.min, filters.temperature.max]}
                onValueChange={([min, max]) => setTemperature({ min, max })}
                className="mb-4"
              />
              <div className="flex justify-between text-sm font-medium text-text-primary">
                <span>{filters.temperature.min}°C</span>
                <span>{filters.temperature.max}°C</span>
              </div>
            </div>
          </div>

          {/* Apply Button */}
          <Button className="w-full" size="lg" onClick={handleApply}>
            Apply filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
