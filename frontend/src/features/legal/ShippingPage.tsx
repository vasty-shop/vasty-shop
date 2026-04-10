import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Package, Clock, MapPin, RotateCcw, HelpCircle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BreadcrumbNavigation } from '@/components/layout/BreadcrumbNavigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const ShippingPage: React.FC = () => {
  const breadcrumbItems = [
    { label: 'Customer Service', href: '/faq' },
    { label: 'Shipping & Returns' },
  ];

  const shippingOptions = [
    {
      icon: Truck,
      title: 'Standard Shipping',
      time: '5-7 Business Days',
      price: 'Free over $50',
      description: 'Reliable delivery for all your orders',
    },
    {
      icon: Package,
      title: 'Express Shipping',
      time: '2-3 Business Days',
      price: '$9.99',
      description: 'Faster delivery when you need it',
    },
    {
      icon: Clock,
      title: 'Next Day Delivery',
      time: '1 Business Day',
      price: '$19.99',
      description: 'Order by 2pm for next day delivery',
    },
  ];

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
              <Truck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Shipping & Returns</h1>
            <p className="text-lg text-white/90">
              Fast, reliable shipping and hassle-free returns
            </p>
          </div>
        </div>
      </section>

      <div className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">

            {/* Shipping Options */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Shipping Options</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {shippingOptions.map((option, index) => (
                  <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-lime/10 rounded-full mb-4">
                      <option.icon className="w-6 h-6 text-primary-lime" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">{option.title}</h3>
                    <p className="text-primary-lime font-semibold mb-1">{option.time}</p>
                    <p className="text-gray-600 text-sm mb-2">{option.price}</p>
                    <p className="text-gray-500 text-sm">{option.description}</p>
                  </Card>
                ))}
              </div>
            </section>

            {/* Shipping Info */}
            <section className="mb-12">
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-primary-lime" />
                  Delivery Information
                </h2>
                <div className="space-y-4 text-gray-600">
                  <p>We ship to all 50 US states and select international destinations. Shipping times may vary based on your location and chosen shipping method.</p>
                  <p>Orders placed before 2:00 PM EST on business days are typically processed the same day. You will receive a tracking number via email once your order ships.</p>
                  <p><strong>Free shipping</strong> is available on all orders over $50 within the continental United States.</p>
                </div>
              </Card>
            </section>

            {/* Returns Policy */}
            <section className="mb-12">
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <RotateCcw className="w-6 h-6 text-primary-lime" />
                  Returns Policy
                </h2>
                <div className="space-y-4 text-gray-600">
                  <p>We offer a <strong>30-day return policy</strong> on most items. If you're not completely satisfied with your purchase, you can return it within 30 days of delivery for a full refund or exchange.</p>
                  <h3 className="font-semibold text-gray-900 mt-6">Return Requirements:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Items must be in original condition with tags attached</li>
                    <li>Items must be unworn and unwashed</li>
                    <li>Original packaging should be included when possible</li>
                    <li>Proof of purchase is required</li>
                  </ul>
                  <h3 className="font-semibold text-gray-900 mt-6">Non-Returnable Items:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Intimate apparel and swimwear</li>
                    <li>Pierced jewelry</li>
                    <li>Personalized or customized items</li>
                    <li>Final sale items</li>
                  </ul>
                </div>
              </Card>
            </section>

            {/* Help Section */}
            <section>
              <Card className="p-8 bg-gray-50">
                <div className="text-center">
                  <HelpCircle className="w-12 h-12 text-primary-lime mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Need Help?</h2>
                  <p className="text-gray-600 mb-6">Our customer service team is here to assist you with any questions about shipping or returns.</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/contact">
                      <Button className="bg-primary-lime text-white hover:bg-primary-lime-dark">
                        Contact Support
                      </Button>
                    </Link>
                    <Link to="/track-order">
                      <Button variant="outline" className="border-gray-300 text-gray-700 hover:border-primary-lime hover:text-primary-lime">
                        Track Your Order
                      </Button>
                    </Link>
                  </div>
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

export default ShippingPage;
