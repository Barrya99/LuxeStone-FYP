import { useEffect } from 'react';
import { useConfiguratorStore } from '../store/useConfiguratorStore';
import ProgressStepper from '../components/configurator/ProgressStepper';
import StepOneDiamond from '../components/configurator/StepOneDiamond';
import StepTwoSetting from '../components/configurator/StepTwoSetting';
import StepThreeCustomize from '../components/configurator/StepThreeCustomize';

const Configurator = () => {
  const {
    currentStep,
    selectedDiamond,
    selectedSetting,
    budget,
    selectDiamond,
    selectSetting,
    setStep,
  } = useConfiguratorStore();

  const steps = [
    { title: 'Choose Diamond', description: 'Select your perfect stone' },
    { title: 'Choose Setting', description: 'Pick your ring style' },
    { title: 'Customize', description: 'Finalize your design' },
  ];

  useEffect(() => {
    // Auto-advance if diamond already selected (from detail page)
    if (selectedDiamond && currentStep === 1) {
      setStep(2);
    }
  }, [selectedDiamond, currentStep, setStep]);

  const handleSelectDiamond = (diamond) => {
    selectDiamond(diamond);
  };

  const handleSelectSetting = (setting) => {
    selectSetting(setting);
  };

  const handleBackFromStep2 = () => {
    setStep(1);
  };

  const handleBackFromStep3 = () => {
    setStep(2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
              Design Your Perfect Ring
            </h1>
            <p className="text-xl text-gray-600">
              Create a custom engagement ring in three easy steps
            </p>
          </div>

          {/* Progress Stepper */}
          <div className="max-w-3xl mx-auto">
            <ProgressStepper currentStep={currentStep} steps={steps} />
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {currentStep === 1 && (
          <StepOneDiamond
            selectedDiamond={selectedDiamond}
            onSelectDiamond={handleSelectDiamond}
            budget={budget}
          />
        )}

        {currentStep === 2 && (
          <StepTwoSetting
            selectedSetting={selectedSetting}
            selectedDiamond={selectedDiamond}
            onSelectSetting={handleSelectSetting}
            onBack={handleBackFromStep2}
          />
        )}

        {currentStep === 3 && (
          <StepThreeCustomize
            selectedDiamond={selectedDiamond}
            selectedSetting={selectedSetting}
            onBack={handleBackFromStep3}
          />
        )}
      </div>
    </div>
  );
};

export default Configurator;