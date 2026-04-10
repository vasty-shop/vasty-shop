import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Clock, Phone, Search, Navigation } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BreadcrumbNavigation } from '@/components/layout/BreadcrumbNavigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export const StoresPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const breadcrumbItems = [
    { label: 'Company', href: '/about' },
    { label: 'Store Locator' },
  ];

  const stores = [
    {
      name: 'Vasty Flagship - New York',
      address: '123 Fifth Avenue, New York, NY 10001',
      phone: '(212) 555-0123',
      hours: 'Mon-Sat: 10am-9pm, Sun: 11am-7pm',
      features: ['AR Try-On', 'Personal Styling', 'Express Pickup'],
    },
    {
      name: 'Vasty - Los Angeles',
      address: '456 Rodeo Drive, Beverly Hills, CA 90210',
      phone: '(310) 555-0456',
      hours: 'Mon-Sat: 10am-8pm, Sun: 12pm-6pm',
      features: ['AR Try-On', 'Alterations'],
    },
    {
      name: 'Vasty - Chicago',
      address: '789 Michigan Avenue, Chicago, IL 60611',
      phone: '(312) 555-0789',
      hours: 'Mon-Sat: 10am-8pm, Sun: 11am-6pm',
      features: ['Express Pickup', 'Personal Styling'],
    },
    {
      name: 'Vasty - Miami',
      address: '321 Collins Avenue, Miami Beach, FL 33139',
      phone: '(305) 555-0321',
      hours: 'Mon-Sat: 10am-9pm, Sun: 12pm-7pm',
      features: ['AR Try-On', 'Express Pickup'],
    },
  ];

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <div className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <BreadcrumbNavigation items={breadcrumbItems} />
        </div>
      </div>

      <section className="bg-gradient-to-br from-primary-lime via-green-500 to-accent-blue text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Find a Store</h1>
            <p className="text-lg text-white/90 mb-8">
              Visit us in person for an exceptional shopping experience
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder={t('common.placeholders.locationSearch')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-base bg-white text-gray-900"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">

            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {filteredStores.length} Store{filteredStores.length !== 1 ? 's' : ''} Found
              </h2>
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:border-primary-lime hover:text-primary-lime">
                <Navigation className="w-4 h-4 mr-2" />
                Use My Location
              </Button>
            </div>

            <div className="space-y-6">
              {filteredStores.map((store, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Store Image Placeholder */}
                    <div className="w-full md:w-48 h-36 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-12 h-12 text-gray-300" />
                    </div>

                    {/* Store Info */}
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-xl mb-3">{store.name}</h3>

                      <div className="space-y-2 text-gray-600 mb-4">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-5 h-5 text-primary-lime flex-shrink-0 mt-0.5" />
                          <span>{store.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-5 h-5 text-primary-lime flex-shrink-0" />
                          <span>{store.phone}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Clock className="w-5 h-5 text-primary-lime flex-shrink-0 mt-0.5" />
                          <span>{store.hours}</span>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {store.features.map((feature, idx) => (
                          <span key={idx} className="px-3 py-1 bg-primary-lime/10 text-primary-lime text-sm rounded-full">
                            {feature}
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-3">
                        <Button className="bg-primary-lime text-white hover:bg-primary-lime-dark">
                          Get Directions
                        </Button>
                        <Button variant="outline" className="border-gray-300 text-gray-700 hover:border-primary-lime hover:text-primary-lime">
                          Store Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {filteredStores.length === 0 && (
              <Card className="p-12 text-center">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No stores found</h3>
                <p className="text-gray-600">Try searching for a different location or browse all stores.</p>
              </Card>
            )}

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default StoresPage;
