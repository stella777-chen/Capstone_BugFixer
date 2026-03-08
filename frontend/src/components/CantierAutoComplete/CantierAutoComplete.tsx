import React, { useEffect, useState } from "react";
import { Combobox, Option, Spinner, Label } from "@fluentui/react-components";
// import "./CantierAutoComplete.scss";
import "../../assets/styles/inputs.scss";
import useDebounce from './useDebounce';

export interface AutoCompleteOption {
  id: string | number;
  label: string;
}

interface CantierAutoCompleteProps {
  label: string;
  value?: string | number | null;
  options: AutoCompleteOption[];
  onChange: (selected: AutoCompleteOption | any) => void;
  onSearch: (term: string) => void;
  onInputChange?: (term: string) => void;
  loading?: boolean;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  readOnly?: boolean;
  limit?: number;
  isMultiple?: boolean;
  multipleSelected?: AutoCompleteOption[];
  setMultipleSelected?: React.Dispatch<React.SetStateAction<AutoCompleteOption[]>>;
  canType?: boolean;
}

const CantierAutoComplete: React.FC<CantierAutoCompleteProps> = ({
  label,
  value = "",
  options = [],
  onChange,
  onSearch,
  onInputChange,
  loading = Array.isArray(options) && options.length > 0
    ? options?.some((option) => option.label === "loading")
    : false,
  required = false,
  placeholder = "Select...",
  disabled = false,
  id,
  className = "",
  readOnly = false,
  limit = 15,
  isMultiple = false,
  multipleSelected,
  setMultipleSelected,
  canType = true
}) => {

  const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined); // Initialize with value or empty string
  const debouncedInputValue = useDebounce(searchTerm || "", 300);
  const [instanceKey, setInstanceKey] = useState(0);

  const fetchSearchResults = (term: string) => {
    if (term === "") return;
    const trimmed = term.trim();
    // Check if term is more than 3 characters
    if (trimmed.length > 10) return;
    // Check if all characters are the same (e.g., "aaaa", "bbb")
    const isRepeatedChar = /^([a-zA-Z0-9])\1+$/.test(trimmed);
    if (isRepeatedChar) return;
    const filteredResults = options?.find(
      (item) => item.label.toLowerCase() === trimmed.toLowerCase()
    );
    if (filteredResults) return;
    onSearch(trimmed);
  };

  useEffect(() => {
    if (!loading) {
      fetchSearchResults(debouncedInputValue);
    }
  }, [debouncedInputValue]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    if (onInputChange) {
      onInputChange(term);
    }

    setSearchTerm(term);
  };
  const prevValueRef = React.useRef(value);

  useEffect(() => {

    if ((prevValueRef.current && !value) || value === "") {
      setSearchTerm("");
    }
    prevValueRef.current = value;
  }, [value]);
  useEffect(() => {
    if (value === null || value === "") {
      setSearchTerm("");
      setInstanceKey(prev => prev + 1);
    } else if (typeof value === "string") {
      setSearchTerm(value);
    } else {
      setSearchTerm(String(value));
    }
  }, [value]);

  // Handle option selection
  const handleOptionSelect = (
    _: unknown,
    data: { optionValue: string | undefined }
  ) => {
    // This might be triggered when the clear button is clicked
    if (data?.optionValue === undefined) {
      setSearchTerm(""); // Reset search term when nothing is selected
      onChange(null); // Pass null instead of searchTerm when clearing
      return;
    }

    if (Number(data.optionValue) < 0) return;

    const selected =
      options?.find((opt) => opt.id.toString() === data.optionValue) ?? null;
    setSearchTerm(selected?.label ?? "");
    onChange(selected);
  };

  const handleMultiOptionSelect = (_: unknown, data: { optionValue: string | undefined }) => {
    if (!data.optionValue) return;
    if (!setMultipleSelected) return;

    const item = options.find(o => o.id.toString() === data.optionValue);
    if (!item) return;

    let updated;

    // Convert both IDs to strings for comparison to handle both number and string IDs
    if (multipleSelected?.some(x => x.id.toString() === item.id.toString())) {
      updated = multipleSelected.filter(x => x.id.toString() !== item.id.toString());
    } else {
      updated = [...multipleSelected ?? [], item];
    }

    setMultipleSelected(updated);
    // Don't update searchTerm for multiselect - it interferes with checkbox functionality
    // setSearchTerm(updated.map(x => x.label).join(", "));
    onChange(updated);
  };

  return (
    <div className={`${className}custom-input-container form-input-group`}>
      <Label required={required} title={label}>{label}</Label>
      <div className={"auto-complete-box"}>
        <Combobox
          id={id}
          key={instanceKey}
          className="auto-complete-combobox"
          placeholder={placeholder}
          readOnly={readOnly}
          value={searchTerm} // Always use searchTerm for value
          onOptionSelect={isMultiple ? handleMultiOptionSelect : handleOptionSelect}
          onChange={handleInputChange}
          appearance="filled-darker"
          clearable
          disabled={disabled}
          onKeyDown={(e) => {
            if(!canType){
              e.preventDefault();
            }
          }}
          onFocus={() => {
            if (options.length >= 0 && debouncedInputValue === "") {
              onSearch("");
            } else {
              return;
            }
          }}
          autoComplete="off"
          multiselect={isMultiple}
          selectedOptions={multipleSelected?.map(item => item.id.toString())}
        >
          {loading ? (
            <Spinner size="tiny" style={{ right: 50 }} />
          ) : Array.isArray(options) && options.length > 0 ? (
            options.slice(0, limit ?? 15).map((opt) => (
              <Option key={opt.id} value={opt.id.toString()} disabled={opt.id === "no-data"}>
                {opt.label}
              </Option>
            ))
          ) : <Option key={"no-data"} value={"no-data"} disabled={true}>
            {"No Option available"}
          </Option>}
        </Combobox>
      </div>
    </div>
  );
};

export default CantierAutoComplete;
