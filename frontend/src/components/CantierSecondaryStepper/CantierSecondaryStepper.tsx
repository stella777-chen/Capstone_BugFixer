import React from "react";
import { Stack, Text } from "@fluentui/react";
import { TabList, Tab } from "@fluentui/react-components";
import {
  ChevronLeftFilled,
  ChevronRightFilled,
} from "@fluentui/react-icons";
import "./CantierSecondaryStepper.scss";
import CantierButton from "../CantierButton/CantierButton";
import CantierSpinner from "../CantierSpinner/CantierSpinner";

interface Step {
  number: string;
  label?: string;
  subtitle?: string;
  icon: React.ElementType;
}

interface IFCantierSecondaryStepper {
  steps: Step[];
  currentStep: number;
  onStepChange: React.Dispatch<React.SetStateAction<number>>;
  tabContents: React.ReactNode[];
  className?: string;
  onNext?: () => boolean | Promise<boolean>;
  onSubmit?: () => void;
  extraBtn?: React.ReactNode[];
  title?: string;
  subTitle?: string;
  submitLabel?: string;
  hideSubmitButton?: boolean;
  disableSubmitButton?: boolean;
  loading?: boolean;
  customInput?: React.ReactNode;
  showDefaultBtn?: boolean;
}

const CantierSecondaryStepper: React.FC<IFCantierSecondaryStepper> = ({
  steps,
  currentStep,
  onStepChange,
  tabContents,
  className,
  onNext,
  onSubmit,
  extraBtn,
  title,
  subTitle,
  submitLabel,
  hideSubmitButton = false,
  disableSubmitButton = false,
  loading = false,
  customInput,
  showDefaultBtn = true,
}) => {
  const getCircleColor = (index: number) => {
    if (index === currentStep) return "var(--color-accent)";
    if (index < currentStep) return "#78c93c";
    return "#ccc";
  };

  const getIconColor = (index: number) => {
    if (index <= currentStep) return "var(--color-primary)";
    return "#ccc";
  };

  const getLineColor = (index: number) => {
    if (index <= currentStep) return "var(--color-primary)";
    return "#ccc";
  };

  const getLabelColor = (index: number) => {
    if (index <= currentStep) return "var(--color-primary)";
    return "#ccc";
  };

  async function handleNextStep() {
    let canProceed = true;

    if (onNext) {
      const result = await onNext();
      canProceed = result === true;
    }

    if (canProceed) {
      onStepChange(currentStep + 1);
    }
  }

  function handleStepperBtn(type: "pre" | "next") {
    if (type === "pre" && currentStep > 0) {
      onStepChange(currentStep - 1);
    } else if (type === "next") {
      handleNextStep();
    }
  }

  const busFunction = async (index: number) => {
    let canProceed = true;
    let stepNo = index;
    if (onNext && currentStep < index) {
      const result = await onNext();
      stepNo = currentStep + 1;
      canProceed = result === true;
    }
    if (canProceed) {
      onStepChange(stepNo);
    }
  };

  return (
    <div className="tracktraces-container">
      <div className="stepper-container">
        <div className="info-box">
          <Text className="info-box-title">{title}</Text>
          <Text className="info-box-subtitle">{subTitle}</Text>
        </div>

        <div className="arrow-container" onClick={() => handleStepperBtn("pre")}>
          <ChevronLeftFilled className="arrow-icon" />
        </div>

        <Stack horizontal verticalAlign="center" className="stepper-stack">
          {steps.map((step, index) => (
            <Stack key={index} horizontal verticalAlign="center" className="step-wrapper">
              <div className="step-content">
                {React.createElement(step.icon, {
                  className: "step-icon",
                  style: { color: getIconColor(index) },
                })}

                <div
                  className="step-line-container"
                  style={{ ["--divider" as any]: steps.length }}
                >
                  <div className="step-line-left" style={{ backgroundColor: getLineColor(index) }} />
                  <div
                    className="step-circle"
                    onClick={() => busFunction(index)}
                    style={{ backgroundColor: getCircleColor(index) }}
                  >
                    {step.number}
                  </div>
                  <div
                    className="step-line-right"
                    style={{ backgroundColor: getLineColor(index + 1) }}
                  />
                </div>

                <div className="step-label-container">
                  <Text className="step-label" style={{ color: getLabelColor(index) }}>
                    {step.label}
                  </Text>
                  <Text
                    className="step-subtitle"
                    title={step.subtitle}
                    style={{ color: getLabelColor(index) }}
                  >
                    {step.subtitle}
                  </Text>
                </div>
              </div>
            </Stack>
          ))}
        </Stack>

        <div className="end-arrow-container" onClick={() => handleStepperBtn("next")}>
          <ChevronRightFilled className="arrow-icon" />
          <div className="end-line-placeholder"></div>
        </div>
      </div>

      <div className={`tablist-wrapper ${className || ""}`}>
        <div className="mt-1vh">
          {customInput}
        </div>
        <TabList className="tab-list" selectedValue={steps[currentStep]?.label || ""}>
          {steps.map((step, index) => (
            <Tab
              key={index}
              value={step.label}
              className={currentStep === index ? "selected-tab" : "tab"}
              onClick={() => busFunction(index)}
            >
              {step.label}
            </Tab>
          ))}
        </TabList>

        {loading ? (
          <div className="formContent flex-center">
            <CantierSpinner />
          </div>
        ) : (
          <div className="tab-content">
            <div className="stepper-form-root">
              <div className="stepper-heading">{steps[currentStep]?.label || ""}</div>
              <div className="stepper-body custom-scrollbar">{tabContents[currentStep]}</div>
            </div>
          </div>
        )}

        <Stack horizontal horizontalAlign="space-between" className="button-container">
          {/* Render extra buttons if provided */}
          {extraBtn?.map((btn, index) => btn)}

          {/* Show default buttons only if showDefaultBtn is true */}
          {showDefaultBtn && (
            currentStep === steps.length - 1 ? (
              !hideSubmitButton && (
                <CantierButton
                  variant="standard"
                  label={submitLabel ?? "Submit"}
                  onClick={onSubmit}
                  disabled={disableSubmitButton}
                />
              )
            ) : (
              <CantierButton
                variant="custom"
                label="Next"
                onClick={() => handleStepperBtn("next")}
              />
            )
          )}
        </Stack>

      </div>
    </div>
  );
};

export default CantierSecondaryStepper;
