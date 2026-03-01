import React, { useEffect, useState } from "react";
import {
  ArrowDownRegular,
  ChevronLeftRegular,
  ChevronRightRegular,
  DeleteRegular,
  EditRegular,
  EyeRegular,
  MoreHorizontalRegular,
} from "@fluentui/react-icons";
import {
  Avatar,
  Button,
  Checkbox,
  DialogTrigger,
  InputOnChangeData,
  makeStyles,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  PresenceBadgeStatus,
  SearchBoxChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableCellLayout,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@fluentui/react-components";

import "./style.css";
import CantierGridHeader from "./CantierGridHeader";
import CantierFormGridHeader from "./Pages/CantierFormGridHeader";

const useStyles = makeStyles({
  checkbox: {
    "& input[type='checkbox']:checked + div": {
      backgroundColor: "var(--color-primary)",
    },
  },
  descriptionCell: {
    width: "16.66%",
    maxWidth: "16.66%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  iconContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  icon: {
    fontSize: "16px",
    width: "16px",
    height: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

export type TableProps = {
  isTableHeader?: boolean;
  headerTitle?: string;
  isSearch?: boolean;
  headerBtn?: React.ReactNode;
  onSearch?: (event: SearchBoxChangeEvent, data: InputOnChangeData) => void;
};

type MenuOption = {
  id: number;
  text: string;
  onClick: (row: RowData) => void;
};

// Define types for enhanced cell content
interface AvatarConfig {
  name: string;
  status?: PresenceBadgeStatus; // 'available', 'busy', 'away', 'offline', etc.
}

interface IconConfig {
  label?: string;
  icon: JSX.Element; // React element for the icon
}

// Define a type for the row data
export interface RowData {
  id: number | string;
  [key: string]: unknown;
}

export interface Column<T = any> {
  header: string;
  key: string;
  secondaryKey?: string; // New property for accessing nested objects
  class?: string;
  isCheckable?: boolean;
  cell?: (row: T) => React.ReactNode;
  istitle?: boolean;
  titleMsg?: string;
  // Avatar rendering properties
  renderAsAvatar?: boolean;
  avatarNameKeys?: string[]; // Array of keys to combine for avatar name
  statusKey?: string; // Key to use for presence status from row data
  // Icon rendering
  renderWithIcon?: boolean;
}

interface IFPageinationData {
  rowsPerPage: number;
  currentPage: number;
}

interface DataGridProps {
  data: RowData[];
  columns: Column[];
  getChecked?: React.Dispatch<React.SetStateAction<(number | string)[]>>;
  getEdit?: (row: RowData) => void;
  getDelete?: (row: RowData) => void;
  tableHeader?: TableProps;
  formHeader?: {
    headerBtn?: React.ReactNode;
  };
  isMenu?: boolean;
  menuOptions?: MenuOption[];
  enablePagination?: boolean;
  itemsPerPage?: number;
  setPaginationData?: React.Dispatch<React.SetStateAction<IFPageinationData>> | undefined;
  getRowStyle?: (row: RowData) => React.CSSProperties;
}
// Enhanced function to get nested property value
const getNestedValue = (
  obj: Record<string, any>,
  key: string,
  secondaryKey?: string
): unknown => {
  const primaryValue = obj[key];

  // If there's no secondary key or the primary value isn't an object, return the primary value
  if (!secondaryKey || typeof primaryValue !== 'object' || primaryValue === null) {
    return primaryValue;
  }

  // Access the nested property
  return primaryValue[secondaryKey];
};

// Helper function to create avatar name from row data using specified keys
const createAvatarNameFromRow = (row: RowData, keys: string[] | undefined): string => {
  // Default to the key of the column if no keys are specified
  if (!keys || keys.length === 0) {
    return String(row.id);
  }

  // Combine all specified keys with spaces in between
  return keys
    .map(key => {
      const value = row[key];
      return value !== null && value !== undefined ? String(value).trim() : '';
    })
    .filter(value => value)
    .join(' ');
};

// Wrap the icon to ensure consistent sizing
const wrapIconWithConsistentSize = (icon: JSX.Element, classes: Record<string, string>): JSX.Element => {
  return (
    <span className={classes.icon}>
      {React.cloneElement(icon, {
        style: {
          width: '16px',
          height: '16px',
          fontSize: '16px'
        }
      })}
    </span>
  );
};

// Helper function to safely render cell content - Updated with avatar and icon support
const renderCellContent = (value: unknown, column?: Column, row?: RowData, classes?: Record<string, string>): React.ReactNode => {
  if (value === null || value === undefined) {
    return "";
  }

  if (React.isValidElement(value)) {
    // Apply consistent sizing to icon elements
    if (classes && value.type && typeof value.type !== 'string' && value.type.name && value.type.name.includes('Regular')) {
      return wrapIconWithConsistentSize(value, classes);
    }
    return value;
  }

  // Auto-generate avatar if renderAsAvatar is true and row is provided
  if (column?.renderAsAvatar && row) {
    // Check if the value is already an AvatarConfig object
    if (typeof value === "object" && value !== null && 'name' in value) {
      const avatarConfig = value as AvatarConfig;
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar
            aria-label={avatarConfig.name}
            name={avatarConfig.name}
            badge={avatarConfig.status ? { status: avatarConfig.status } : undefined}
            size={24} // Consistent size for avatar
          />
          <span>{avatarConfig.name}</span>
        </div>
      );
    } else {
      // Create avatar from row data using specified keys or column key
      const avatarName = createAvatarNameFromRow(row, column.avatarNameKeys || [column.key]);
      const displayValue = column.key ? String(row[column.key] || '') : avatarName;

      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar
            aria-label={avatarName}
            name={avatarName}
            size={24} // Consistent size for avatar
            badge={
              // If status is provided in row data at specified statusKey, use it
              column.statusKey && row[column.statusKey]
                ? { status: row[column.statusKey] as PresenceBadgeStatus }
                : undefined
            }
          />
          <span>{displayValue}</span>
        </div>
      );
    }
  }

  // Handle icon rendering
  if (column?.renderWithIcon && typeof value === "object" && value !== null && classes) {
    const iconConfig = value as IconConfig;

    // Check if icon is a valid JSX element
    if (React.isValidElement(iconConfig.icon)) {
      return (
        <div className={classes.iconContainer}>
          {wrapIconWithConsistentSize(iconConfig.icon, classes)}
          {iconConfig.label ? <span>{iconConfig.label}</span> : null}
        </div>
      );
    }
  }

  if (typeof value === "object") {
    // Check for avatar object pattern: { name: "Name" }
    if (value !== null && 'name' in value && Object.keys(value).length === 1) {
      return (value as { name: string }).name;
    }
    return JSON.stringify(value);
  }

  // Convert to string for display
  return String(value);
};

const CantierDataGrid: React.FC<DataGridProps> = ({
  data,
  columns,
  getChecked,
  getEdit,
  getDelete,
  tableHeader = {},
  formHeader,
  isMenu,
  menuOptions,
  enablePagination = false,
  itemsPerPage = 10,
  setPaginationData,
  getRowStyle,
}) => {
  const {
    isTableHeader = false,
    headerTitle = "",
    isSearch = false,
    headerBtn,
    onSearch,
  } = tableHeader;

  const classes = useStyles();
  const [selectedItems, setSelectedItems] = useState<(number | string)[]>([]);
  const [hoveredRow, setHoveredRow] = useState<number | string | null>(null);
  const [hoveredHeader, setHoveredHeader] = useState<boolean>(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(itemsPerPage);

  // Set default empty array in case data is undefined
  const safeData = Array.isArray(data) ? data : [];

  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;

  const currentItems = enablePagination
    ? safeData.slice(indexOfFirstItem, indexOfLastItem)
    : safeData;

  const totalPages = Math.ceil(safeData.length / rowsPerPage);

  const handleCheckboxChange = (itemId: number | string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleSelectAllChange = () => {
    setSelectedItems(selectedItems.length === data.length ? [] : data.map((item) => item.id));
  };

  useEffect(() => {
    if (getChecked) {
      getChecked(selectedItems);
    }
  }, [selectedItems, getChecked]);

  // Reset to first page when data changes
  // useEffect(() => {
  //   setCurrentPage(1);
  // }, [data]);
  
  const handlePaginationOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRowsPerPage = Number(e.target.value);
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
 
    if (setPaginationData) {
      setPaginationData({
        rowsPerPage: newRowsPerPage,
        currentPage: 0,
      });
    }
  };
  const handlePageChange = (action: string) => {
    let newPage = currentPage;
  
    if (action === "prev" && currentPage > 1) {
      newPage = currentPage - 1;
    } else if (action === "next" && currentPage < totalPages) {
      newPage = currentPage + 1;
    }
  
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
  
      if (setPaginationData) {
        setPaginationData({
          rowsPerPage: rowsPerPage,
          currentPage: newPage,
        });
      }
    }
  };
  
  
  // Function to get cell value with support for nested objects
  const getCellValue = (row: RowData, column: Column): unknown => {
    if (column.cell) {
      return column.cell(row);
    }

    return getNestedValue(row as Record<string, any>, column.key, column.secondaryKey);
  };

  // Function to get title value for tooltip
  const getTitleValue = (row: RowData, column: Column): string | undefined => {
    if (!column.istitle) return undefined;
    if (column.titleMsg) return column.titleMsg;

    const value = getNestedValue(row as Record<string, any>, column.key, column.secondaryKey);
    return value !== null && value !== undefined ? String(value) : undefined;
  };

  return (
    <div className="datagrid_container">
      {/* Form Header with right-aligned button */}
      {formHeader && (
        <div
          className="formHeader_wrapper"
        >
          <CantierFormGridHeader
            headerBtn={
              <div
                className="formHeader_btn"
              >
                {formHeader.headerBtn}
              </div>
            }
          />
        </div>
      )}

      {isTableHeader && (
        <CantierGridHeader
          headerTitle={headerTitle}
          isSearch={isSearch}
          headerBtn={headerBtn}
          onSearch={onSearch}
        />
      )}

      <div className="responsive_table">
        <Table
          aria-label="Editable table"
          className="data_table"
        >
          <TableHeader>
            <TableRow>
              {columns?.map((col, index) => (
                <TableHeaderCell
                  key={col.key}
                  className={`${col.class === "descriptionCell" ? "descriptionCell" : ""
                    } ${hoveredHeader ? "headerHovered" : ""}`}
                  onMouseEnter={() => setHoveredHeader(true)}
                  onMouseLeave={() => setHoveredHeader(false)}
                >
                  {index === 0 && (
                    <Checkbox
                      className="customCheckbox"
                      checked={
                        Array.isArray(data) &&
                        selectedItems.length === data.length &&
                        data.length > 0
                      }
                      onChange={handleSelectAllChange}
                    />
                  )}
                  {col.header} <ArrowDownRegular />
                </TableHeaderCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="noData"
                >
                  No Data Available
                </TableCell>
              </TableRow>
            ) : (
              currentItems?.map((row: RowData, rowIndex) => (
                <TableRow
                  key={row?.id || rowIndex}
                  onMouseEnter={() => setHoveredRow(row?.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    backgroundColor: "inherit",
                    ...(getRowStyle ? getRowStyle(row) : {}), // <-- Apply custom styles
                  }}
                >
                  {columns?.map((col, colIndex) => (
                    <React.Fragment key={col.key}>
                      {colIndex === 0 ? (
                        <TableCell
                          className={`${col.class} checkbox_td`}
                        >
                          <Checkbox
                            className="customCheckbox"
                            checked={selectedItems.includes(row?.id)}
                            onChange={() => handleCheckboxChange(row?.id)}
                          />
                          <TableCellLayout>
                            {renderCellContent(getCellValue(row, col), col, row, classes)}
                          </TableCellLayout>

                          {hoveredRow === row.id && (
                            <div
                              className="rowActions"
                            >
                              {getEdit && (
                                <Button
                                  icon={<EditRegular />}
                                  onClick={() => getEdit(row)}
                                  className="actionBtn"
                                />
                              )}
                              {getDelete && (
                                <DialogTrigger disableButtonEnhancement>
                                  <Button
                                    icon={<DeleteRegular />}
                                    onClick={() => getDelete(row)}
                                    className="actionBtn"
                                  />
                                </DialogTrigger>
                              )}
                              {isMenu && menuOptions && (
                                <Menu>
                                  <MenuTrigger disableButtonEnhancement>
                                    <Button
                                      icon={<MoreHorizontalRegular />}
                                      className="actionBtn"
                                    />
                                  </MenuTrigger>

                                  <MenuPopover>
                                    <MenuList>
                                      {menuOptions.map(
                                        (
                                          val: MenuOption,
                                        ) => {
                                          const {
                                            text,
                                            onClick,
                                            id,
                                          } = val;
                                          return (
                                            <MenuItem
                                              key={id}
                                              icon={<EyeRegular />}
                                              onClick={() => onClick(row)}
                                            >
                                              {text}
                                            </MenuItem>
                                          );
                                        },
                                      )}
                                    </MenuList>
                                  </MenuPopover>
                                </Menu>
                              )}
                            </div>
                          )}
                        </TableCell>
                      ) : (
                        <TableCell
                          key={col.key}
                          className={
                            col.class
                              ? classes[col.class as keyof typeof classes]
                              : ""
                          }
                          title={getTitleValue(row, col)}
                        >
                          {renderCellContent(getCellValue(row, col), col, row, classes)}
                        </TableCell>
                      )}
                    </React.Fragment>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {enablePagination && currentItems?.length !== 0 && (
        <div className="paginationContainer">
          <div className="pagination_wrapper">
            <div className="paginationSelect_wrapper">
              <label>Rows per page:</label>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  handlePaginationOnChange(e)
                }}
                className="paginationSelect"
              >
                {[10, 20, 50, 100].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>
            <div className="paginationBtn_wrapper">
              <ChevronLeftRegular
                className={`${currentPage === 1 ? "paginationBtnDisabled" : ""
                  } paginationBtn`}
                onClick={() =>{
                  // currentPage > 1 && setCurrentPage(currentPage - 1);
                  handlePageChange("prev");
                }
                }
              />
              <span className="pagnationInfo">
                {currentPage} / {totalPages}
              </span>
              <ChevronRightRegular
                className={`${currentPage === totalPages ? "paginationBtnDisabled" : ""

                  } paginationBtn`}
                onClick={() =>{
                  // currentPage < totalPages && setCurrentPage(currentPage + 1)
                  handlePageChange("next");
                }
                  
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CantierDataGrid;
