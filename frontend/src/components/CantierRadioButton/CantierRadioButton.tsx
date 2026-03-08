import React from "react";
import { Radio, RadioGroup, Field, Label } from "@fluentui/react-components";

export interface CantierRadioButtonOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface CantierRadioButtonGroupProps {
  options: CantierRadioButtonOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  direction?: "horizontal" | "vertical";
  disabled?: boolean;
  labelIsBold?: boolean;
  required?: boolean;
}

const CantierRadioButtonGroup: React.FC<CantierRadioButtonGroupProps> = ({
  options,
  value,
  onChange,
  label,
  direction = "horizontal",
  disabled = false,
  labelIsBold,
  required
}) => {
  return (
    <div className={`custom-input-container form-input-group`}>
      <Label required={required} title={label} style={{ fontWeight: labelIsBold ? "bold" : "normal" }}>{label}</Label>
      <RadioGroup
        layout={direction}
        value={value}
        required={required}
        onChange={(_, data) => onChange(data.value)}
        style={{ gap: "1rem" }}
      >
        {options.map((option) => (
          <Radio
            key={option.value}
            label={option.label}
            value={option.value}
            disabled={disabled || option.disabled}
          />
        ))}
      </RadioGroup>
    </div>
  );
};

export default CantierRadioButtonGroup;
