import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useInView } from 'framer-motion';
import {
  Award,
  Heart,
  Lightbulb,
  Users,
  ShoppingBag,
  Headphones,
  Truck,
  ShieldCheck,
  ArrowRight,
  Mail,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BreadcrumbNavigation } from '@/components/layout/BreadcrumbNavigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ValueCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  delay: number;
}

interface StatProps {
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
  delay: number;
}


interface PlatformFeatureProps {
  icon: React.ElementType;
  title: string;
  description: string;
  delay: number;
}

const AnimatedCounter: React.FC<{ value: number; duration?: number }> = ({
  value,
  duration = 2
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let startTime: number | null = null;
      const animate = (currentTime: number) => {
        if (startTime === null) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / (duration * 1000), 1);

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(easeOutQuart * value));

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(value);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [isInView, value, duration]);

  return <span ref={ref}>{count}</span>;
};

const ValueCard: React.FC<ValueCardProps> = ({ icon: Icon, title, description, delay }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay }}
    >
      <Card className="p-8 h-full hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary-lime group">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-lime to-accent-blue rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-3">{title}</h3>
          <p className="text-text-secondary leading-relaxed">{description}</p>
        </div>
      </Card>
    </motion.div>
  );
};

const StatCard: React.FC<StatProps> = ({ value, label, suffix = '', prefix = '', delay }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5, delay }}
      className="text-center"
    >
      <div className="text-5xl md:text-6xl font-bold text-white mb-2">
        {prefix}
        <AnimatedCounter value={value} />
        {suffix}
      </div>
      <div className="text-lg text-white/80 font-medium">{label}</div>
    </motion.div>
  );
};


const PlatformFeature: React.FC<PlatformFeatureProps> = ({
  icon: Icon,
  title,
  description,
  delay
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
      transition={{ duration: 0.5, delay }}
      className="flex gap-4"
    >
      <div className="flex-shrink-0">
        <div className="w-12 h-12 bg-primary-lime/10 rounded-full flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary-lime" />
        </div>
      </div>
      <div>
        <h4 className="text-lg font-bold text-text-primary mb-2">{title}</h4>
        <p className="text-text-secondary leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
};

export const AboutPage: React.FC = () => {
  const { t } = useTranslation();
  const heroRef = useRef<HTMLDivElement>(null);
  const isHeroInView = useInView(heroRef, { once: true });

  const values = [
    {
      icon: ShieldCheck,
      title: t('about.values.qualityFirst.title'),
      description: t('about.values.qualityFirst.description')
    },
    {
      icon: Lightbulb,
      title: t('about.values.sustainability.title'),
      description: t('about.values.sustainability.description')
    },
    {
      icon: Heart,
      title: t('about.values.customerObsession.title'),
      description: t('about.values.customerObsession.description')
    },
    {
      icon: Sparkles,
      title: t('about.values.innovation.title'),
      description: t('about.values.innovation.description')
    }
  ];

  const stats = [
    { value: 1, label: t('about.stats.happyCustomers'), suffix: "M+", prefix: "", delay: 0 },
    { value: 50, label: t('about.stats.products'), suffix: "K+", prefix: "", delay: 0.1 },
    { value: 100, label: t('about.stats.brands'), suffix: "+", prefix: "", delay: 0.2 },
    { value: 24, label: t('about.stats.support'), suffix: "/7", prefix: "", delay: 0.3 },
  ];

  // Team section removed - platform operated by company

  const platformFeatures = [
    {
      icon: Truck,
      title: t('about.sustainability.carbonNeutralShipping.title'),
      description: t('about.sustainability.carbonNeutralShipping.description')
    },
    {
      icon: Sparkles,
      title: t('about.sustainability.recyclablePackaging.title'),
      description: t('about.sustainability.recyclablePackaging.description')
    },
    {
      icon: ShieldCheck,
      title: t('about.sustainability.ethicalSourcing.title'),
      description: t('about.sustainability.ethicalSourcing.description')
    },
    {
      icon: TrendingUp,
      title: t('about.sustainability.sustainableMaterials.title'),
      description: t('about.sustainability.sustainableMaterials.description')
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 pt-4">
        <BreadcrumbNavigation
          items={[
            { label: t('about.aboutUs') }
          ]}
        />
      </div>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-gradient-to-br from-primary-lime via-accent-blue to-primary-lime-dark py-20 md:py-32"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
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
              ease: "linear"
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
                <span className="text-white font-medium">{t('about.hero.established')}</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6"
            >
              {t('about.hero.title')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-white/90 leading-relaxed mb-8"
            >
              {t('about.hero.subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/vendor/create-shop">
                <Button size="lg" className="bg-white text-primary-lime hover:bg-gray-100 shadow-xl">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  {t('about.hero.shopNow')}
                </Button>
              </Link>
              <Link to="/contact">
                <Button
                  size="lg"
                  className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-primary-lime shadow-xl"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  {t('about.hero.getInTouch')}
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

      </section>

      {/* Our Mission Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary-lime/10 rounded-full px-4 py-2 mb-6">
                <Target className="w-5 h-5 text-primary-lime" />
                <span className="text-primary-lime font-semibold">{t('about.story.badge')}</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-8">
                {t('about.story.title')}
              </h2>

              <div className="space-y-6 text-lg text-text-secondary leading-relaxed text-left md:text-center">
                <p>{t('about.story.p1')}</p>
                <p>{t('about.story.p2')}</p>
              </div>

              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="w-12 h-12 bg-primary-lime/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-6 h-6 text-primary-lime" />
                  </div>
                  <h3 className="font-bold text-text-primary mb-2">{t('about.story.growingFast')}</h3>
                  <p className="text-sm text-text-secondary">Empowering businesses to scale globally</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="w-12 h-12 bg-accent-blue/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-accent-blue" />
                  </div>
                  <h3 className="font-bold text-text-primary mb-2">{t('about.story.customerFocused')}</h3>
                  <p className="text-sm text-text-secondary">Building tools that merchants love</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="font-bold text-text-primary mb-2">{t('about.story.innovationDriven')}</h3>
                  <p className="text-sm text-text-secondary">AI-powered tools for modern commerce</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 bg-primary-lime/10 rounded-full px-4 py-2 mb-6">
                <Heart className="w-5 h-5 text-primary-lime" />
                <span className="text-primary-lime font-semibold">{t('about.values.badge')}</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
                {t('about.values.title')}
              </h2>
              <p className="text-xl text-text-secondary max-w-3xl mx-auto">
                {t('about.values.subtitle')}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <ValueCard
                  key={value.title}
                  icon={value.icon}
                  title={value.title}
                  description={value.description}
                  delay={index * 0.1}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary-lime to-accent-blue relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {t('about.stats.title')}
              </h2>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                {t('about.stats.subtitle')}
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {stats.map((stat) => (
                <StatCard
                  key={stat.label}
                  value={stat.value}
                  label={stat.label}
                  suffix={stat.suffix}
                  prefix={stat.prefix}
                  delay={stat.delay}
                />
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* Platform Features Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-primary-lime/5 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 bg-primary-lime/10 rounded-full px-4 py-2 mb-6">
                  <Sparkles className="w-5 h-5 text-primary-lime" />
                  <span className="text-primary-lime font-semibold">{t('about.sustainability.badge')}</span>
                </div>

                <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
                  {t('about.sustainability.title')}
                </h2>

                <p className="text-lg text-text-secondary leading-relaxed mb-8">
                  {t('about.sustainability.description')}
                </p>

                <div className="space-y-6">
                  {platformFeatures.map((feature, index) => (
                    <PlatformFeature
                      key={feature.title}
                      icon={feature.icon}
                      title={feature.title}
                      description={feature.description}
                      delay={index * 0.1}
                    />
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="mt-8 p-6 bg-white rounded-2xl shadow-lg border-2 border-primary-lime/20"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary-lime rounded-full flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-text-primary mb-2">{t('about.sustainability.carbonNeutralCertified.title')}</h4>
                      <p className="text-text-secondary text-sm">
                        {t('about.sustainability.carbonNeutralCertified.description')}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=1000&fit=crop"
                  alt={t('about.sustainability.imageAlt')}
                  className="rounded-3xl shadow-2xl w-full h-auto"
                />

                {/* Floating platform badge */}
                <motion.div
                  animate={{
                    y: [0, -15, 0],
                    rotate: [0, 5, 0, -5, 0]
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-6"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-primary-lime rounded-full flex items-center justify-center mb-3">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-text-primary">All-in-One</div>
                    <div className="text-sm text-text-secondary text-center">{t('about.sustainability.ecoFriendlyPackaging')}</div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Animated background */}
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear"
          }}
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, #84cc16 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary-lime/20 rounded-full px-6 py-2 mb-6">
                <Sparkles className="w-5 h-5 text-primary-lime" />
                <span className="text-primary-lime font-semibold">{t('about.cta.badge')}</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {t('about.cta.title')}
              </h2>

              <p className="text-xl text-gray-300 mb-12 leading-relaxed">
                {t('about.cta.description')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link to="/vendor/create-shop">
                  <Button size="lg" className="bg-primary-lime text-white hover:bg-primary-lime-dark shadow-xl group">
                    <ShoppingBag className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    {t('about.cta.startShopping')}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button
                    size="lg"
                    className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-slate-900 shadow-xl"
                  >
                    <Headphones className="w-5 h-5 mr-2" />
                    {t('about.cta.contactUs')}
                  </Button>
                </Link>
              </div>

              {/* Newsletter signup */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
              >
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Mail className="w-5 h-5 text-primary-lime" />
                  <h3 className="text-xl font-bold text-white">{t('about.cta.stayUpdated')}</h3>
                </div>
                <p className="text-gray-300 mb-6">
                  {t('about.cta.subscribeText')}
                </p>
                <form className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
                  <input
                    type="email"
                    placeholder={t('about.cta.emailPlaceholder')}
                    className="flex-1 px-4 py-3 rounded-lg border-2 border-white/20 bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime focus:border-transparent backdrop-blur-sm"
                    required
                  />
                  <Button
                    type="submit"
                    size="lg"
                    className="bg-primary-lime text-white hover:bg-primary-lime-dark"
                  >
                    {t('about.cta.subscribe')}
                  </Button>
                </form>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
