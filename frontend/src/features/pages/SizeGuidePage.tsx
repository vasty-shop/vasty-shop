import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Ruler, HelpCircle, Shirt, Footprints } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BreadcrumbNavigation } from '@/components/layout/BreadcrumbNavigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export const SizeGuidePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'women' | 'men' | 'shoes'>('women');

  const breadcrumbItems = [
    { label: 'Customer Service', href: '/faq' },
    { label: 'Size Guide' },
  ];

  const womenSizes = [
    { size: 'XS', us: '0-2', uk: '4-6', eu: '32-34', bust: '31-32"', waist: '23-24"', hips: '33-34"' },
    { size: 'S', us: '4-6', uk: '8-10', eu: '36-38', bust: '33-34"', waist: '25-26"', hips: '35-36"' },
    { size: 'M', us: '8-10', uk: '12-14', eu: '40-42', bust: '35-36"', waist: '27-28"', hips: '37-38"' },
    { size: 'L', us: '12-14', uk: '16-18', eu: '44-46', bust: '37-39"', waist: '29-31"', hips: '39-41"' },
    { size: 'XL', us: '16-18', uk: '20-22', eu: '48-50', bust: '40-42"', waist: '32-34"', hips: '42-44"' },
  ];

  const menSizes = [
    { size: 'S', us: '34-36', uk: '34-36', eu: '44-46', chest: '34-36"', waist: '28-30"', hips: '35-37"' },
    { size: 'M', us: '38-40', uk: '38-40', eu: '48-50', chest: '38-40"', waist: '32-34"', hips: '38-40"' },
    { size: 'L', us: '42-44', uk: '42-44', eu: '52-54', chest: '42-44"', waist: '36-38"', hips: '41-43"' },
    { size: 'XL', us: '46-48', uk: '46-48', eu: '56-58', chest: '46-48"', waist: '40-42"', hips: '44-46"' },
    { size: 'XXL', us: '50-52', uk: '50-52', eu: '60-62', chest: '50-52"', waist: '44-46"', hips: '47-49"' },
  ];

  const shoeSizes = [
    { us_m: '7', us_w: '8.5', uk: '6', eu: '40', cm: '25' },
    { us_m: '8', us_w: '9.5', uk: '7', eu: '41', cm: '26' },
    { us_m: '9', us_w: '10.5', uk: '8', eu: '42', cm: '27' },
    { us_m: '10', us_w: '11.5', uk: '9', eu: '43', cm: '28' },
    { us_m: '11', us_w: '12.5', uk: '10', eu: '44', cm: '29' },
    { us_m: '12', us_w: '13.5', uk: '11', eu: '45', cm: '30' },
  ];

  const tabs = [
    { id: 'women' as const, label: "Women's", icon: Shirt },
    { id: 'men' as const, label: "Men's", icon: Shirt },
    { id: 'shoes' as const, label: 'Shoes', icon: Footprints },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <div className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <BreadcrumbNavigation items={breadcrumbItems} />
        </div>
      </div>

      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-lime/20 rounded-full mb-6">
              <Ruler className="w-8 h-8 text-primary-lime" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Size Guide</h1>
            <p className="text-lg text-gray-300">
              Find your perfect fit with our comprehensive size charts
            </p>
          </div>
        </div>
      </section>

      <div className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">

            {/* Tabs */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex bg-gray-100 rounded-lg p-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all',
                      activeTab === tab.id
                        ? 'bg-white text-primary-lime shadow'
                        : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Tables */}
            <Card className="p-6 mb-8 overflow-x-auto">
              {activeTab === 'women' && (
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-4 text-left font-bold text-gray-900">Size</th>
                      <th className="py-3 px-4 text-left font-bold text-gray-900">US</th>
                      <th className="py-3 px-4 text-left font-bold text-gray-900">UK</th>
                      <th className="py-3 px-4 text-left font-bold text-gray-900">EU</th>
                      <th className="py-3 px-4 text-left font-bold text-gray-900">Bust</th>
                      <th className="py-3 px-4 text-left font-bold text-gray-900">Waist</th>
                      <th className="py-3 px-4 text-left font-bold text-gray-900">Hips</th>
                    </tr>
                  </thead>
                  <tbody>
                    {womenSizes.map((row, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-semibold text-primary-lime">{row.size}</td>
                        <td className="py-3 px-4 text-gray-600">{row.us}</td>
                        <td className="py-3 px-4 text-gray-600">{row.uk}</td>
                        <td className="py-3 px-4 text-gray-600">{row.eu}</td>
                        <td className="py-3 px-4 text-gray-600">{row.bust}</td>
                        <td className="py-3 px-4 text-gray-600">{row.waist}</td>
                        <td className="py-3 px-4 text-gray-600">{row.hips}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === 'men' && (
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-4 text-left font-bold text-gray-900">Size</th>
                      <th className="py-3 px-4 text-left font-bold text-gray-900">US</th>
                      <th className="py-3 px-4 text-left font-bold text-gray-900">UK</th>
                      <th className="py-3 px-4 text-left font-bold text-gray-900">EU</th>
                      <th className="py-3 px-4 text-left font-bold text-gray-900">Chest</th>
                      <th className="py-3 px-4 text-left font-bold text-gray-900">Waist</th>
                      <th className="py-3 px-4 text-left font-bold text-gray-900">Hips</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menSizes.map((row, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-semibold text-primary-lime">{row.size}</td>
                        <td className="py-3 px-4 text-gray-600">{row.us}</td>
                        <td className="py-3 px-4 text-gray-600">{row.uk}</td>
                        <td className="py-3 px-4 text-gray-600">{row.eu}</td>
                        <td className="py-3 px-4 text-gray-600">{row.chest}</td>
                        <td className="py-3 px-4 text-gray-600">{row.waist}</td>
                        <td className="py-3 px-4 text-gray-600">{row.hips}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === 'shoes' && (
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-4 text-left font-bold text-gray-900">US Men's</th>
                      <th className="py-3 px-4 text-left font-bold text-gray-900">US Women's</th>
                      <th className="py-3 px-4 text-left font-bold text-gray-900">UK</th>
                      <th className="py-3 px-4 text-left font-bold text-gray-900">EU</th>
                      <th className="py-3 px-4 text-left font-bold text-gray-900">CM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shoeSizes.map((row, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-semibold text-primary-lime">{row.us_m}</td>
                        <td className="py-3 px-4 text-gray-600">{row.us_w}</td>
                        <td className="py-3 px-4 text-gray-600">{row.uk}</td>
                        <td className="py-3 px-4 text-gray-600">{row.eu}</td>
                        <td className="py-3 px-4 text-gray-600">{row.cm}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>

            {/* Measuring Tips */}
            <Card className="p-8 bg-gray-50">
              <div className="flex items-start gap-4">
                <HelpCircle className="w-8 h-8 text-primary-lime flex-shrink-0" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">How to Measure</h2>
                  <ul className="space-y-2 text-gray-600">
                    <li><strong>Bust/Chest:</strong> Measure around the fullest part of your bust/chest, keeping the tape horizontal.</li>
                    <li><strong>Waist:</strong> Measure around your natural waistline, keeping the tape comfortably loose.</li>
                    <li><strong>Hips:</strong> Measure around the fullest part of your hips and buttocks.</li>
                    <li><strong>Foot:</strong> Stand on a piece of paper, trace your foot, and measure from heel to longest toe.</li>
                  </ul>
                  <div className="mt-6">
                    <Link to="/contact">
                      <Button variant="outline" className="border-gray-300 text-gray-700 hover:border-primary-lime hover:text-primary-lime">
                        Need Help? Contact Us
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SizeGuidePage;
