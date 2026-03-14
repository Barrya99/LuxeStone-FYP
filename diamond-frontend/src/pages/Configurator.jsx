// diamond-frontend/src/pages/Configurator.jsx - FIXED

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useConfiguratorStore } from '../store/useConfiguratorStore';
import ProgressStepper from '../components/configurator/ProgressStepper';
import StepOneDiamond from '../components/configurator/StepOneDiamond';
import StepTwoSetting from '../components/configurator/StepTwoSetting';
import StepThreeCustomize from '../components/configurator/StepThreeCustomize';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const Configurator = () => {
  const {
    currentStep,
    selectedDiamond,
    selectedSetting,
    ringSize,
    setStep,
    selectDiamond,
    selectSetting,
    setRingSize,
    reset,
  } = useConfiguratorStore();

  // Handle next step with validation
  const handleNextStep = () => {
    // STEP 1 → STEP 2: Diamond must be selected
    if (currentStep === 1) {
      if (!selectedDiamond) {
        toast.error('Please select a diamond to continue');
        return;
      }
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // STEP 2 → STEP 3: Setting must be selected
    else if (currentStep === 2) {
      if (!selectedSetting) {
        toast.error('Please select a setting to continue');
        return;
      }
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle back step
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle diamond selection - stays on step 1
  const handleSelectDiamond = (diamond) => {
    selectDiamond(diamond);
    toast.success('Diamond selected! Click Next to continue.');
  };

  // Handle setting selection - stays on step 2, doesn't jump to step 3
  const handleSelectSetting = (setting) => {
    selectSetting(setting);
    toast.success('Setting selected! Click Next to customize.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Design Your Perfect Ring
          </h1>
          <p className="text-gray-600">
            Create your custom ring by selecting a diamond, setting, and customizations
          </p>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProgressStepper
            currentStep={currentStep}
            steps={[
              { number: 1, title: 'Diamond', icon: '💎' },
              { number: 2, title: 'Setting', icon: '👑' },
              { number: 3, title: 'Customize', icon: '⚙️' },
            ]}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {currentStep === 1 && (
          <StepOneDiamond
            onSelectDiamond={handleSelectDiamond}
            selectedDiamond={selectedDiamond}
          />
        )}

        {currentStep === 2 && (
          <StepTwoSetting
            selectedDiamond={selectedDiamond}
            onSelectSetting={handleSelectSetting}
            selectedSetting={selectedSetting}
          />
        )}

        {currentStep === 3 && (
          <StepThreeCustomize
            selectedDiamond={selectedDiamond}
            selectedSetting={selectedSetting}
            onBack={handlePrevStep}
          />
        )}

        {/* Navigation Buttons */}
        <div className="mt-12 flex justify-between items-center gap-4">
          {/* Back Button */}
          <Button
            variant="outline"
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          {/* Reset Button */}
          <Button
            variant="outline"
            onClick={() => {
              reset();
              toast.success('Ring design reset. Start over!');
            }}
            className="text-gray-600 hover:text-gray-900"
          >
            Reset Design
          </Button>

          {/* Next Button */}
          {currentStep < 3 && (
            <Button
              variant="primary"
              onClick={handleNextStep}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}

          {/* Completion Info (Step 3) */}
          {currentStep === 3 && (
            <div className="flex-1 text-right">
              <p className="text-sm text-gray-600">
                ✓ All steps complete! Ready to add to cart.
              </p>
            </div>
          )}
        </div>

        {/* Step Validation Messages */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          {currentStep === 1 && (
            <>
              <p className="font-semibold mb-1">Step 1: Select Diamond</p>
              <p>
                {selectedDiamond 
                  ? `✓ ${selectedDiamond.carat}ct ${selectedDiamond.shape} diamond selected. Click Next to choose a setting.`
                  : '⚠️ Please select a diamond from the list above to continue.'}
              </p>
            </>
          )}

          {currentStep === 2 && (
            <>
              <p className="font-semibold mb-1">Step 2: Select Setting</p>
              <p>
                {selectedSetting 
                  ? `✓ ${selectedSetting.name} selected. Click Next to customize your ring.`
                  : '⚠️ Please select a setting compatible with your diamond to continue.'}
              </p>
            </>
          )}

          {currentStep === 3 && (
            <>
              <p className="font-semibold mb-1">Step 3: Customize Ring</p>
              <p>
                ✓ Diamond: {selectedDiamond?.carat}ct {selectedDiamond?.shape} |
                ✓ Setting: {selectedSetting?.name} |
                Choose size and add to cart!
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Configurator;