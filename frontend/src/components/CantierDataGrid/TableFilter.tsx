import React, { SyntheticEvent, useState, useCallback, useMemo, useEffect } from 'react';
import CantierSliderForm from '../CantierSliderForm/CantierSliderForm';
import CantierButton from '../CantierButton/CantierButton';
import CantierAutoComplete from '../CantierAutoComplete/CantierAutoComplete';
import CantierInput, { IInputTypes } from '../CantierInputFields/CantierInputFields';
import { useMesSnackbarContext } from '../MesSnackbarStacks';
import { formatLocalDateTime, normalizeDateTime } from './helper';

interface Column {
  columnId: string;
  columnKey: string;
  type?: string;
  options?: any[];
}

interface AutoCompleteOption {
  id: number;
  label: string;
  key?: string;
  type?: string;
  options?: any[];
}

interface IFFilter {
  isSliderFormOpen: boolean;
  setIsSliderFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
  fullColumns: Column[];
  onSearch?: (searchPayload: SearchFilter[]) => void;
}

interface SearchFilter {
  columnField: string;
  operator: string;
  value: any;
}

const dropDownValueTypes = [
  "boolean",
  "enum",
  "date",
  "datetime",
  "number"
]

const TableFilter: React.FC<IFFilter> = ({ isSliderFormOpen, setIsSliderFormOpen, fullColumns, onSearch }) => {
  const { addSnack } = useMesSnackbarContext();

  const [formData, setFormData] = useState<{
    id: number;
    column: AutoCompleteOption | null;
    filter: AutoCompleteOption | null;
    value: string | number;
  }>({
    id: 0,
    column: null,
    filter: null,
    value: '',
  });

  const handleCloseFilter = useCallback((): void => {
    setIsSliderFormOpen(false);
  }, [setIsSliderFormOpen]);

  const validateForm = useCallback((): boolean => {
    const errors: { [key: string]: string } = {};
    let isValid = true;

    if (!formData.column || !formData.column.label.trim()) {
      errors.column = "Column is required";
    }

    if (formData.column?.type !== "date" && formData.column?.type !== "datetime") {
      if (!dropDownValueTypes.includes(formData?.column?.type ?? "")) {
        if (!formData.filter || !formData.filter.label.trim()) {
          errors.filter = "Filter is required";
        }
      }

      if (!dropDownValueTypes.includes(formData?.column?.type ?? "")) {
        if (
          typeof formData.value === "string"
            ? !formData.value.trim()
            : formData.value == null
        ) {
          errors.value = "Value is required";
        }
      }
    } else {
      if (!formData.value || formData.value.toString().trim() === "") {
        errors.value = "Date is required";
      }
    }

    const emptyFieldsCount = Object.keys(errors).length;
    if (emptyFieldsCount > 0) {
      isValid = false;
      if (emptyFieldsCount > 1) {
        addSnack("Multiple fields are required", "Error", "error", 2000);
      } else {
        const errorMessage = Object.values(errors)[0];
        addSnack(errorMessage, "Error", "error", 2000);
      }
    }

    return isValid;
  }, [formData, addSnack, dropDownValueTypes]);


  const handleSearch = useCallback((e?: SyntheticEvent<Element, Event>): void => {
    if (!validateForm()) return;
    const searchPayload: SearchFilter[] = [
      {
        columnField: formData.column!.key || formData.column!.label,
        operator: ( dropDownValueTypes.includes(formData.column?.type ?? "") && 
                    formData?.column?.type != "number") ? 
                    "equals" : 
                    formData.filter!.label.toLowerCase(),
        value:
          ( dropDownValueTypes.includes(formData.column?.type ?? "") && formData?.column?.type != "number" ) &&
            formData.column?.type !== "date" && formData.column?.type !== "datetime" ? 
            formData.column?.type === "boolean" ? 
            formData.filter?.id === 0 ? false : 
            true : 
            formData.filter?.id : 
            normalizeDateTime(String(formData.value), formData.column?.type
          ),
      }
    ];
    if (onSearch) {
      console.info("Search Payload:", searchPayload);
      onSearch(searchPayload);
    }
    setIsSliderFormOpen(false);
  }, [validateForm, formData, onSearch, setIsSliderFormOpen]);

  const handleClear = useCallback((e?: SyntheticEvent<Element, Event>): void => {
    setFormData({
      id: 0,
      column: null,
      filter: null,
      value: '',
    });

    const searchPayload: SearchFilter[] = [
      {
        columnField: "",
        operator: "",
        value: ""
      }
    ];
    if (onSearch) {
      onSearch(searchPayload);
    }
    setIsSliderFormOpen(false);
  }, [validateForm, formData, onSearch, setIsSliderFormOpen]);


  const columnOptions: AutoCompleteOption[] = useMemo(() =>
    fullColumns.map((col, index) => ({
      id: index + 1,
      label: col.columnId,
      key: col.columnKey,
      type: col.type,
      options: col.options
    })), [fullColumns]
  );


  const filterOptions: AutoCompleteOption[] = useMemo(() => {
    if (dropDownValueTypes.includes(formData?.column?.type ?? "")) {
      if (formData?.column?.type == "boolean") {
        return [
          { id: 1, label: 'Yes' },
          { id: 0, label: 'No' },
        ];
      }
      else if (formData?.column?.type == "number") {
        return [
          {id: 0, label: "<"},
          {id: 1, label: "<="},
          {id: 2, label: ">"},
          {id: 3, label: ">="},
          {id: 4, label: "="},
          {id: 5, label: "!="}
        ]
      } 
      else {
        return formData?.column?.options ?? []
      }
    }

    return [
      { id: 1, label: 'Contains' },
      { id: 2, label: 'Equals' },
    ];
  }, [formData?.column?.type]);

  const handleInputChange = useCallback((value: string) => {
    setFormData((prev) => ({
      ...prev,
      value,
    }));
  }, []);

  const handleAutoCompleteChange = useCallback((key: 'column' | 'filter', selected: AutoCompleteOption | null) => {
    if (key == 'column') {
      setFormData({
        id: 0,
        column: null,
        filter: null,
        value: '',
      })
    }
    setFormData((prev) => ({
      ...prev,
      [key]: selected,
    }));
  }, []);

  const FilterContent = useMemo(() => {
    return (
      <div className="row">
        <div className="col-12">
          <CantierAutoComplete
            key={formData.column?.label ?? "empty-column"}
            label="Select Column"
            value={formData.column?.label ?? ""}
            options={columnOptions}
            onChange={(selected) => handleAutoCompleteChange("column", selected)}
            onSearch={() => { }}
            required
            placeholder="Choose a column"
          />
        </div>

        {formData.column?.type === "date" || formData.column?.type === "datetime" ? (
          <div className="col-12">
            <CantierInput
              label={formData.column?.type === "date" ? "Select Date" : "Select Date & Time"}
              type={formData.column?.type === "date" ? "date" : "datetime-local"}
              placeholder="Enter Date"
              appearance="filled-darker"
              value={
                formData.value
                  ? formData.column?.type === "date"
                    ? new Date(formData.value).toISOString().split("T")[0]
                    : formatLocalDateTime(String(formData.value))
                  : ""
              }
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleInputChange(e.target.value)
              }
              required
            />

          </div>
        ) : (
          <>
            <div className="col-12">
              <CantierAutoComplete
                key={formData.filter?.label ?? "empty-filter"}
                label={
                  (!dropDownValueTypes.includes(formData.column?.type ?? "") || formData?.column?.type == "number")
                    ? "Select Filter"
                    : "Select Value"
                }
                value={formData.filter?.label ?? ""}
                options={filterOptions}
                onChange={(selected) =>
                  handleAutoCompleteChange("filter", selected)
                }
                onSearch={() => { }}
                required
                placeholder="Choose a filter"
              />
            </div>
            {(!dropDownValueTypes.includes(formData.column?.type ?? "") || formData?.column?.type == "number")&& (
              <div className="col-12">
                <CantierInput
                  required
                  label="Value"
                  placeholder="Enter value"
                  appearance="filled-darker"
                  type={(formData.column?.type as IInputTypes) ?? "text"}
                  value={formData.value?.toLocaleString?.() ?? ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange(e.target.value)
                  }
                />
              </div>
            )}
          </>
        )}
      </div>
    );
  }, [
    formData,
    columnOptions,
    filterOptions,
    handleInputChange,
    handleAutoCompleteChange,
    dropDownValueTypes,
  ]);


  const SliderActions = useMemo(() => (
    <>
      <CantierButton
        variant="standard"
        label="Clear"
        onClick={handleClear}
        style="secondary"
      />
      <CantierButton
        variant="standard"
        label="Cancel"
        onClick={handleCloseFilter}
        style="secondary"
      />
      <CantierButton
        variant="standard"
        label="Search"
        onClick={handleSearch}
      />
    </>
  ), [handleCloseFilter, handleSearch]);

  return (
    <CantierSliderForm
      title="Filter"
      open={isSliderFormOpen}
      sliderActions={SliderActions}
      onClose={handleCloseFilter}
    >
      {FilterContent}
    </CantierSliderForm>
  );
};

export default TableFilter;