import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CheckoutStep } from '@/types';

interface Step {
  number: CheckoutStep;
  labelKey: string;
  shortLabelKey: string;
}

interface StepIndicatorProps {
  currentStep: CheckoutStep;
  completedSteps?: CheckoutStep[];
}

const stepKeys: Step[] = [
  { number: 1, labelKey: 'checkout.shippingAddress', shortLabelKey: 'checkout.shippingShort' },
  { number: 2, labelKey: 'checkout.shippingMethod', shortLabelKey: 'checkout.deliveryShort' },
  { number: 3, labelKey: 'checkout.paymentMethod', shortLabelKey: 'checkout.paymentShort' },
  { number: 4, labelKey: 'checkout.reviewOrder', shortLabelKey: 'checkout.reviewShort' },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  completedSteps = []
}) => {
  const { t } = useTranslation();
  const isStepCompleted = (stepNumber: CheckoutStep) => {
    return completedSteps.includes(stepNumber) || stepNumber < currentStep;
  };

  const isStepCurrent = (stepNumber: CheckoutStep) => {
    return stepNumber === currentStep;
  };

  return (
    <div className="w-full">
      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {stepKeys.map((step, index) => {
            const completed = isStepCompleted(step.number);
            const current = isStepCurrent(step.number);
            const isLast = index === stepKeys.length - 1;

            return (
              <React.Fragment key={step.number}>
                {/* Step Item */}
                <div className="flex flex-col items-center flex-1">
                  {/* Step Circle */}
                  <div className="relative">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center font-semibold text-base transition-all duration-300 border-2",
                        completed
                          ? "bg-primary-lime border-primary-lime text-white shadow-lg shadow-primary-lime/30"
                          : current
                          ? "bg-white border-primary-lime text-primary-lime ring-4 ring-primary-lime/20"
                          : "bg-white border-gray-300 text-gray-400"
                      )}
                    >
                      {completed ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <span>{step.number}</span>
                      )}
                    </div>

                    {/* Pulse animation for current step */}
                    {current && (
                      <span className="absolute inset-0 rounded-full bg-primary-lime/20 animate-ping" />
                    )}
                  </div>

                  {/* Step Label */}
                  <div className="mt-3 text-center">
                    <p
                      className={cn(
                        "text-sm font-medium transition-colors",
                        current || completed
                          ? "text-text-primary"
                          : "text-text-secondary"
                      )}
                    >
                      {t(step.labelKey)}
                    </p>
                  </div>
                </div>

                {/* Connector Line */}
                {!isLast && (
                  <div className="flex-1 px-4 pb-8">
                    <div
                      className={cn(
                        "h-0.5 w-full transition-all duration-500",
                        completed
                          ? "bg-primary-lime"
                          : "bg-gray-300"
                      )}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <div className="flex items-center">
          {stepKeys.map((step, index) => {
            const completed = isStepCompleted(step.number);
            const current = isStepCurrent(step.number);
            const isLast = index === stepKeys.length - 1;

            return (
              <React.Fragment key={step.number}>
                {/* Step Item */}
                <div className="flex flex-col items-center">
                  {/* Step Circle */}
                  <div className="relative">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 border-2",
                        completed
                          ? "bg-primary-lime border-primary-lime text-white"
                          : current
                          ? "bg-white border-primary-lime text-primary-lime ring-2 ring-primary-lime/20"
                          : "bg-white border-gray-300 text-gray-400"
                      )}
                    >
                      {completed ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span>{step.number}</span>
                      )}
                    </div>
                  </div>

                  {/* Step Label - Short version for mobile */}
                  <div className="mt-2 text-center">
                    <p
                      className={cn(
                        "text-xs font-medium transition-colors",
                        current || completed
                          ? "text-text-primary"
                          : "text-text-secondary"
                      )}
                    >
                      {t(step.shortLabelKey)}
                    </p>
                  </div>
                </div>

                {/* Connector Line */}
                {!isLast && (
                  <div className="flex-1 px-2 pb-8">
                    <div
                      className={cn(
                        "h-0.5 w-full transition-all duration-500",
                        completed
                          ? "bg-primary-lime"
                          : "bg-gray-300"
                      )}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
