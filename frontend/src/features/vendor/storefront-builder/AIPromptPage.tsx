'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Wand2,
  Palette,
  Layout,
  Store,
  Loader2,
  ChevronRight,
  Mic,
  MicOff,
  CheckCircle,
  Lightbulb,
  Target,
  Users,
  Zap,
  Monitor,
  Smartphone,
  Truck,
  ShoppingBag,
  Edit3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useShopStore } from '@/stores/useShopStore';
import { api } from '@/lib/api';
import { THEME_PRESETS, STYLE_KEYWORDS } from './constants';
import type { AIGenerationPrompt } from './types';
import type { CombinedGenerationPrompt, MobileAppType } from '../mobile-app-builder/types';
import { createUnifiedMobileConfig } from '../mobile-app-builder/utils/styleMapper';

// Generation target options
type GenerationTarget = 'site' | 'mobile' | 'both';

// Style options
const STYLE_OPTIONS = [
  { id: 'modern', name: 'Modern', icon: Zap, description: 'Clean, contemporary design', color: 'from-blue-500 to-cyan-500' },
  { id: 'minimal', name: 'Minimal', icon: Layout, description: 'Simple and refined', color: 'from-gray-500 to-slate-500' },
  { id: 'bold', name: 'Bold', icon: Sparkles, description: 'Vibrant and eye-catching', color: 'from-pink-500 to-purple-500' },
  { id: 'elegant', name: 'Elegant', icon: Store, description: 'Sophisticated luxury feel', color: 'from-amber-500 to-orange-500' },
  { id: 'playful', name: 'Playful', icon: Palette, description: 'Fun and creative', color: 'from-green-500 to-emerald-500' },
  { id: 'professional', name: 'Professional', icon: Target, description: 'Trustworthy and established', color: 'from-indigo-500 to-blue-500' },
];

// Generation target options
const GENERATION_TARGET_OPTIONS = [
  { id: 'site', name: 'Website Only', icon: Monitor, description: 'Generate storefront website' },
  { id: 'mobile', name: 'Mobile Apps Only', icon: Smartphone, description: 'Generate mobile apps' },
];

// Mobile app type options
const MOBILE_APP_TYPE_OPTIONS = [
  { id: 'customer', name: 'Customer Panel', icon: ShoppingBag, description: 'Shopping app for customers' },
  { id: 'vendor', name: 'Vendor Panel', icon: Store, description: 'App for vendor management' },
  { id: 'delivery', name: 'Delivery Panel', icon: Truck, description: 'App for delivery personnel' },
];

// Prompt suggestions based on store type
const PROMPT_SUGGESTIONS: Record<string, string[]> = {
  fashion: [
    'A trendy fashion boutique with a focus on sustainable clothing',
    'Urban streetwear brand targeting young professionals',
    'Elegant women\'s fashion store with luxury feel',
  ],
  electronics: [
    'Modern tech gadget store with sleek, futuristic design',
    'Gaming accessories shop with bold, energetic vibes',
    'Smart home devices store with clean, professional look',
  ],
  home: [
    'Cozy home decor shop with warm, inviting atmosphere',
    'Modern furniture store with minimalist Scandinavian design',
    'Artisanal home goods with handcrafted aesthetic',
  ],
  food: [
    'Organic food market with fresh, natural feel',
    'Gourmet specialty foods with premium, elegant design',
    'Local bakery with warm, homey atmosphere',
  ],
  beauty: [
    'Clean beauty brand with natural, organic aesthetic',
    'Luxury skincare boutique with elegant, sophisticated look',
    'Fun makeup brand with bold, colorful design',
  ],
  general: [
    'Friendly neighborhood store with warm, welcoming feel',
    'Modern marketplace with diverse product range',
    'Premium lifestyle brand with curated selection',
  ],
};

// Generation stages for site
const SITE_GENERATION_STAGES = [
  { id: 'analyzing', label: 'Analyzing your description', icon: Target },
  { id: 'designing', label: 'Designing your theme', icon: Palette },
  { id: 'building', label: 'Building sections', icon: Layout },
  { id: 'optimizing', label: 'Optimizing for conversions', icon: Zap },
  { id: 'finalizing', label: 'Finalizing your storefront', icon: CheckCircle },
];

// Generation stages for mobile
const MOBILE_GENERATION_STAGES = [
  { id: 'analyzing', label: 'Analyzing your description', icon: Target },
  { id: 'designing-mobile', label: 'Designing mobile theme', icon: Palette },
  { id: 'building-screens', label: 'Building app screens', icon: Smartphone },
  { id: 'configuring-nav', label: 'Configuring navigation', icon: Layout },
  { id: 'finalizing-mobile', label: 'Finalizing your mobile app', icon: CheckCircle },
];

// Generation stages for both
const COMBINED_GENERATION_STAGES = [
  { id: 'analyzing', label: 'Analyzing your description', icon: Target },
  { id: 'designing', label: 'Designing unified theme', icon: Palette },
  { id: 'building-site', label: 'Building storefront sections', icon: Monitor },
  { id: 'building-mobile', label: 'Building mobile screens', icon: Smartphone },
  { id: 'optimizing', label: 'Optimizing for all platforms', icon: Zap },
  { id: 'finalizing', label: 'Finalizing your store', icon: CheckCircle },
];

export function AIPromptPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { shopId } = useParams<{ shopId: string }>();
  const { currentShop } = useShopStore();
  const { isAuthenticated } = useAuth();

  // State
  const [description, setDescription] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string>('modern');
  const [targetAudience, setTargetAudience] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // New state for generation targets
  const [generationTarget, setGenerationTarget] = useState<GenerationTarget>('site');
  const [selectedMobileApps, setSelectedMobileApps] = useState<MobileAppType[]>(['customer', 'vendor', 'delivery']);

  // Existing configuration state
  const [hasMobileConfig, setHasMobileConfig] = useState(false);
  const [isCheckingConfig, setIsCheckingConfig] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check for existing configurations on mount
  useEffect(() => {
    const checkExistingConfigs = async () => {
      setIsCheckingConfig(true);
      try {
        const mobileConfigResponse = await api.getMobileAppConfig();
        const configData = mobileConfigResponse?.config || mobileConfigResponse?.data || mobileConfigResponse;
        const hasConfig = !!(configData && typeof configData === 'object' && Object.keys(configData).length > 0);
        setHasMobileConfig(hasConfig);
      } catch (error) {
        setHasMobileConfig(false);
      } finally {
        setIsCheckingConfig(false);
      }
    };

    checkExistingConfigs();
  }, [shopId]);

  // Get suggestions based on store category
  const storeType = (currentShop as any)?.category || 'general';
  const suggestions = PROMPT_SUGGESTIONS[storeType] || PROMPT_SUGGESTIONS.general;

  // Get the appropriate generation stages based on target
  const getGenerationStages = () => {
    if (generationTarget === 'site') return SITE_GENERATION_STAGES;
    if (generationTarget === 'mobile') return MOBILE_GENERATION_STAGES;
    return COMBINED_GENERATION_STAGES;
  };

  // Toggle mobile app type selection - disabled, all apps are always selected
  const toggleMobileAppType = (appType: MobileAppType) => {
    // Do nothing - apps cannot be deselected
    return;
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [description]);

  // Voice input (Web Speech API)
  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice input is not supported in your browser');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setDescription((prev) => prev + (prev ? ' ' : '') + transcript);
    };

    recognition.start();
  };

  // Handle generation
  const handleGenerate = async () => {
    if (!description.trim()) return;

    setIsGenerating(true);
    setCurrentStage(0);

    const stages = getGenerationStages();

    try {
      // Simulate AI generation stages
      for (let i = 0; i < stages.length; i++) {
        setCurrentStage(i);
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      // Build the combined generation prompt
      const combinedPrompt: CombinedGenerationPrompt = {
        description: description.trim(),
        storeType,
        style: selectedStyle,
        targetAudience: targetAudience.trim() || undefined,
        generateSite: generationTarget === 'site' || generationTarget === 'both',
        generateMobileApp: generationTarget === 'mobile' || generationTarget === 'both',
        mobileAppTypes: generationTarget !== 'site' ? selectedMobileApps : undefined,
      };

      // Store the prompt in session for the editors
      sessionStorage.setItem('combinedGenerationPrompt', JSON.stringify(combinedPrompt));

      // Also store individual prompts for backward compatibility
      if (combinedPrompt.generateSite) {
        const storefrontPrompt: AIGenerationPrompt = {
          description: description.trim(),
          storeType,
          style: selectedStyle as any,
          targetAudience: targetAudience.trim() || undefined,
        };
        sessionStorage.setItem('storefrontGenerationPrompt', JSON.stringify(storefrontPrompt));
      }

      if (combinedPrompt.generateMobileApp && combinedPrompt.mobileAppTypes) {
        sessionStorage.setItem(
          'mobileAppGenerationPrompt',
          JSON.stringify({
            description: description.trim(),
            storeType,
            style: selectedStyle,
            targetAudience: targetAudience.trim() || undefined,
            appTypes: combinedPrompt.mobileAppTypes,
          })
        );

        // Create and save default mobile config based on selected style (only if doesn't exist)
        try {
          // Check if config already exists
          const existingConfig = await api.getMobileAppConfig();

          if (!existingConfig?.config || Object.keys(existingConfig.config).length === 0) {
            // No config exists - create new one
            // Note: shopInfo is not included - backend fetches fresh shop data automatically
            const mobileConfig = createUnifiedMobileConfig(
              selectedStyle,
              shopId!,
              currentShop?.name || 'My Store'
            );

            // Save to database
            await api.createMobileAppConfig(mobileConfig);
          } else {
            // Config already exists - skip creation to preserve customizations
          }
        } catch (error) {
          console.error('Failed to create mobile app config:', error);
          // Continue anyway - user can configure manually in editor
        }
      }

      // Navigate based on generation target
      if (generationTarget === 'site') {
        navigate(`/shop/${shopId}/vendor/storefront-builder/editor`);
      } else if (generationTarget === 'mobile') {
        navigate(`/shop/${shopId}/vendor/mobile-app-builder/editor`);
      } else {
        // For 'both', go to a combined view or the site builder first
        navigate(`/shop/${shopId}/vendor/storefront-builder/editor?includeMobile=true`);
      }
    } catch (error) {
      console.error('Generation failed:', error);
      setIsGenerating(false);
    }
  };

  // Use suggestion
  const useSuggestion = (suggestion: string) => {
    setDescription(suggestion);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  // Skip AI generation
  const handleSkip = () => {
    if (generationTarget === 'mobile') {
      navigate(`/shop/${shopId}/vendor/mobile-app-builder/editor`);
    } else {
      navigate(`/shop/${shopId}/vendor/storefront-builder/editor`);
    }
  };

  const stages = getGenerationStages();

  // Generating overlay - stays within vendor layout
  if (isGenerating) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-white flex items-center justify-center">
        <div className="max-w-md w-full mx-4 text-center">
          {/* Animated orb */}
          <motion.div
            className="w-32 h-32 mx-auto mb-8 relative"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-lime via-emerald-500 to-cyan-500 opacity-20 blur-xl" />
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary-lime to-emerald-500 flex items-center justify-center">
              <Wand2 className="w-10 h-10 text-white" />
            </div>
          </motion.div>

          {/* Progress stages */}
          <div className="space-y-4 mb-8">
            {stages.map((stage, index) => (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: index <= currentStage ? 1 : 0.3,
                  x: 0,
                }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-3 ${
                  index === currentStage
                    ? 'text-primary-lime'
                    : index < currentStage
                    ? 'text-slate-900'
                    : 'text-slate-400'
                }`}
              >
                {index < currentStage ? (
                  <CheckCircle className="w-5 h-5 text-primary-lime" />
                ) : index === currentStage ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-current" />
                )}
                <span className="text-sm font-medium">{stage.label}</span>
              </motion.div>
            ))}
          </div>

          <p className="text-slate-500 text-sm">
            {generationTarget === 'site'
              ? 'AI is designing your perfect storefront...'
              : generationTarget === 'mobile'
              ? 'AI is designing your perfect mobile app...'
              : 'AI is designing your complete store experience...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-lime to-emerald-500 flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">AI Store Builder</h1>
              <p className="text-sm text-slate-500">{currentShop?.name || 'Your Store'}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            Skip AI, build manually
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-lime/10 border border-primary-lime/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary-lime" />
            <span className="text-sm font-medium text-slate-700">{t('vendor.aiPrompt.poweredByAI', { defaultValue: 'Powered by AI' })}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {t('vendor.aiPrompt.describeDreamStore', { defaultValue: 'Describe Your Dream Store' })}
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            {t('vendor.aiPrompt.tellUsAboutStore', { defaultValue: "Tell us about your store and we'll create a beautiful website and mobile apps for you." })}
          </p>
        </motion.div>

        {/* Generation Target Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Layout className="w-5 h-5 text-primary-lime" />
            {t('vendor.aiPrompt.whatToGenerate', { defaultValue: 'What do you want to generate?' })}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {GENERATION_TARGET_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => setGenerationTarget(option.id as GenerationTarget)}
                className={`relative p-4 rounded-xl border-2 transition-all text-center ${
                  generationTarget === option.id
                    ? 'border-primary-lime bg-primary-lime/10'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {generationTarget === option.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary-lime flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                )}
                <option.icon className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <div className="font-medium text-slate-900 text-sm">{option.name}</div>
                <div className="text-xs text-slate-500 mt-1">{option.description}</div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Mobile App Type Selection (shown when mobile is selected) */}
        <AnimatePresence>
          {(generationTarget === 'mobile' || generationTarget === 'both') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-primary-lime" />
                {t('vendor.aiPrompt.selectMobileAppPanels', { defaultValue: 'Select Mobile App Panels' })}
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {MOBILE_APP_TYPE_OPTIONS.map((option) => (
                  <div
                    key={option.id}
                    className={`relative p-4 rounded-xl border-2 cursor-not-allowed text-left ${
                      selectedMobileApps.includes(option.id as MobileAppType)
                        ? 'border-primary-lime bg-primary-lime/10'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    {selectedMobileApps.includes(option.id as MobileAppType) && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary-lime flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <option.icon className="w-8 h-8 mb-2 text-slate-600" />
                    <div className="font-medium text-slate-900">{option.name}</div>
                    <div className="text-sm text-slate-500">{option.description}</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {t('vendor.aiPrompt.allPanelsIncluded', { defaultValue: 'All panels are included (cannot be deselected)' })}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Description Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <textarea
              ref={textareaRef}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setShowSuggestions(false);
              }}
              placeholder={t('vendor.placeholders.aiPrompt')}
              className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 text-lg resize-none focus:outline-none min-h-[120px]"
              rows={4}
            />
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleVoiceInput}
                  className={`p-2 rounded-lg transition-colors ${
                    isListening
                      ? 'bg-red-100 text-red-500'
                      : 'bg-slate-100 text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                {isListening && (
                  <span className="text-sm text-red-500 animate-pulse">{t('vendor.aiPrompt.listening', { defaultValue: 'Listening...' })}</span>
                )}
              </div>
              <span className="text-sm text-slate-400">{description.length}/500</span>
            </div>
          </div>

          {/* Suggestions */}
          <AnimatePresence>
            {showSuggestions && !description && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-slate-500">{t('vendor.aiPrompt.trySuggestions', { defaultValue: 'Try these suggestions:' })}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => useSuggestion(suggestion)}
                      className="px-4 py-2 rounded-full bg-white border border-slate-200 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition-all"
                    >
                      {suggestion.length > 60 ? `${suggestion.slice(0, 60)}...` : suggestion}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Style Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary-lime" />
            {t('vendor.aiPrompt.chooseStyle', { defaultValue: 'Choose a Style' })}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {STYLE_OPTIONS.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                  selectedStyle === style.id
                    ? 'border-primary-lime bg-primary-lime/10'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {selectedStyle === style.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary-lime flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                )}
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${style.color} flex items-center justify-center mb-3`}
                >
                  <style.icon className="w-5 h-5 text-white" />
                </div>
                <div className="font-medium text-slate-900">{style.name}</div>
                <div className="text-sm text-slate-500">{style.description}</div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Target Audience (Optional) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-lime" />
            {t('vendor.aiPrompt.targetAudience', { defaultValue: 'Target Audience' })}
            <span className="text-sm font-normal text-slate-400">({t('common.optional', { defaultValue: 'Optional' })})</span>
          </h3>
          <input
            type="text"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder={t('vendor.aiPrompt.targetAudiencePlaceholder', { defaultValue: 'e.g., Young professionals aged 25-35, fashion-conscious, urban' })}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary-lime/50"
          />
        </motion.div>

        {/* Generate Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              onClick={handleGenerate}
              disabled={!description.trim()}
              className="bg-gradient-to-r from-primary-lime to-emerald-500 hover:from-primary-lime/90 hover:to-emerald-500/90 text-white px-12 py-6 text-lg font-semibold shadow-lg shadow-primary-lime/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Wand2 className="w-5 h-5 mr-2" />
              {generationTarget === 'site'
                ? t('vendor.aiPrompt.generateStorefront', { defaultValue: 'Generate My Storefront' })
                : generationTarget === 'mobile'
                ? t('vendor.aiPrompt.generateMobileApp', { defaultValue: 'Generate My Mobile App' })
                : t('vendor.aiPrompt.generateStore', { defaultValue: 'Generate My Store' })}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            {/* Edit Mobile App Button - Only show when mobile selected and config exists */}
            {generationTarget === 'mobile' && hasMobileConfig && (
              <Button
                onClick={() => navigate(`/shop/${shopId}/vendor/mobile-app-builder/editor`)}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-10 py-6 text-lg font-semibold shadow-lg shadow-blue-500/30"
              >
                <Edit3 className="w-5 h-5 mr-2" />
                {t('vendor.aiPrompt.editExistingApp', { defaultValue: 'Edit Existing App' })}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )}
          </div>
          <p className="mt-4 text-sm text-slate-500">
            {generationTarget === 'mobile' && hasMobileConfig
              ? t('vendor.aiPrompt.generateOrEdit', { defaultValue: 'Generate a new configuration or edit your existing one.' })
              : t('vendor.aiPrompt.takesAbout', { defaultValue: `Takes about ${generationTarget === 'both' ? '60' : '30'} seconds. You can customize everything after.`, seconds: generationTarget === 'both' ? '60' : '30' })}
          </p>

          {/* Summary of what will be generated */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {(generationTarget === 'site' || generationTarget === 'both') && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-sm">
                <Monitor className="w-4 h-4" />
                {t('vendor.aiPrompt.website', { defaultValue: 'Website' })}
              </span>
            )}
            {(generationTarget === 'mobile' || generationTarget === 'both') &&
              selectedMobileApps.includes('customer') && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 text-sm">
                  <ShoppingBag className="w-4 h-4" />
                  {t('vendor.aiPrompt.customerPanel', { defaultValue: 'Customer Panel' })}
                </span>
              )}
            {(generationTarget === 'mobile' || generationTarget === 'both') &&
              selectedMobileApps.includes('vendor') && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-600 text-sm">
                  <Store className="w-4 h-4" />
                  {t('vendor.aiPrompt.vendorPanel', { defaultValue: 'Vendor Panel' })}
                </span>
              )}
            {(generationTarget === 'mobile' || generationTarget === 'both') &&
              selectedMobileApps.includes('delivery') && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-600 text-sm">
                  <Truck className="w-4 h-4" />
                  {t('vendor.aiPrompt.deliveryPanel', { defaultValue: 'Delivery Panel' })}
                </span>
              )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default AIPromptPage;
