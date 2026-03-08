import React from "react";
import { Label, Input, Tooltip, Button, Spinner } from "@fluentui/react-components";
// import "./CantierInputFields.scss";
import "../../assets/styles/inputs.scss";
import { BarcodeScanner24Regular } from "@fluentui/react-icons";

export type IInputTypes =
    "number"
  | "search"
  | "text"
  | "email"
  | "password"
  | "tel"
  | "url"
  | "date"
  | "datetime-local"
  | "month"
  | "time"
  | "week"
  | undefined;
  
interface ICustomInputTypes {
  label: string;
  placeholder?: string;
  appearance:
  | "filled-darker"
  | "outline"
  | "underline"
  | "filled-lighter"
  | "filled-darker-shadow"
  | "filled-lighter-shadow"
  | undefined;
  className?: string;
  id?: string;
  type?: IInputTypes;
  value: any;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  readonly?: boolean;
  onKeyPress?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  icon?: JSX.Element;
  onIconClick?: () => void;
  name?: string;
  maxLength?: number;
  min?: string;
  iconElement?: React.ReactNode;
  iconTooltip?: string;
  isLoading?: boolean; // controls spinner
  animateIcon?: boolean;
  max?: string;

}
const CantierInput: React.FC<ICustomInputTypes> = ({
  label,
  placeholder = "Enter Value",
  appearance = "filled-darker",
  className,
  id,
  type = "text",
  value,
  onChange,
  onKeyPress,
  disabled,
  required,
  readonly,
  icon,
  name,
  maxLength,
  min,
  max,
  iconElement,
  iconTooltip = "Action",
  animateIcon,
  isLoading,
  onIconClick,
}) => {
  const barcodeIcon = iconElement ?? <BarcodeScanner24Regular />;
  return (
    <>
      <div className={`custom-input-container form-input-group`}>
        <Label required={required} title={label}>{label}</Label>
        <Input
          placeholder={placeholder}
          appearance={appearance}
          className={className}
          required={required}
          onKeyPress={onKeyPress}
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          readOnly={readonly}
          name={name}
          maxLength={maxLength ?? 60}
          min={min}
          max={max}
          contentAfter={
              onIconClick ? (
                <Tooltip content={iconTooltip} relationship="label">
                  <Button
                    appearance="subtle"
                    onClick={onIconClick}
                    icon={
                      isLoading ? (
                        <Spinner size="tiny" />
                      ) : (
                        <BarcodeScanner24Regular className={animateIcon ? "pulse-animation" : ""} />
                      )
                    }
                    disabled={disabled}
                  />
                </Tooltip>
              ) : undefined
            }
            autoComplete="off"
        />
      </div>
    </>
  );
};

export default CantierInput;
