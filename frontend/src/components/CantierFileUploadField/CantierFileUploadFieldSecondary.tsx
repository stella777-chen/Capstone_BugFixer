import React, { useState, useEffect } from "react";
import { Text, Button, Image } from "@fluentui/react-components";
import { ImageAdd24Regular, DismissCircle24Regular } from "@fluentui/react-icons";
import "./CantierFileUploadFieldSecondary.css";

interface IProps {
    label?: string;
    placeholder?: string;
    size?: "small" | "medium" | "large";
    onChange?: (files: FileList | null) => void;
    multiple?: boolean;
    accept?: string;
    value?: File | null;
}

const CantierFileUploadFieldSecondary: React.FC<IProps> = ({
    label,
    placeholder = "Click or drag file here",
    size = "medium",
    onChange,
    multiple = false,
    accept = "image/*",
    value
}) => {
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        if (!value) {
            setImagePreview(null);
        } else {
            const reader = new FileReader();
            reader.onload = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(value);
        }
    }, [value]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files[0]) {
            const file = files[0];

            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onload = () => setImagePreview(reader.result as string);
                reader.readAsDataURL(file);

                const byteReader = new FileReader();
                byteReader.onload = () => {
                    const arrayBuffer = byteReader.result as ArrayBuffer;
                    const byteArray = new Uint8Array(arrayBuffer);
                    console.log("Byte Data:", byteArray);
                };
                byteReader.readAsArrayBuffer(file);
            }

            if (onChange) onChange(files);
        }
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        if (onChange) onChange(null);
    };

    return (
        <div className="cantier-file-upload-root">
            {label && <label className="cantier-file-upload-label">{label}</label>}
            <div className="cantier-file-upload-image-container">
                <div className="cantier-file-upload-upload-container">
                    <input
                        type="file"
                        className="cantier-file-upload-input"
                        onChange={handleFileChange}
                        multiple={multiple}
                        accept={accept}
                    />
                    <ImageAdd24Regular style={{ fontSize: 32 }} />
                    <Text>{placeholder}</Text>
                </div>

                {imagePreview && (
                    <div className="cantier-file-upload-preview-container">
                        <Image src={imagePreview} className="cantier-file-upload-preview-image" alt="Preview" />
                        <Button
                            className="cantier-file-upload-remove-button"
                            icon={<DismissCircle24Regular />}
                            appearance="subtle"
                            onClick={handleRemoveImage}
                        >
                            Remove preview
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CantierFileUploadFieldSecondary;
