import React, { useState } from "react";
import { makeStyles, Text, Button, Image } from "@fluentui/react-components";
import {
  ImageAdd24Regular,
  DismissCircle24Regular,
  DocumentFolderRegular,
} from "@fluentui/react-icons";
import { MessageBar, MessageBarType } from "@fluentui/react";
import Papa from "papaparse";

interface IProps {
  label?: string;
  placeholder: string;
  onChange: (files: FileList | null) => void;
  multiple?: boolean;
  fileType: ".jpg" | ".pdf" | ".txt" | ".csv" | ".prn" | ".xlsx,.xls,.csv" | "allTypes";
}

interface FilePreview {
  name: string;
  type: string;
  src: string | null;
  csvData?: string[][];
}

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    padding: "5px",
  },
  label: {
    fontSize: "2vh",
    fontWeight: "500",
    marginBottom: "1vh",
  },
  uploadContainer: {
    backgroundColor: "#f5f5f5",
    border: "2px dashed #d1d1d1",
    padding: "8vh",
    borderRadius: "4px",
    textAlign: "center",
    position: "relative",
    cursor: "pointer",
    transition: "background-color 0.3s ease, border-color 0.3s ease",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    ":hover": {
      backgroundColor: "#ffffff",
      border: "2px dashed var(--color-accent)",
    },
  },
  uploadIcon: {
    fontSize: "48px",
    marginBottom: "10px",
    color: "#666",
  },
  placeholderText: {
    fontSize: "16px",
    color: "#666",
  },
  fileInput: {
    opacity: 0,
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    cursor: "pointer",
  },
  previewContainer: {
    marginTop: "10px",
    display: "flex",
    gap: "10px",
  },
  previewItem: {
    backgroundColor: "#fff",
    padding: "1vh",
    border: "1px solid #d1d1d1",
    borderRadius: "4px",
    position: "relative",
    overflow: "hidden",
    width: "100%",
  },
  previewImage: {
    width: "100%",
    height: "50vh",
    objectFit: "cover",
    borderRadius: "4px 4px 0 0",
  },
  previewText: {
    fontSize: "0.9rem",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: "5px",
    maxWidth: "90%",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  previewIframe: {
    width: "100%",
    height: "70vh",
    border: "none",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    maxHeight: "400px",
    overflowY: "auto",
    display: "block",
  },
  tableCell: {
    border: "1px solid #ddd",
    padding: "8px",
  },
  removeButton: {
    marginTop: "10px",
    backgroundColor: "var(--color-accent)",
    color: "#fff",
    textAlign: "center",
    padding: "10px",
    borderRadius: "4px",
    cursor: "pointer",
  },
  containerButton: {
    textAlign: "center",
  },
  fileTypeLabel: {
    backgroundColor: "#f5f5f5",
    padding: "5px 10px",
    borderRadius: "4px",
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "10px",
    display: "inline-block",
  },
});

const CantierFileUploadField: React.FC<IProps> = ({
  label = "Selected All Files",
  placeholder = "Click or drag files here",
  onChange,
  multiple = false,
  fileType,
}) => {
  const styles = useStyles();
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = event.target.files;
      if (!files) return;

      const newPreviews: FilePreview[] = [];

      Array.from(files).forEach((file) => {
        try {
          const fileType = file.type;
          const fileExtension = file.name.split(".").pop()?.toLowerCase();

          if (fileTypeValidation(fileType, fileExtension)) {
            // Handle PRN files
            if (fileExtension === "prn") {
              setFilePreviews((prev) =>
                multiple
                  ? [
                      ...prev,
                      {
                        name: file.name,
                        type: fileType || "application/prn",
                        src: null,
                      },
                    ]
                  : [
                      {
                        name: file.name,
                        type: fileType || "application/prn",
                        src: null,
                      },
                    ]
              );
            } 
            // Handle Excel files (.xlsx, .xls)
            else if (fileExtension === "xlsx" || fileExtension === "xls") {
              setFilePreviews((prev) =>
                multiple
                  ? [
                      ...prev,
                      {
                        name: file.name,
                        type: fileType || "application/vnd.ms-excel",
                        src: null,
                      },
                    ]
                  : [
                      {
                        name: file.name,
                        type: fileType || "application/vnd.ms-excel",
                        src: null,
                      },
                    ]
              );
            }
            // Handle images
            else if (fileType.startsWith("image/")) {
              const reader = new FileReader();
              reader.onload = () => {
                setFilePreviews((prev) =>
                  multiple
                    ? [
                        ...prev,
                        {
                          name: file.name,
                          type: fileType,
                          src: reader.result as string,
                        },
                      ]
                    : [
                        {
                          name: file.name,
                          type: fileType,
                          src: reader.result as string,
                        },
                      ]
                );
              };
              reader.readAsDataURL(file);
            } 
            // Handle PDF files
            else if (fileType === "application/pdf") {
              const pdfUrl = URL.createObjectURL(file);
              newPreviews.push({
                name: file.name,
                type: fileType,
                src: pdfUrl,
              });
            } 
            // Handle text files
            else if (fileType === "text/plain" || fileExtension === "txt") {
              const reader = new FileReader();
              reader.onload = () => {
                setFilePreviews((prev) =>
                  multiple
                    ? [
                        ...prev,
                        {
                          name: file.name,
                          type: fileType,
                          src: reader.result as string,
                        },
                      ]
                    : [
                        {
                          name: file.name,
                          type: fileType,
                          src: reader.result as string,
                        },
                      ]
                );
              };
              reader.readAsText(file);
            } 
            // Handle CSV files
            else if (file.name.endsWith(".csv")) {
              const reader = new FileReader();
              reader.onload = () => {
                const textContent = reader.result as string;
                const parsed = Papa.parse(textContent, {
                  skipEmptyLines: true,
                }).data as string[][];
                setFilePreviews((prev) =>
                  multiple
                    ? [
                        ...prev,
                        {
                          name: file.name,
                          type: fileType,
                          src: null,
                          csvData: parsed,
                        },
                      ]
                    : [
                        {
                          name: file.name,
                          type: fileType,
                          src: null,
                          csvData: parsed,
                        },
                      ]
                );
              };
              reader.readAsText(file);
            }
          } else {
            throw new Error(`Invalid file type: ${file.name}`);
          }
        } catch (fileError) {
          console.error(`Error processing file ${file.name}:`, fileError);
          setErrorMessage(`Error processing file ${file.name}. Please try again.`);
        }
      });

      setFilePreviews((prev) => (multiple ? [...prev, ...newPreviews] : [...newPreviews]));

      if (onChange) onChange(files);
    } catch (error) {
      console.error("Error handling file change:", error);
      setErrorMessage("An unexpected error occurred while uploading.");
    }
  };

  const handleRemoveFile = (index: number) => {
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Utility function to validate the file type
  const fileTypeValidation = (mimeType: string, extension?: string): boolean => {
    const allowedExtensions: Record<string, string[]> = {
      ".jpg": ["image/jpeg"],
      ".pdf": ["application/pdf"],
      ".txt": ["text/plain"],
      ".csv": ["text/csv", "application/vnd.ms-excel"],
      ".prn": ["text/plain", "application/prn", "application/octet-stream"],
      ".xlsx,.xls,.csv": [
        "text/csv", 
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel.sheet.macroEnabled.12"
      ],
    };

    if (fileType === "allTypes") return true;

    // For Excel file types, check if extension is xlsx, xls, or csv
    if (fileType === ".xlsx,.xls,.csv") {
      return extension === "xlsx" || extension === "xls" || extension === "csv";
    }

    // Check if the file extension matches the selected fileType
    if (extension === fileType.replace(".", "")) return true;

    // Check if the MIME type is in the allowed list for the selected fileType
    return allowedExtensions[fileType]?.includes(mimeType) || false;
  };

  // Get accept attribute for input
  const getAcceptAttribute = (): string => {
    if (fileType === "allTypes") return "*/*";
    if (fileType === ".xlsx,.xls,.csv") return ".xlsx,.xls,.csv";
    if (fileType === ".jpg") return "image/jpeg";
    return fileType;
  };

  return (
    <div className={styles.root}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.uploadContainer}>
        <input
          type="file"
          className={styles.fileInput}
          onChange={handleFileChange}
          multiple={multiple ? true : false}
          accept={getAcceptAttribute()}
        />
        <DocumentFolderRegular className={styles.uploadIcon} />
        <Text className={styles.placeholderText}>{placeholder}</Text>
      </div>
      {errorMessage && (
        <MessageBar messageBarType={MessageBarType.error} onDismiss={() => setErrorMessage(null)}>
          {errorMessage}
        </MessageBar>
      )}
      {filePreviews.length > 0 && (
        <div className={styles.previewContainer}>
          {filePreviews.map((filePreview, index) => (
            <div key={index} className={styles.previewItem}>
              {filePreview.type.includes("prn") || filePreview.name.endsWith(".prn") ? (
                <div>
                  <div className={styles.fileTypeLabel}>PRN File</div>
                  <Text className={styles.previewText}>{filePreview.name}</Text>
                </div>
              ) : filePreview.name.endsWith(".xlsx") || filePreview.name.endsWith(".xls") ? (
                <div>
                  <div className={styles.fileTypeLabel}>
                    {filePreview.name.endsWith(".xlsx") ? "XLSX File" : "XLS File"}
                  </div>
                  <Text className={styles.previewText}>{filePreview.name}</Text>
                </div>
              ) : filePreview.csvData ? (
                <table className={styles.table}>
                  <tbody>
                    {filePreview.csvData.map((row: string[], rowIndex: number) => (
                      <tr key={rowIndex}>
                        {row.map((cell: string, cellIndex: number) => (
                          <td key={cellIndex} className={styles.tableCell}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : filePreview.type.startsWith("image/") ? (
                <Image
                  src={filePreview.src ?? undefined}
                  className={styles.previewImage}
                  alt="Preview"
                />
              ) : filePreview.type === "application/pdf" ? (
                <iframe
                  src={filePreview.src ?? undefined}
                  className={styles.previewIframe}
                  title="PDF Preview"
                />
              ) : (
                <Text className={styles.previewText}>{filePreview.src}</Text>
              )}
              <div className={styles.containerButton}>
                <Button
                  className={styles.removeButton}
                  onClick={() => handleRemoveFile(index)}
                  icon={<DismissCircle24Regular />}
                >
                  Remove Preview
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CantierFileUploadField;