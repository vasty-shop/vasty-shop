import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Tag,
  TrendingUp,
  Users,
  ShoppingBag,
  Sparkles,
  Gift,
  Heart,
  ArrowRight,
  Filter,
  X,
  Search,
  Star,
  Zap,
  Award,
  Target,
  Bell,
  Check,
  ChevronRight,
  Package,
  Percent,
  Mail,
  Flame,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BreadcrumbNavigation } from '@/components/layout/BreadcrumbNavigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Types
interface Campaign {
  id: string;
  title: string;
  tagline: string;
  description: string;
  image: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'upcoming' | 'ended';
  category: 'fashion' | 'electronics' | 'home' | 'lifestyle' | 'seasonal' | 'eco';
  discount?: string;
  tags: string[];
  stats: {
    participants: string;
    products: string;
    savings: string;
  };
  featured?: boolean;
}

interface CategoryFilter {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface StatusFilter {
  id: 'all' | 'active' | 'upcoming' | 'ended';
  label: string;
  color: string;
}

interface Stat {
  icon: React.ElementType;
  value: string;
  label: string;
  color: string;
  delay: number;
}

// Fallback campaign data for when API fails
const fallbackCampaigns: Campaign[] = [
  {
    id: 'summer-fashion',
    title: 'Summer Fashion Festival',
    tagline: 'Elevate Your Summer Style',
    description: 'Discover the hottest summer trends with our curated collection of lightweight fabrics, vibrant colors, and timeless classics. From beachwear to evening looks.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=800&fit=crop',
    startDate: '2025-06-01',
    endDate: '2025-08-31',
    status: 'active',
    category: 'fashion',
    discount: 'Up to 40% OFF',
    tags: ['Fashion', 'Summer', 'Trending'],
    stats: {
      participants: '2.5M+',
      products: '15K+',
      savings: '$5M+',
    },
    featured: true,
  },
  {
    id: 'tech-week',
    title: 'Tech Week',
    tagline: 'Innovation at Your Fingertips',
    description: 'Upgrade your tech game with the latest gadgets, smart home devices, and cutting-edge electronics. Exclusive deals on premium brands.',
    image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1200&h=800&fit=crop',
    startDate: '2025-07-15',
    endDate: '2025-07-22',
    status: 'active',
    category: 'electronics',
    discount: 'Up to 50% OFF',
    tags: ['Electronics', 'Gadgets', 'Smart Home'],
    stats: {
      participants: '1.8M+',
      products: '8K+',
      savings: '$3M+',
    },
    featured: true,
  },
  {
    id: 'home-makeover',
    title: 'Home Makeover',
    tagline: 'Transform Your Living Space',
    description: 'Refresh your home with our stunning collection of furniture, decor, and essentials. Create the sanctuary you deserve with exclusive home deals.',
    image: 'https://images.unsplash.com/photo-1615873968403-89e068629265?w=1200&h=800&fit=crop',
    startDate: '2025-08-01',
    endDate: '2025-09-30',
    status: 'active',
    category: 'home',
    discount: 'Up to 35% OFF',
    tags: ['Home', 'Decor', 'Furniture'],
    stats: {
      participants: '1.2M+',
      products: '12K+',
      savings: '$2.5M+',
    },
    featured: false,
  },
  {
    id: 'back-to-school',
    title: 'Back to School',
    tagline: 'Gear Up for Success',
    description: 'Everything students need for a successful year. From backpacks and stationery to tech essentials and dorm room must-haves.',
    image: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=1200&h=800&fit=crop',
    startDate: '2025-08-15',
    endDate: '2025-09-15',
    status: 'upcoming',
    category: 'lifestyle',
    discount: 'Up to 30% OFF',
    tags: ['Education', 'Students', 'Essentials'],
    stats: {
      participants: '0',
      products: '10K+',
      savings: '0',
    },
    featured: true,
  },
  {
    id: 'holiday-gift-guide',
    title: 'Holiday Gift Guide',
    tagline: 'Find the Perfect Gift',
    description: 'Celebrate the season with our handpicked selection of gifts for everyone on your list. From thoughtful presents to luxury items.',
    image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1200&h=800&fit=crop',
    startDate: '2025-11-15',
    endDate: '2025-12-25',
    status: 'upcoming',
    category: 'seasonal',
    discount: 'Up to 45% OFF',
    tags: ['Gifts', 'Holiday', 'Celebration'],
    stats: {
      participants: '0',
      products: '20K+',
      savings: '0',
    },
    featured: true,
  },
  {
    id: 'sustainable-style',
    title: 'Sustainable Style',
    tagline: 'Fashion with a Conscience',
    description: 'Shop eco-friendly products that look good and do good. Sustainable materials, ethical manufacturing, and carbon-neutral shipping.',
    image: 'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=1200&h=800&fit=crop',
    startDate: '2025-04-22',
    endDate: '2025-05-22',
    status: 'ended',
    category: 'eco',
    discount: '25% OFF',
    tags: ['Eco-Friendly', 'Sustainable', 'Organic'],
    stats: {
      participants: '950K+',
      products: '5K+',
      savings: '$1.8M+',
    },
    featured: false,
  },
  {
    id: 'fitness-wellness',
    title: 'Fitness & Wellness',
    tagline: 'Your Journey to Better Health',
    description: 'Start your wellness journey with premium fitness gear, activewear, supplements, and recovery tools from top brands.',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&h=800&fit=crop',
    startDate: '2025-01-01',
    endDate: '2025-02-28',
    status: 'ended',
    category: 'lifestyle',
    discount: '30% OFF',
    tags: ['Fitness', 'Wellness', 'Health'],
    stats: {
      participants: '1.5M+',
      products: '7K+',
      savings: '$2.2M+',
    },
    featured: false,
  },
  {
    id: 'spring-refresh',
    title: 'Spring Refresh',
    tagline: 'Bloom into the New Season',
    description: 'Welcome spring with fresh styles, outdoor essentials, and home refresh items. Embrace the season of renewal with our curated collection.',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&h=800&fit=crop',
    startDate: '2025-03-01',
    endDate: '2025-04-30',
    status: 'ended',
    category: 'fashion',
    discount: '35% OFF',
    tags: ['Spring', 'Fashion', 'Outdoor'],
    stats: {
      participants: '2.1M+',
      products: '13K+',
      savings: '$4.2M+',
    },
    featured: false,
  },
];

// Filter Options
const categoryFilters: CategoryFilter[] = [
  { id: 'all', label: 'All Categories', icon: Sparkles },
  { id: 'fashion', label: 'Fashion', icon: ShoppingBag },
  { id: 'electronics', label: 'Electronics', icon: Zap },
  { id: 'home', label: 'Home & Living', icon: Package },
  { id: 'lifestyle', label: 'Lifestyle', icon: Heart },
  { id: 'seasonal', label: 'Seasonal', icon: Gift },
  { id: 'eco', label: 'Eco-Friendly', icon: Target },
];

const statusFilters: StatusFilter[] = [
  { id: 'all', label: 'All', color: 'bg-gray-100 text-gray-700' },
  { id: 'active', label: 'Active', color: 'bg-green-100 text-green-700' },
  { id: 'upcoming', label: 'Upcoming', color: 'bg-blue-100 text-blue-700' },
  { id: 'ended', label: 'Ended', color: 'bg-gray-100 text-gray-500' },
];

// How It Works Steps
const howItWorksSteps = [
  {
    icon: Search,
    title: 'Discover Campaigns',
    description: 'Browse through our active and upcoming campaigns featuring exclusive deals across various categories.',
  },
  {
    icon: Tag,
    title: 'Unlock Exclusive Deals',
    description: 'Access special discounts, limited-time offers, and exclusive products available only during campaigns.',
  },
  {
    icon: ShoppingBag,
    title: 'Shop & Save',
    description: 'Add campaign items to your cart and enjoy significant savings on premium products.',
  },
  {
    icon: Bell,
    title: 'Stay Updated',
    description: 'Subscribe to campaign alerts and never miss out on upcoming events and flash sales.',
  },
];

// Past Campaign Stats
const pastCampaignStats: Stat[] = [
  {
    icon: Users,
    value: '8M+',
    label: 'Total Participants',
    color: 'from-primary-lime to-green-400',
    delay: 0,
  },
  {
    icon: Package,
    value: '50K+',
    label: 'Products Featured',
    color: 'from-accent-blue to-blue-400',
    delay: 0.1,
  },
  {
    icon: TrendingUp,
    value: '$15M+',
    label: 'Customer Savings',
    color: 'from-orange-400 to-red-400',
    delay: 0.2,
  },
  {
    icon: Star,
    value: '4.8/5',
    label: 'Average Rating',
    color: 'from-yellow-400 to-orange-400',
    delay: 0.3,
  },
];

// Helper Functions
const getStatusBadge = (status: Campaign['status']) => {
  switch (status) {
    case 'active':
      return (
        <Badge className="bg-green-500 text-white hover:bg-green-600">
          <Flame className="w-3 h-3 mr-1" />
          Active Now
        </Badge>
      );
    case 'upcoming':
      return (
        <Badge className="bg-blue-500 text-white hover:bg-blue-600">
          <Clock className="w-3 h-3 mr-1" />
          Coming Soon
        </Badge>
      );
    case 'ended':
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
          Ended
        </Badge>
      );
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getDaysRemaining = (endDate: string) => {
  const today = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

// Components
interface CampaignCardProps {
  campaign: Campaign;
  index: number;
  isFeatured?: boolean;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, index, isFeatured = false }) => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const daysRemaining = getDaysRemaining(campaign.endDate);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(isFeatured ? 'lg:col-span-2' : '')}
    >
      <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary-lime h-full">
        {/* Campaign Image */}
        <div className={cn('relative overflow-hidden', isFeatured ? 'h-80 md:h-96' : 'h-64')}>
          <img
            src={campaign.image}
            alt={campaign.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Status Badge */}
          <div className="absolute top-4 left-4">
            {getStatusBadge(campaign.status)}
          </div>

          {/* Featured Badge */}
          {campaign.featured && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-primary-lime text-white hover:bg-primary-lime-dark">
                <Star className="w-3 h-3 mr-1 fill-current" />
                Featured
              </Badge>
            </div>
          )}

          {/* Discount Badge */}
          {campaign.discount && (
            <div className="absolute bottom-4 left-4">
              <div className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                {campaign.discount}
              </div>
            </div>
          )}

          {/* Campaign Title & Tagline */}
          <div className="absolute bottom-4 right-4 left-4 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-1">{campaign.title}</h3>
            <p className="text-sm md:text-base text-white/90">{campaign.tagline}</p>
          </div>
        </div>

        {/* Campaign Details */}
        <div className="p-6">
          {/* Description */}
          <p className="text-text-secondary mb-4 line-clamp-2">{campaign.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {campaign.tags.map((tag, idx) => (
              <Badge key={idx} variant="outline" className="text-xs text-gray-600 border-gray-300">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Campaign Dates */}
          <div className="flex items-center gap-4 mb-4 text-sm text-text-secondary">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(campaign.startDate)}</span>
            </div>
            <span>-</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(campaign.endDate)}</span>
            </div>
          </div>

          {/* Days Remaining (for active/upcoming) */}
          {campaign.status !== 'ended' && daysRemaining > 0 && (
            <div className="mb-4 p-3 bg-primary-lime/10 rounded-lg border border-primary-lime/30">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary">
                  {campaign.status === 'active' ? 'Ends in' : 'Starts in'}
                </span>
                <span className="text-lg font-bold text-primary-lime">
                  {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
                </span>
              </div>
            </div>
          )}

          {/* Campaign Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-text-primary">{campaign.stats.participants}</div>
              <div className="text-xs text-text-secondary">Participants</div>
            </div>
            <div className="text-center border-x border-gray-200">
              <div className="text-lg font-bold text-text-primary">{campaign.stats.products}</div>
              <div className="text-xs text-text-secondary">Products</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-text-primary">{campaign.stats.savings}</div>
              <div className="text-xs text-text-secondary">Saved</div>
            </div>
          </div>

          {/* CTA Button */}
          <Button className="w-full bg-primary-lime hover:bg-primary-lime-dark text-white group/btn">
            {campaign.status === 'ended' ? (
              <>
                <Award className="w-5 h-5 mr-2" />
                View Results
              </>
            ) : (
              <>
                <ShoppingBag className="w-5 h-5 mr-2" />
                Shop Campaign
                <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

const StatCard: React.FC<Stat> = ({ icon: Icon, value, label, color, delay }) => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5, delay }}
      className="text-center"
    >
      <div className={cn('inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br mb-4', color)}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <div className="text-4xl md:text-5xl font-bold text-white mb-2">{value}</div>
      <div className="text-gray-300 font-medium">{label}</div>
    </motion.div>
  );
};

// Main Component
export const CampaignPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'upcoming' | 'ended'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [emailSubscription, setEmailSubscription] = useState('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const isHeroInView = useInView(heroRef, { once: true });

  // Fetch campaigns from API
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await api.getCampaigns();

        // Map API data to component format
        const mappedCampaigns: Campaign[] = (data.data || data).map((camp: any) => ({
          id: camp.id || camp._id,
          title: camp.title || camp.name || 'Campaign',
          tagline: camp.tagline || camp.subtitle || '',
          description: camp.description || '',
          image: camp.image || camp.imageUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop',
          startDate: camp.startDate || camp.start_date || new Date().toISOString(),
          endDate: camp.endDate || camp.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: camp.status || 'active',
          category: camp.category || 'lifestyle',
          discount: camp.discount || camp.discountText || '',
          tags: camp.tags || [],
          stats: {
            participants: camp.stats?.participants || camp.participantCount || '0',
            products: camp.stats?.products || camp.productCount || '0',
            savings: camp.stats?.savings || camp.totalSavings || '0',
          },
          featured: camp.featured || camp.isFeatured || false,
        }));

        setCampaigns(mappedCampaigns);
      } catch (err: any) {
        console.error('Failed to fetch campaigns:', err);
        setError('Failed to load campaigns');
        // Use fallback data
        setCampaigns(fallbackCampaigns);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  // Filter Campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      const matchesCategory = selectedCategory === 'all' || campaign.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || campaign.status === selectedStatus;
      const matchesSearch =
        searchQuery === '' ||
        campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [selectedCategory, selectedStatus, searchQuery]);

  // Separate featured and regular campaigns
  const featuredCampaigns = filteredCampaigns.filter(c => c.featured && c.status !== 'ended');
  const regularCampaigns = filteredCampaigns.filter(c => !c.featured || c.status === 'ended');

  // Handle subscription
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailSubscription.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      // TODO: Implement actual subscription API call
      // await api.subscribe({ email: emailSubscription, type: 'campaigns' });

      toast.success('Successfully Subscribed!', {
        description: "You'll receive updates about our latest campaigns",
      });

      setEmailSubscription('');
    } catch (error: any) {
      toast.error('Subscription Failed', {
        description: error?.response?.data?.message || 'Please try again later',
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 pt-4">
        <BreadcrumbNavigation items={[{ label: 'Campaigns' }]} />
      </div>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-gradient-to-br from-primary-lime via-green-400 to-accent-blue py-20 md:py-32"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
                <Sparkles className="w-5 h-5 text-white" />
                <span className="text-white font-medium">Marketing Campaigns</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6"
            >
              Our Campaigns
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-white/90 leading-relaxed mb-8"
            >
              Discover exclusive deals and curated collections through our exciting marketing campaigns
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                className="bg-white text-primary-lime hover:bg-gray-100 shadow-xl"
                onClick={() => {
                  document.getElementById('active-campaigns')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Flame className="w-5 h-5 mr-2" />
                View Active Campaigns
              </Button>
              <Button
                size="lg"
                className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-primary-lime shadow-xl"
                onClick={() => {
                  document.getElementById('subscribe-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Bell className="w-5 h-5 mr-2" />
                Get Notified
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Search & Filters Section */}
      <section className="py-8 bg-gray-50 border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm bg-gray-50/95">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder={t('vendor.placeholders.searchCampaigns')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-10 h-12"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="space-y-4">
              {/* Category Filters */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="w-4 h-4 text-text-secondary" />
                  <span className="text-sm font-medium text-text-secondary">Category</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categoryFilters.map((filter) => {
                    const Icon = filter.icon;
                    return (
                      <button
                        key={filter.id}
                        onClick={() => setSelectedCategory(filter.id)}
                        className={cn(
                          'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all border-2',
                          selectedCategory === filter.id
                            ? 'bg-primary-lime text-white border-primary-lime shadow-md'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-primary-lime'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {filter.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status Filters */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-text-secondary" />
                  <span className="text-sm font-medium text-text-secondary">Status</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {statusFilters.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setSelectedStatus(filter.id)}
                      className={cn(
                        'px-4 py-2 rounded-lg font-medium text-sm transition-all border-2',
                        selectedStatus === filter.id
                          ? 'bg-primary-lime text-white border-primary-lime shadow-md'
                          : cn('border-gray-200 hover:border-primary-lime', filter.color)
                      )}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Filters Count */}
              {(selectedCategory !== 'all' || selectedStatus !== 'all' || searchQuery) && (
                <div className="flex items-center justify-between p-3 bg-primary-lime/10 rounded-lg border border-primary-lime/30">
                  <span className="text-sm font-medium text-text-primary">
                    Showing {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedStatus('all');
                      setSearchQuery('');
                    }}
                    className="text-sm text-primary-lime hover:text-primary-lime-dark font-medium flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Clear All
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="animate-pulse">
                <div className="h-8 w-32 bg-gray-200 rounded-full mx-auto mb-6" />
                <div className="h-12 w-96 bg-gray-200 rounded mx-auto mb-6" />
                <div className="h-6 w-64 bg-gray-200 rounded mx-auto" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg h-96" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Error State */}
      {error && !loading && campaigns.length === 0 && (
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-lg mx-auto">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-2xl font-bold text-text-primary mb-3">Unable to Load Campaigns</h3>
              <p className="text-text-secondary mb-6">{error}</p>
              <Button onClick={() => window.location.reload()} className="bg-primary-lime hover:bg-primary-lime-dark">
                Retry
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Featured Campaigns */}
      {!loading && featuredCampaigns.length > 0 && (
        <section id="active-campaigns" className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 bg-primary-lime/10 rounded-full px-4 py-2 mb-6">
                <Star className="w-5 h-5 text-primary-lime fill-current" />
                <span className="text-primary-lime font-semibold">Featured</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">Featured Campaigns</h2>
              <p className="text-xl text-text-secondary max-w-3xl mx-auto">
                Don't miss out on our most popular campaigns with exclusive deals and limited-time offers
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto">
              {featuredCampaigns.map((campaign, index) => (
                <CampaignCard key={campaign.id} campaign={campaign} index={index} isFeatured />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Campaigns */}
      {!loading && regularCampaigns.length > 0 && (
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">All Campaigns</h2>
              <p className="text-xl text-text-secondary max-w-3xl mx-auto">
                Browse through all our campaigns and find the perfect deals for you
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {regularCampaigns.map((campaign, index) => (
                <CampaignCard key={campaign.id} campaign={campaign} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* No Results */}
      {!loading && filteredCampaigns.length === 0 && (
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center max-w-lg mx-auto"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-3">No Campaigns Found</h3>
              <p className="text-text-secondary mb-6">
                We couldn't find any campaigns matching your filters. Try adjusting your search or filters.
              </p>
              <Button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedStatus('all');
                  setSearchQuery('');
                }}
                className="bg-primary-lime hover:bg-primary-lime-dark"
              >
                Clear Filters
              </Button>
            </motion.div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-accent-blue/10 rounded-full px-4 py-2 mb-6">
              <Target className="w-5 h-5 text-accent-blue" />
              <span className="text-accent-blue font-semibold">How It Works</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
              Participate in Campaigns
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Follow these simple steps to take advantage of our exclusive campaign deals
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {howItWorksSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="p-8 h-full text-center hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary-lime group">
                    <div className="relative mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-lime to-accent-blue rounded-2xl group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-lime text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-3">{step.title}</h3>
                    <p className="text-text-secondary leading-relaxed">{step.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 max-w-4xl mx-auto"
          >
            <Card className="p-8 bg-gradient-to-br from-primary-lime/5 to-accent-blue/5 border-2 border-primary-lime/20">
              <h3 className="text-2xl font-bold text-text-primary mb-6 text-center">
                Campaign Benefits
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary-lime rounded-full flex items-center justify-center mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary mb-1">Exclusive Discounts</h4>
                    <p className="text-sm text-text-secondary">
                      Access special pricing available only during campaign periods
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary-lime rounded-full flex items-center justify-center mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary mb-1">Curated Collections</h4>
                    <p className="text-sm text-text-secondary">
                      Handpicked products from top brands in each category
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary-lime rounded-full flex items-center justify-center mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary mb-1">Limited Time Offers</h4>
                    <p className="text-sm text-text-secondary">
                      Don't miss flash sales and time-sensitive deals
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary-lime rounded-full flex items-center justify-center mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary mb-1">Early Access</h4>
                    <p className="text-sm text-text-secondary">
                      Subscribers get notified before campaigns go live
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Past Campaigns Stats Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-primary-lime/20 rounded-full px-4 py-2 mb-6">
              <TrendingUp className="w-5 h-5 text-primary-lime" />
              <span className="text-primary-lime font-semibold">Our Impact</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Past Campaign Success
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Join millions of satisfied customers who have saved big through our campaigns
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-6xl mx-auto">
            {pastCampaignStats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          {/* Past Campaigns Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 max-w-5xl mx-auto"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
              Previous Successful Campaigns
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {campaigns
                .filter(c => c.status === 'ended')
                .slice(0, 4)
                .map((campaign, index) => (
                  <motion.div
                    key={campaign.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group cursor-pointer"
                  >
                    <div className="relative rounded-xl overflow-hidden aspect-square">
                      <img
                        src={campaign.image}
                        alt={campaign.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <p className="text-white font-bold text-sm">{campaign.title}</p>
                          <p className="text-white/80 text-xs">{campaign.stats.participants} participants</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Subscribe Section */}
      <section id="subscribe-section" className="py-20 md:py-32 bg-gradient-to-br from-primary-lime via-green-400 to-accent-blue relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <Bell className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Never Miss a Campaign
            </h2>

            <p className="text-xl text-white/90 mb-12 leading-relaxed">
              Subscribe to receive exclusive notifications about upcoming campaigns, early access to deals, and special member-only offers
            </p>

            {/* Subscription Form */}
            <form onSubmit={handleSubscribe} className="max-w-xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder={t('common.placeholders.enterEmail')}
                    value={emailSubscription}
                    onChange={(e) => setEmailSubscription(e.target.value)}
                    className="pl-12 h-14 text-base border-2 border-white/30 bg-white/90 focus:bg-white"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="bg-slate-900 text-white hover:bg-slate-800 h-14 px-8 shadow-xl"
                >
                  <Bell className="w-5 h-5 mr-2" />
                  Subscribe Now
                </Button>
              </div>
            </form>

            {/* Benefits List */}
            <div className="mt-12 grid sm:grid-cols-3 gap-6 text-white">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                  <Zap className="w-6 h-6" />
                </div>
                <h4 className="font-bold mb-1">Early Access</h4>
                <p className="text-sm text-white/80">Be the first to know</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                  <Percent className="w-6 h-6" />
                </div>
                <h4 className="font-bold mb-1">Exclusive Deals</h4>
                <p className="text-sm text-white/80">Member-only offers</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                  <Gift className="w-6 h-6" />
                </div>
                <h4 className="font-bold mb-1">Special Perks</h4>
                <p className="text-sm text-white/80">Bonus rewards</p>
              </div>
            </div>

            <p className="mt-8 text-sm text-white/70">
              By subscribing, you agree to receive campaign updates and promotional emails. Unsubscribe anytime.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
              Ready to Start Shopping?
            </h2>
            <p className="text-xl text-text-secondary mb-12 leading-relaxed">
              Explore our active campaigns and discover incredible deals on premium products
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <Button size="lg" className="bg-primary-lime hover:bg-primary-lime-dark shadow-xl group">
                  <ShoppingBag className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Browse All Products
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/categories">
                <Button
                  size="lg"
                  className="border-2 border-gray-300 bg-white text-gray-700 hover:border-primary-lime hover:text-primary-lime shadow-xl"
                >
                  <Tag className="w-5 h-5 mr-2" />
                  Shop by Category
                </Button>
              </Link>
            </div>

            {/* Quick Links */}
            <div className="mt-16 grid sm:grid-cols-3 gap-6">
              <Link to="/faq" className="group">
                <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary-lime">
                  <div className="w-12 h-12 bg-primary-lime/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-lime group-hover:scale-110 transition-all duration-300">
                    <Award className="w-6 h-6 text-primary-lime group-hover:text-white" />
                  </div>
                  <h3 className="font-bold text-text-primary mb-2">Campaign FAQ</h3>
                  <p className="text-sm text-text-secondary">Learn more about how campaigns work</p>
                  <div className="flex items-center justify-center gap-1 mt-4 text-primary-lime font-medium text-sm">
                    <span>Learn More</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </Link>

              <Link to="/contact" className="group">
                <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary-lime">
                  <div className="w-12 h-12 bg-accent-blue/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent-blue group-hover:scale-110 transition-all duration-300">
                    <Mail className="w-6 h-6 text-accent-blue group-hover:text-white" />
                  </div>
                  <h3 className="font-bold text-text-primary mb-2">Contact Support</h3>
                  <p className="text-sm text-text-secondary">Have questions? We're here to help</p>
                  <div className="flex items-center justify-center gap-1 mt-4 text-accent-blue font-medium text-sm">
                    <span>Get Help</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </Link>

              <Link to="/about" className="group">
                <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary-lime">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-500 group-hover:scale-110 transition-all duration-300">
                    <Target className="w-6 h-6 text-orange-500 group-hover:text-white" />
                  </div>
                  <h3 className="font-bold text-text-primary mb-2">About Vasty</h3>
                  <p className="text-sm text-text-secondary">Discover our story and mission</p>
                  <div className="flex items-center justify-center gap-1 mt-4 text-orange-500 font-medium text-sm">
                    <span>Read More</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CampaignPage;
