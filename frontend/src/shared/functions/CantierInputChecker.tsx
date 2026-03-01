import CantierAutoComplete from "src/components/CantierAutoComplete/CantierAutoComplete";
import CantierInput from "../../components/CantierInputFields/CantierInputFields"
import CantierTextarea from "src/components/CantierTextArea/CantierTextArea";

export const CantierMesInputChecker = (type: string, field: any) => {

    switch (type) {
        case 'text':
        case 'number':
        case 'date':
            return <CantierInput
                id={field.id}
                label={field.label}
                appearance={field.appearance}
                value={field.value}
                onChange={field.value}
                type={type}
            />
        case 'autocomplete':
            return <CantierAutoComplete
                // id={field.id}
                label={field.label}
                onChange={field.onChange}
                onSearch={field.onSearch}
                options={field.options}
            />
        case 'textarea':
            return <CantierTextarea
                id={field.id}
                label={field.label}
                appearance={field.appearance}
                value={field.value}
                onChange={field.value}
                placeholder={field.placeholder}
                resize={field.resize}
            />
    }

};
