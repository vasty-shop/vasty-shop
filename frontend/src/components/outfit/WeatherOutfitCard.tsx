import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Eye, Plus, Star, Shirt, ChevronRight, CloudRain, Thermometer, MapPin } from 'lucide-react';
import { Outfit } from '@/types';
import { Button } from '@/components/ui/button';
import { formatTemperature } from '@/lib/utils';

interface WeatherOutfitCardProps {
  outfit: Outfit;
  temperature?: number;
}

export const WeatherOutfitCard: React.FC<WeatherOutfitCardProps> = ({ outfit }) => {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = React.useState(false);

  const handleBack = () => navigate(-1);
  const toggleSave = () => setIsSaved(!isSaved);
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: outfit.name,
        text: `Check out this outfit: ${outfit.name}`,
      });
    }
  };

  return (
    <div className="bg-cloud-gradient rounded-card shadow-card overflow-hidden">
      <div className="relative aspect-[3/4]">
        <img src={outfit.image} alt={outfit.name} className="w-full h-full object-cover" />

        {/* Floating Tag */}
        {outfit.tags && outfit.tags.length > 0 && (
          <div className="absolute top-1/3 right-4 animate-in slide-in-from-right">
            <div className="bg-card-dark/80 backdrop-blur-glass rounded-button px-4 py-2 flex items-center gap-2 shadow-glass">
              <Shirt className="w-4 h-4 text-white" />
              <span className="text-white font-medium text-sm">{outfit.tags[0]}</span>
              <ChevronRight className="w-4 h-4 text-white" />
            </div>
          </div>
        )}

        {/* Top Icons */}
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <button
            onClick={handleBack}
            className="p-2 bg-white/80 backdrop-blur-glass rounded-full shadow-glass hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text-primary" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={toggleSave}
              className="p-2 bg-white/80 backdrop-blur-glass rounded-full shadow-glass hover:bg-white transition-colors"
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-red-500 text-red-500' : 'text-text-primary'}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 bg-white/80 backdrop-blur-glass rounded-full shadow-glass hover:bg-white transition-colors"
            >
              <Share2 className="w-5 h-5 text-text-primary" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <span className="text-caption text-text-secondary font-semibold">{outfit.category}</span>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-weather-sun text-weather-sun" />
            <span className="text-sm font-medium">{outfit.rating}</span>
          </div>
        </div>

        <h2 className="text-h2 font-bold text-text-primary mb-4">{outfit.name}</h2>

        {/* Weather Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {outfit.weatherSuitability[0] && (
            <div className="bg-white rounded-pill px-3 py-1.5 flex items-center gap-2 shadow-sm">
              <CloudRain className="w-4 h-4 text-weather-rain" />
              <span className="text-sm font-medium">{outfit.weatherSuitability[0]}</span>
            </div>
          )}
          <div className="bg-white rounded-pill px-3 py-1.5 flex items-center gap-2 shadow-sm">
            <Thermometer className="w-4 h-4 text-text-secondary" />
            <span className="text-sm font-medium">
              {formatTemperature(outfit.temperature.min)}-{formatTemperature(outfit.temperature.max)}
            </span>
          </div>
          {outfit.events[0] && (
            <div className="bg-white rounded-pill px-3 py-1.5 flex items-center gap-2 shadow-sm">
              <MapPin className="w-4 h-4 text-text-secondary" />
              <span className="text-sm font-medium">{outfit.events[0]}</span>
            </div>
          )}
        </div>

        {outfit.description && (
          <p className="text-sm text-text-secondary mb-6 line-clamp-3">{outfit.description}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => navigate(`/ar-tryon/${outfit.id}`)}
          >
            <Eye className="mr-2 w-4 h-4" />
            AR View
          </Button>
          <Button className="flex-1" onClick={() => navigate('/calendar')}>
            <Plus className="mr-2 w-4 h-4" />
            Schedule for Event
          </Button>
        </div>
      </div>
    </div>
  );
};
