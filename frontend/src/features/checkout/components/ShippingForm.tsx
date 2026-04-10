import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ShippingAddress, ValidationErrors } from '@/types';
import { COUNTRIES, getStatesForCountry } from '@/types';

interface ShippingFormProps {
  formData: ShippingAddress;
  onChange: (data: ShippingAddress) => void;
  onValidate?: (isValid: boolean) => void;
}

// Searchable Dropdown Component
interface SearchableSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder?: string;
  error?: boolean;
  disabled?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder = 'Search...',
  error = false,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const selectedLabel = options.find((opt) => opt.value === value)?.label || '';

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.searchable-select')) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="searchable-select relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red-500 focus:ring-red-500',
          !selectedLabel && 'text-muted-foreground'
        )}
      >
        <span className="truncate">{selectedLabel || placeholder}</span>
        <ChevronDown className={cn('h-4 w-4 opacity-50 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
          {/* Search Input */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No results found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 pl-8 pr-2 text-sm outline-none',
                    'hover:bg-accent hover:text-accent-foreground',
                    value === option.value && 'bg-accent'
                  )}
                >
                  {value === option.value && (
                    <Check className="absolute left-2 h-4 w-4" />
                  )}
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const ShippingForm: React.FC<ShippingFormProps> = ({
  formData,
  onChange,
  onValidate
}) => {
  const { t } = useTranslation();
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Get states for selected country
  const availableStates = useMemo(() => {
    return getStatesForCountry(formData.country);
  }, [formData.country]);

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\d\s\-\(\)\+]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 6;
  };

  const validateZipCode = (zipCode: string, country: string): boolean => {
    // Different validation patterns for different countries
    const patterns: Record<string, RegExp> = {
      US: /^\d{5}(-\d{4})?$/,
      CA: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
      GB: /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s?\d[A-Za-z]{2}$/,
      DE: /^\d{5}$/,
      FR: /^\d{5}$/,
      AU: /^\d{4}$/,
      IN: /^\d{6}$/,
      BD: /^\d{4}$/,
      JP: /^\d{3}-?\d{4}$/,
    };

    const pattern = patterns[country];
    if (pattern) {
      return pattern.test(zipCode);
    }
    // Generic validation for countries without specific pattern
    return zipCode.length >= 3 && zipCode.length <= 10;
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    // Only require state if the country has states defined
    if (availableStates.length > 0 && !formData.state) {
      newErrors.state = 'State/Province is required';
    }

    // Simplified ZIP validation - just check if not empty and reasonable length
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP/Postal code is required';
    } else if (formData.zipCode.trim().length < 3 || formData.zipCode.trim().length > 12) {
      newErrors.zipCode = 'Please enter a valid ZIP/Postal code';
    }

    if (!formData.country) {
      newErrors.country = 'Country is required';
    }

    const isValid = Object.keys(newErrors).length === 0;

    setErrors(newErrors);
    return isValid;
  };

  // Validate on change - include availableStates in dependency
  useEffect(() => {
    const isValid = validateForm();
    onValidate?.(isValid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, availableStates.length]);

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
  };

  const handleChange = (field: keyof ShippingAddress, value: any) => {
    onChange({
      ...formData,
      [field]: value,
    });
  };

  // Handle country change - reset state when country changes
  const handleCountryChange = (countryCode: string) => {
    onChange({
      ...formData,
      country: countryCode,
      state: '', // Reset state when country changes
    });
  };

  const showError = (field: keyof ValidationErrors) => {
    return touched[field] && errors[field];
  };

  // Get label for state field based on country
  const getStateLabel = () => {
    const labels: Record<string, string> = {
      US: 'State',
      CA: 'Province',
      GB: 'Region',
      AU: 'State/Territory',
      IN: 'State',
      BD: 'Division',
      default: 'State/Province',
    };
    return labels[formData.country] || labels.default;
  };

  // Get label for ZIP field based on country
  const getZipLabel = () => {
    const labels: Record<string, string> = {
      US: 'ZIP Code',
      CA: 'Postal Code',
      GB: 'Postcode',
      IN: 'PIN Code',
      BD: 'Postal Code',
      default: 'ZIP/Postal Code',
    };
    return labels[formData.country] || labels.default;
  };

  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          {t('checkout.contactInfo')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="md:col-span-2">
            <Label htmlFor="fullName">
              {t('checkout.fullName')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              onBlur={() => handleBlur('fullName')}
              placeholder={t('checkout.fullName')}
              className={cn(showError('fullName') && 'border-red-500 focus-visible:ring-red-500')}
            />
            {showError('fullName') && (
              <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">
              {t('checkout.email')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder={t('checkout.emailPlaceholder')}
              className={cn(showError('email') && 'border-red-500 focus-visible:ring-red-500')}
            />
            {showError('email') && (
              <p className="text-sm text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone">
              {t('checkout.phone')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              onBlur={() => handleBlur('phone')}
              placeholder={t('checkout.phonePlaceholder')}
              className={cn(showError('phone') && 'border-red-500 focus-visible:ring-red-500')}
            />
            {showError('phone') && (
              <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          {t('checkout.shippingAddress')}
        </h3>
        <div className="space-y-4">
          {/* Country */}
          <div>
            <Label htmlFor="country">
              {t('checkout.country')} <span className="text-red-500">*</span>
            </Label>
            <SearchableSelect
              options={COUNTRIES}
              value={formData.country}
              onChange={handleCountryChange}
              placeholder={t('checkout.selectCountry')}
              searchPlaceholder={t('checkout.searchCountries')}
              error={!!showError('country')}
            />
            {showError('country') && (
              <p className="text-sm text-red-500 mt-1">{errors.country}</p>
            )}
          </div>

          {/* Address Line 1 */}
          <div>
            <Label htmlFor="addressLine1">
              {t('checkout.addressLine1')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="addressLine1"
              type="text"
              value={formData.addressLine1}
              onChange={(e) => handleChange('addressLine1', e.target.value)}
              onBlur={() => handleBlur('addressLine1')}
              placeholder={t('checkout.addressPlaceholder')}
              className={cn(showError('addressLine1') && 'border-red-500 focus-visible:ring-red-500')}
            />
            {showError('addressLine1') && (
              <p className="text-sm text-red-500 mt-1">{errors.addressLine1}</p>
            )}
          </div>

          {/* Address Line 2 */}
          <div>
            <Label htmlFor="addressLine2">
              {t('checkout.addressLine2')} <span className="text-text-secondary text-sm">({t('common.optional')})</span>
            </Label>
            <Input
              id="addressLine2"
              type="text"
              value={formData.addressLine2 || ''}
              onChange={(e) => handleChange('addressLine2', e.target.value)}
              placeholder={t('checkout.addressLine2Placeholder')}
            />
          </div>

          {/* City, State, ZIP */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* City */}
            <div>
              <Label htmlFor="city">
                {t('checkout.city')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="city"
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                onBlur={() => handleBlur('city')}
                placeholder={t('checkout.city')}
                className={cn(showError('city') && 'border-red-500 focus-visible:ring-red-500')}
              />
              {showError('city') && (
                <p className="text-sm text-red-500 mt-1">{errors.city}</p>
              )}
            </div>

            {/* State/Province */}
            <div>
              <Label htmlFor="state">
                {t('checkout.state')} {availableStates.length > 0 && <span className="text-red-500">*</span>}
              </Label>
              {availableStates.length > 0 ? (
                <SearchableSelect
                  options={availableStates}
                  value={formData.state}
                  onChange={(value) => handleChange('state', value)}
                  placeholder={t('common.select')}
                  searchPlaceholder={t('checkout.searchState')}
                  error={!!showError('state')}
                />
              ) : (
                <Input
                  id="state"
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  onBlur={() => handleBlur('state')}
                  placeholder={t('checkout.state')}
                  className={cn(showError('state') && 'border-red-500 focus-visible:ring-red-500')}
                />
              )}
              {showError('state') && (
                <p className="text-sm text-red-500 mt-1">{errors.state}</p>
              )}
            </div>

            {/* ZIP/Postal Code */}
            <div>
              <Label htmlFor="zipCode">
                {t('checkout.postalCode')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="zipCode"
                type="text"
                value={formData.zipCode}
                onChange={(e) => handleChange('zipCode', e.target.value)}
                onBlur={() => handleBlur('zipCode')}
                placeholder={t('checkout.postalCode')}
                className={cn(showError('zipCode') && 'border-red-500 focus-visible:ring-red-500')}
              />
              {showError('zipCode') && (
                <p className="text-sm text-red-500 mt-1">{errors.zipCode}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Save Address Checkbox */}
      <div className="flex items-start space-x-3 pt-4 border-t">
        <Checkbox
          id="saveForFuture"
          checked={formData.saveForFuture}
          onCheckedChange={(checked) => handleChange('saveForFuture', checked)}
        />
        <div className="grid gap-1.5 leading-none">
          <label
            htmlFor="saveForFuture"
            className="text-sm font-medium text-text-primary cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t('checkout.saveAddress')}
          </label>
          <p className="text-sm text-text-secondary">
            {t('checkout.saveAddressDesc')}
          </p>
        </div>
      </div>
    </div>
  );
};
