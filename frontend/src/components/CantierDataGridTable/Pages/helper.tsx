const statusStyles = {
  Active: { color: "#139D8D" },
  Inactive: { color: "#E36970" },
  Inprogress: { color: "#136D9D" },
  Hold: { color: "#FF8F00" }
};
type StatusKey = keyof typeof statusStyles;
type FileTypes = { label: string, code: string }
export interface ISamleData {
  id: number,
  file: FileTypes,
  column3: string
  status: string
  dateTime: string
  description: string
}
interface Column {
  header: string;
  key: string;
  class?: string;
  isCheckable?: boolean;
  istitle?:boolean;
  titleMsg?:string;
  cell?: ((row: ISamleData) => React.ReactNode)
}

export const formatDateTime = (dateTimeStr: string) => {
  const date = new Date(dateTimeStr);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};
export const data = [
  {
    id: 1,
    file: { label: "Text", code: "Code" },
    column3: "Data 1",
    status: "Active",
    dateTime: "2025-02-15 09:30:45",
    description: "This is a description for item 1. It contains more text to demonstrate overflow handling."
  },
  {
    id: 2,
    file: { label: "Text", code: "Code" },
    column3: "Data 2",
    status: "Inactive",
    dateTime: "2025-02-16 14:22:10",
    description: "Item 2 description with additional information about this specific record."
  },
  {
    id: 3,
    file: { label: "Text", code: "Code" },
    column3: "Data 3",
    status: "Active",
    dateTime: "2025-02-17 11:05:33",
    description: "Detailed notes about item 3 with relevant context and background information."
  },
  {
    id: 4,
    file: { label: "Text", code: "Code" },
    column3: "Data 4",
    status: "Inprogress",
    dateTime: "2025-02-18 16:45:22",
    description: "Item 4 has this descriptive text explaining its purpose and usage."
  },
  {
    id: 5,
    file: { label: "Text", code: "Code" },
    column3: "Data 5",
    status: "Active",
    dateTime: "2025-02-19 08:15:50",
    description: "A comprehensive description for item 5 with all necessary details for reference."
  },
  {
    id: 6,
    file: { label: "Text", code: "Code" },
    column3: "Data 6",
    status: "Hold",
    dateTime: "2025-02-20 13:40:18",
    description: "Item 6 description containing information about its status and properties."
  },
  {
    id: 7,
    file: { label: "Text", code: "Code" },
    column3: "Data 7",
    status: "Active",
    dateTime: "2025-02-21 10:25:59",
    description: "Final description for item 7 with an overview of its main features and functionality."
  },
];


export const columns: Column[] = [
  {
    header: "Name",
    key: "file",
    class: "tableCell",
    isCheckable: true,
    cell: (row: ISamleData) => {
      return <span className="text-blue-500">{row.file.label}</span>
    }
  },
  {
    header: "Code",
    key: "code",
    class: "tableCell",
    isCheckable: true,
    cell: (row: ISamleData) => {
      return <span className="text-blue-500">{row.file.code}</span>
    }
  },
  {
    header: "Column 3",
    key: "column3",
    class: "tableCell",
  },
  {
    header: "Status",
    key: "status",
    class: "tableCell",
    cell: (row: ISamleData) => {
      const value = row.status;
      return (
        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              width: "1vh",
              height: "1vh",
              borderRadius: "50%",
              backgroundColor: statusStyles[value as StatusKey].color,
            }}
          ></span>
          {value}
        </span>
      )
    }
  },
  {
    header: "Date & Time",
    key: "dateTime",
    class: "tableCell",
    cell: (row: ISamleData) => <span className="text-blue-500">{formatDateTime(row.dateTime)}</span>,
  },
  {
    header: "Description",
    key: "description",
    class: "descriptionCell",
    istitle:true,
  },
];