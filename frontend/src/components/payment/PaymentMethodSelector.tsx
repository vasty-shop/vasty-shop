import React from 'react';
import { CreditCard, Banknote, Building2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// All available payment methods that can be enabled
type PaymentMethodId = 'card' | 'paypal' | 'applepay' | 'googlepay' | 'cod' | 'bank';

interface PaymentMethodConfig {
  id: PaymentMethodId;
  name: string;
  shortName?: string;
  enabled?: boolean;
}

// Default payment methods
const DEFAULT_PAYMENT_METHODS: PaymentMethodConfig[] = [
  { id: 'card', name: 'Credit / Debit Card', shortName: 'Card', enabled: true },
  { id: 'paypal', name: 'PayPal', shortName: 'PayPal', enabled: true },
  { id: 'applepay', name: 'Apple Pay', shortName: 'Apple', enabled: true },
  { id: 'googlepay', name: 'Google Pay', shortName: 'Google', enabled: true },
];

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
  availableMethods?: string[];
  children?: React.ReactNode;
  className?: string;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodChange,
  availableMethods,
  children,
  className = '',
}) => {
  // Filter methods based on available methods prop
  const enabledMethods = availableMethods && availableMethods.length > 0
    ? DEFAULT_PAYMENT_METHODS.filter(m => availableMethods.includes(m.id))
    : DEFAULT_PAYMENT_METHODS;

  // Add COD and Bank Transfer if they're in available methods
  const allMethods = [...enabledMethods];
  if (availableMethods?.includes('cod') && !allMethods.find(m => m.id === 'cod')) {
    allMethods.push({ id: 'cod', name: 'Cash on Delivery', shortName: 'COD', enabled: true });
  }
  if (availableMethods?.includes('bank') && !allMethods.find(m => m.id === 'bank')) {
    allMethods.push({ id: 'bank', name: 'Bank Transfer', shortName: 'Bank', enabled: true });
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'card':
        return <CreditCard className="w-4 h-4" />;
      case 'paypal':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.76-4.852a.932.932 0 0 1 .922-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.746-4.458z" />
          </svg>
        );
      case 'applepay':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
        );
      case 'googlepay':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
          </svg>
        );
      case 'cod':
        return <Banknote className="w-4 h-4" />;
      case 'bank':
        return <Building2 className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  // Calculate grid columns based on number of methods
  const getGridCols = () => {
    const count = allMethods.length;
    if (count <= 2) return 'grid-cols-2';
    if (count <= 3) return 'grid-cols-3';
    return 'grid-cols-2 lg:grid-cols-4';
  };

  return (
    <div className={className}>
      <Tabs value={selectedMethod} onValueChange={onMethodChange}>
        <TabsList className={`grid w-full ${getGridCols()} mb-6`}>
          {allMethods.map((method) => (
            <TabsTrigger key={method.id} value={method.id} className="flex items-center gap-2">
              {getMethodIcon(method.id)}
              <span className="hidden sm:inline">{method.name}</span>
              <span className="sm:hidden">{method.shortName || method.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {children}
      </Tabs>
    </div>
  );
};
