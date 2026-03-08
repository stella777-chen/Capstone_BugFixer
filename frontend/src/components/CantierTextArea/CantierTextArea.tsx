import React from "react";
import { Label, Textarea } from "@fluentui/react-components";
// import "./CantierTextarea.scss";
import "../../assets/styles/inputs.scss";
// import "../CantierInputFields/CantierInputFields.scss";
interface ITextAreatypes {
  label: string;
  placeholder: string;
  appearance:
    | "filled-darker"
    | "outline"
    | "filled-lighter"
    | "filled-darker-shadow"
    | "filled-lighter-shadow"
    | undefined;
  className?: string;
  id?: string;
  value: string | undefined;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  required?: boolean;
  resize?: "none" | "both" | "horizontal" | "vertical" | undefined;
  error?:string;
  name?: string;
  readonly?:boolean;
}

const CantierTextarea: React.FC<ITextAreatypes> = ({
  label,
  placeholder,
  appearance,
  className,
  id,
  value,
  onChange,
  disabled,
  required,
  resize = "none",
  readonly,
  name
}) => {
  return (
    <div className={`custom-input-container form-input-group`}>
      <Label required={required} title={label}>{label}</Label>
      <Textarea
        name={name}
        appearance={appearance}
        placeholder={placeholder}
        className={className}
        id={id}
        value={value}
        readOnly={readonly}
        onChange={onChange}
        disabled={disabled}
        resize={resize}
          autoComplete="off"
      />
    </div>
  );
};

export default CantierTextarea;
