import React from "react";
import { Button } from "@fluentui/react-components";
import { Stack, Text } from "@fluentui/react";
import "./CantierStepper.css"; // External CSS
import CantierButton from "../CantierButton/CantierButton";
import "../../assets/styles/inputForm.css";
interface Step {
  number: string;
  label: string;
  icon: React.ElementType;
}
interface TrackTraceTabsProps {
  steps: Step[];
  currentStep: number;
  onStepChange: (newIndex: number) => void;
  tabContents: React.ReactNode[];
  className?: string;
  onNext?: () => boolean | Promise<boolean>;
  onSubmit?: () => void;
  extraBtn?: React.ReactNode[];
}

const CantierStepper: React.FC<TrackTraceTabsProps> = ({
  steps,
  currentStep,
  onStepChange,
  tabContents,
  className,
  onNext,
  onSubmit,
  extraBtn,
}) => {
  const getCircleColor = (index: number) => {
    if (index === currentStep) return "var(--color-accent)";
    if (index < currentStep) return "#4CAF50";
    return "#ccc";
  };

  const getIconColor = (index: number) => {
    return index <= currentStep ? "var(--color-primary)" : "#ccc";
  };

  const getLineColor = (index: number) => {
    return index <= currentStep ? "#4CAF50" : "#ccc";
  };

  const getLabelColor = (index: number) => {
    return index <= currentStep ? "var(--color-primary)" : "#ccc";
  };
  const handleSubmit = () => {
    alert("Provide submission functionality..");
  }
  const busFunction = async (index: number) => {
    let canProceed = true;
    let stepNo = index;
    if (onNext) {
      if (currentStep < index) {
        const result = await onNext();
        stepNo = currentStep + 1;
        canProceed = result === true;
      }
    }
    if (canProceed) {
      onStepChange(stepNo);
    }

  }
  return (
    <Stack tokens={{ childrenGap: 20 }} className={`stepper-container ${className || ""}`}>
      <Stack horizontal verticalAlign="center" className="stepper-header">
        {steps.map((step, index) => (
          <Stack key={index} horizontal verticalAlign="center">
            <div className="step-container">
              {React.createElement(step.icon, {
                className: "step-icon",
                style: { color: getIconColor(index) },
              })}
              <div
                className="step-circle-container"
                onClick={() => busFunction(index)}
              >
                {index > 0 && (
                  <div
                    className="step-line left"
                    style={{ backgroundColor: getLineColor(index) }}
                  />
                )}
                <div
                  className="step-circle"
                  style={{ backgroundColor: getCircleColor(index) }}
                >
                  {step.number}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className="step-line right"
                    style={{ backgroundColor: getLineColor(index + 1) }}
                  />
                )}
              </div>
              <Text
                variant="mediumPlus"
                className="step-label"
                style={{ color: getLabelColor(index) }}
              >
                {step.label}
              </Text>
            </div>
          </Stack>
        ))}
      </Stack>

      <div className="tab-content">
        <div className="stepper-form-root">
          <div className="stepper-heading">{steps[currentStep].label}</div>
          <div className="stepper-body custom-scrollbar">
            {tabContents[currentStep]}
          </div>
        </div>
      </div>

      <Stack horizontal horizontalAlign="space-between" className="button-container">
        {extraBtn?.map((btn, index) => {
          return btn;
        })}
        {currentStep !== 0 &&
          <CantierButton variant="standard" label="Previous"
            onClick={() => onStepChange(currentStep - 1)}
            disabled={currentStep === 0}
            style="secondary" />
        }

        {currentStep === steps.length - 1 ? (
          <CantierButton variant="standard" label="Submit" onClick={onSubmit ?? handleSubmit} />
        ) : (
          <CantierButton variant="custom" label="Next"
            onClick={async () => {
              let canProceed = true;
              if (onNext) {
                const result = await onNext();
                canProceed = result === true;
              }
              if (canProceed) {
                onStepChange(currentStep + 1);
              }
            }}
             />
        )}
      </Stack>
    </Stack>
  );
};

export default CantierStepper;
