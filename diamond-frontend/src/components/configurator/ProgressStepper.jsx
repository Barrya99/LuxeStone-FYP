// src/components/configurator/ProgressStepper.jsx
import { Check } from 'lucide-react';

const ProgressStepper = ({ currentStep, steps }) => {
  return (
    <div className="relative">
      {/* Progress Bar */}
      <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 hidden md:block">
        <div
          className="h-full bg-primary-600 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />
      </div>

      {/* Steps */}
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = currentStep === stepNumber;
          const isCompleted = currentStep > stepNumber;

          return (
            <div key={stepNumber} className="flex flex-col items-center flex-1">
              {/* Circle */}
              <div
                className={`
                  relative z-10 w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all
                  ${isCompleted ? 'bg-primary-600 text-white' : ''}
                  ${isActive ? 'bg-primary-600 text-white ring-4 ring-primary-100' : ''}
                  ${!isActive && !isCompleted ? 'bg-white border-2 border-gray-300 text-gray-400' : ''}
                `}
              >
                {isCompleted ? (
                  <Check className="h-6 w-6" />
                ) : (
                  stepNumber
                )}
              </div>

              {/* Label */}
              <div className="mt-3 text-center">
                <div
                  className={`text-sm font-medium ${
                    isActive ? 'text-primary-600' : 'text-gray-600'
                  }`}
                >
                  {step.title}
                </div>
                <div className="text-xs text-gray-500 hidden md:block mt-1">
                  {step.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressStepper;