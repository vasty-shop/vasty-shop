import React from 'react';
import { Link } from 'react-router-dom';
import {
  Download,
  Mail,
  Newspaper,
  Store,
  Smartphone,
  Truck,
  CreditCard,
  Sparkles,
  Users,
  Globe,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BreadcrumbNavigation } from '@/components/layout/BreadcrumbNavigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const PressPage: React.FC = () => {
  const breadcrumbItems = [
    { label: 'Company', href: '/about' },
    { label: 'Press' },
  ];

  const platformFeatures = [
    {
      icon: Store,
      title: 'Multi-Vendor Marketplace',
      description: 'Enable multiple vendors to create and manage their own stores on a single platform.'
    },
    {
      icon: Sparkles,
      title: 'AI Store Builder',
      description: 'Create professional storefronts in minutes with AI-powered design and content generation.'
    },
    {
      icon: Smartphone,
      title: 'Mobile App Builder',
      description: 'Turn any store into a native mobile app for iOS and Android with one click.'
    },
    {
      icon: Truck,
      title: 'Delivery Management',
      description: 'Integrated delivery partner network with real-time tracking and route optimization.'
    },
    {
      icon: CreditCard,
      title: 'Secure Payments',
      description: 'PCI-compliant payment processing with support for multiple currencies and methods.'
    },
    {
      icon: ShieldCheck,
      title: 'Enterprise Security',
      description: 'Bank-grade security with SSL encryption, 2FA, and regular security audits.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <div className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <BreadcrumbNavigation items={breadcrumbItems} />
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-lime/20 rounded-full mb-6">
              <Newspaper className="w-8 h-8 text-primary-lime" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Press & Media</h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Everything you need to know about Vasty for your next story
            </p>
          </div>
        </div>
      </section>

      <div className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">

            {/* About Vasty */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">About Vasty</h2>
              <Card className="p-8 bg-gradient-to-br from-primary-lime/5 to-white border-primary-lime/20">
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  Vasty is an all-in-one e-commerce platform that enables entrepreneurs to create, launch, and scale their online businesses.
                  Our platform combines AI-powered store building, multi-vendor marketplace capabilities, integrated payments, and delivery management into a single, easy-to-use solution.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Whether you're a first-time seller or an established brand, Vasty provides the tools and infrastructure needed to succeed in modern e-commerce—no technical expertise required.
                </p>
              </Card>
            </section>

            {/* Quick Stats */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Platform Highlights</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-6 text-center bg-gray-50">
                  <Globe className="w-8 h-8 text-primary-lime mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900">Global</div>
                  <p className="text-sm text-gray-600">Reach</p>
                </Card>
                <Card className="p-6 text-center bg-gray-50">
                  <Store className="w-8 h-8 text-primary-lime mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900">Multi-Vendor</div>
                  <p className="text-sm text-gray-600">Platform</p>
                </Card>
                <Card className="p-6 text-center bg-gray-50">
                  <Sparkles className="w-8 h-8 text-primary-lime mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900">AI-Powered</div>
                  <p className="text-sm text-gray-600">Tools</p>
                </Card>
                <Card className="p-6 text-center bg-gray-50">
                  <Users className="w-8 h-8 text-primary-lime mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900">24/7</div>
                  <p className="text-sm text-gray-600">Support</p>
                </Card>
              </div>
            </section>

            {/* Platform Features */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Key Features</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {platformFeatures.map((feature, index) => (
                  <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-primary-lime/10 rounded-xl flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary-lime" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </Card>
                ))}
              </div>
            </section>

            {/* Press Resources */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Press Resources</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-8 bg-gray-50 hover:shadow-lg transition-shadow">
                  <Download className="w-10 h-10 text-primary-lime mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Brand Assets</h3>
                  <p className="text-gray-600 mb-4">
                    Download official Vasty logos, brand guidelines, and visual assets for your publications.
                  </p>
                  <a href="mailto:support@vasty.shop?subject=Brand Assets Request">
                    <Button className="bg-primary-lime text-white hover:bg-primary-lime-dark">
                      Request Brand Kit
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                </Card>
                <Card className="p-8 bg-gray-50 hover:shadow-lg transition-shadow">
                  <Mail className="w-10 h-10 text-primary-lime mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Media Inquiries</h3>
                  <p className="text-gray-600 mb-4">
                    For interviews, quotes, or additional information, reach out to our communications team.
                  </p>
                  <a href="mailto:support@vasty.shop?subject=Media Inquiry">
                    <Button variant="outline" className="border-primary-lime text-primary-lime hover:bg-primary-lime hover:text-white">
                      Contact Us
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                </Card>
              </div>
            </section>

            {/* CTA */}
            <section>
              <Card className="p-8 md:p-12 bg-gradient-to-br from-slate-900 to-slate-800 text-white text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Want to try Vasty?</h2>
                <p className="text-gray-300 mb-6 max-w-xl mx-auto">
                  Experience our platform firsthand. Create your store in minutes with our AI-powered tools.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/vendor/create-shop">
                    <Button size="lg" className="bg-primary-lime text-white hover:bg-primary-lime-dark">
                      Start Free Trial
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button size="lg" className="bg-white text-slate-900 hover:bg-gray-100">
                      Contact Sales
                    </Button>
                  </Link>
                </div>
              </Card>
            </section>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PressPage;
