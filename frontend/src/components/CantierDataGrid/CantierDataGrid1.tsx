import React, { useEffect, useState } from 'react';
import {
  DataGrid,
  DataGridBody,
  DataGridCell,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridRow,
  Menu,
  MenuList,
  MenuPopover,
  MenuTrigger,
  MenuItem,
  TableColumnDefinition,
  createTableColumn,
  TableCellLayout,
  Button,
  SearchBoxChangeEvent,
  InputOnChangeData,
  Avatar,
} from '@fluentui/react-components';

export interface RowData {
  id: number | string;
  [key: string]: unknown;
}
type MenuOption = {
  id: number;
  text: string;
  icon?: JSX.Element;
} & (
    | {
      onClick: (row: RowData) => void;
      subMenu?: never;
    }
    | {
      onClick?: never;
      subMenu: {
        id: number;
        text: string;
        onClick: (row: RowData) => void;
        icon?: JSX.Element;
      }[];
    }
  );
interface IFPageinationData {
  rowsPerPage: number;
  currentPage: number;
}
export interface Column<T = any> {
  header: string;
  key: string;
  secondaryKey?: string;
  class?: string;
  thclass?: string;
  isCheckable?: boolean;
  cell?: (row: T) => React.ReactNode;
  istitle?: boolean;
  titleMsg?: string;
  // Avatar rendering properties
  renderAsAvatar?: boolean;
  avatarNameKeys?: string[];
  statusKey?: string;
  renderWithIcon?: boolean;
  icon?: React.ReactNode;
  defaultWidth?: number;
  minWidth?: number;
}
type TableProps = {
  isTableHeader?: boolean;
  headerTitle?: string;
  isSearch?: boolean;
  headerBtn?: React.ReactNode;
  onSearch?: (event: SearchBoxChangeEvent, data: InputOnChangeData) => void;
};
interface DataGridProps {
  data: RowData[];
  columns: Column[];
  getChecked?: React.Dispatch<React.SetStateAction<(number | string)[]>>;
  getEdit?: (row: RowData) => void;
  getView?: (row: RowData) => void;
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
  isEdit?: boolean;
  isdelete?: boolean;
  isView?: boolean;
  isActioncolumn?: boolean;
  totalRecords?: number; // Added for server-side pagination
  serverPagination?: boolean; // Added to enable server-side pagination
}
import {
  FolderRegular,
  EditRegular,
  OpenRegular,
  DocumentRegular,
  DocumentPdfRegular,
  VideoRegular,
  DeleteRegular,
  ChevronLeftRegular,
  ChevronRightRegular,
  EyeRegular,
  MoreHorizontalRegular,
} from "@fluentui/react-icons";
// interface Column {
//   header: string;
//   key: keyof DataItem;
//   class: string;
//   isCheckable?: boolean;
//   cell?: (row: DataItem) => JSX.Element;
// }
import "./CantierDataGrid.scss";
import CantierGridHeader from './CantierGridHeader';
import CantierFormGridHeader from './Pages/CantierFormGridHeader';
import { Stack } from '@fluentui/react';
import { mapToPresenceStatus } from './helper';
import { useWindowWidth } from './helper';


const CantierDataGrid1: React.FC<DataGridProps> = ({
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
  isEdit = true,
  isdelete = true,
  getView,
  isActioncolumn = true,
  isView = true,
  totalRecords = 0, // Default to 0 if not provided
  serverPagination = false, // Default to client-side pagination
}) => {
  const {
    isTableHeader = false,
    headerTitle = "",
    isSearch = false,
    headerBtn,
    onSearch,
  } = tableHeader ?? {};

  const [selectedRowIds, setSelectedRowIds] = React.useState<number[]>([]);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(itemsPerPage);
  const refMap = React.useRef<Record<string, HTMLElement | null>>({});
  const defaultFun = () => {
    console.info("No activities called");
  }
  //Action Column
  const actionColumn: TableColumnDefinition<RowData> = createTableColumn<RowData>({
    columnId: 'actions',
    renderHeaderCell: () => (
      <TableCellLayout truncate>Actions</TableCellLayout>
    ),
    renderCell: (item) => (
      <TableCellLayout truncate>
        {isEdit && (
          <Button
            icon={<EditRegular />}
            onClick={(e) => {
              e.stopPropagation();
              getEdit ? getEdit(item) : defaultFun();
            }}
            className="actionBtn"
          />
        )}

        {isView && getView && (
          <Button
            icon={<EyeRegular />}
            onClick={(e) => {
              e.stopPropagation();
              getView(item);
            }}
            className="actionBtn"
          />
        )}

        {isdelete && (
          <Button
            icon={<DeleteRegular />}
            onClick={(e) => {
              e.stopPropagation();
              getDelete ? getDelete(item) : defaultFun();
            }}
            className="actionBtn"
          />
        )}

        {isMenu && menuOptions && (
          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <Button
                icon={<MoreHorizontalRegular />}
                className="actionBtn"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              />
            </MenuTrigger>

            <MenuPopover>
              <MenuList>
                {menuOptions.map((val: MenuOption) => {
                  const { text, onClick, id, icon } = val;
                  return (
                    <MenuItem
                      key={id}
                      icon={icon || <EyeRegular />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onClick ? onClick(item) : defaultFun();
                      }}
                    >
                      {text}
                    </MenuItem>
                  );
                })}
              </MenuList>
            </MenuPopover>
          </Menu>
        )}
      </TableCellLayout>
    ),
  });

  //Change the user Columes based on DataGrid
  const createFluentColumns = (
    cols: Column[]
  ): TableColumnDefinition<RowData>[] => {
    return cols.map((col) =>
      createTableColumn<RowData>({
        columnId: col.key as string,
        compare: (a, b) => {
          const valA = a[col.key];
          const valB = b[col.key];
          if (typeof valA === 'number' && typeof valB === 'number')
            return valA - valB;
          return String(valA).localeCompare(String(valB));
        },
        renderHeaderCell: () => (<TableCellLayout truncate className={col.thclass}>
          {col.header}
        </TableCellLayout>),
        renderCell: (item) => {
          return (
            <TableCellLayout truncate
              className={col.class}
              media={
                col.renderAsAvatar ? (
                  <Avatar
                    aria-label={String(col.cell ? col.cell(item) : item[col.key])}
                    name={String(col.cell ? col.cell(item) : item[col.key])}
                    badge={{
                      status: mapToPresenceStatus(
                        col.statusKey ? String(item[col.statusKey]) : undefined
                      ),
                    }}
                  />
                ) : col.icon && React.isValidElement(col.icon) ? (
                  col.icon
                ) : null
              }
            >
              {col.cell && col.cell(item)
                ? col.cell(item)
                : item[col.key]
                  ? <span>{item[col.key] as React.ReactNode}</span>
                  : <span>-</span>}
            </TableCellLayout>
          )
        }
      })
    );
  };

  const columnDefs = React.useMemo(() => createFluentColumns(columns), [columns]);
  //Adding modifiyed column with action column
  const fullColumns: TableColumnDefinition<RowData>[] = [
    ...columnDefs,
    ...(isActioncolumn ? [actionColumn] : []),
  ];
  //column resize


  const colSize = (columnCount: number): number => {
    const screenWidth = window.innerWidth;
    const maxTableWidth = screenWidth * 0.6;

    if (columnCount < 6) {
      return Math.floor(maxTableWidth / columnCount);
    } else {
      return Math.floor(maxTableWidth / 4);
    }
  };

  const windowWidth = useWindowWidth();

  const columnSizingOptions = React.useMemo(
    () =>
      columns.reduce((acc, col) => {
        acc[col.key] = {
          defaultWidth: col.defaultWidth || colSize(columns.length),
          minWidth: col.minWidth || 100,
        };
        return acc;
      }, {} as Record<string, any>),
    [columns, windowWidth]
  );

  //get check box 
  useEffect(() => {
    if (getChecked) {
      getChecked(selectedRowIds);
    }
  }, [selectedRowIds, getChecked]);

  //pageination part
  const safeData = Array.isArray(data) ? data : [];

  // Updated pagination logic to handle both client-side and server-side pagination
  let currentItems: RowData[];
  let totalPages: number;
  let actualTotalRecords: number;

  if (serverPagination) {
    // For server-side pagination, use all the data as it's already paginated
    currentItems = safeData;
    actualTotalRecords = totalRecords || 0;
    totalPages = Math.ceil(actualTotalRecords / rowsPerPage);
  } else {
    // For client-side pagination, slice the data
    const indexOfLastItem = currentPage * rowsPerPage;
    const indexOfFirstItem = indexOfLastItem - rowsPerPage;
    currentItems = enablePagination ? safeData.slice(indexOfFirstItem, indexOfLastItem) : safeData;
    actualTotalRecords = safeData.length;
    totalPages = Math.ceil(safeData.length / rowsPerPage);
  }

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
          currentPage: newPage - 1, // Convert to 0-based for parent component
        });
      }
    }
  };

  // Calculate the display range for pagination info
  const getDisplayRange = () => {
    if (serverPagination) {
      const start = (currentPage - 1) * rowsPerPage + 1;
      const end = Math.min(currentPage * rowsPerPage, actualTotalRecords);
      return { start, end };
    } else {
      const start = (currentPage - 1) * rowsPerPage + 1;
      const end = Math.min(currentPage * rowsPerPage, actualTotalRecords);
      return { start, end };
    }
  };

  const { start, end } = getDisplayRange();

  return (
    <Stack className='datagrid_container'>
      {formHeader && (
        <div className="formHeader_wrapper">
          <CantierFormGridHeader
            headerBtn={
              <div className="formHeader_btn" >
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
      <Stack className='responsive_table custom-scrollbar'>
        <DataGrid
          items={currentItems}
          columns={fullColumns}
          sortable
          selectionMode="multiselect"
          resizableColumns
          columnSizingOptions={columnSizingOptions}
          resizableColumnsOptions={{ autoFitColumns: false }}
          getRowId={(item) => String(item.id)}
          onSelectionChange={(e, { selectedItems }) => {
            const numericIds = Array.from(selectedItems).map((id) => Number(id));
            setSelectedRowIds(numericIds);
          }}
        >
          <DataGridHeader>
            <DataGridRow
              selectionCell={{
                checkboxIndicator: { 'aria-label': 'Select all rows' },
              }}
            >
              {({ renderHeaderCell, columnId }, dataGrid) => (
                <Menu openOnContext>
                  <MenuTrigger>
                    <DataGridHeaderCell
                      className={columnId === 'actions' ? 'actionColumn' : ''}
                      ref={(el) => (refMap.current[columnId] = el)}
                    >
                      {renderHeaderCell()}
                    </DataGridHeaderCell>
                  </MenuTrigger>
                  {columnId !== 'actions' ? (
                    <MenuPopover>
                      <MenuList>
                        <MenuItem
                          onClick={dataGrid.columnSizing_unstable.enableKeyboardMode(
                            columnId
                          )}
                        >
                          Resize with keyboard
                        </MenuItem>
                      </MenuList>
                    </MenuPopover>
                  ) : (<></>)}
                </Menu>
              )}
            </DataGridRow>
          </DataGridHeader>
          {currentItems.length !== 0 ? (
            <DataGridBody<RowData>>
              {({ item, rowId }) => (
                <DataGridRow<RowData>
                  key={rowId}
                  selectionCell={{
                    checkboxIndicator: { 'aria-label': 'Select row' },
                  }}
                  style={{
                    backgroundColor: "inherit",
                    ...(getRowStyle ? getRowStyle(item) : {}),
                  }}
                >
                  {({ renderCell, columnId }) => (
                    <DataGridCell
                      className={columnId === 'actions' ? 'actionColumn' : ''}
                    >
                      {renderCell(item)}
                    </DataGridCell>
                  )}
                </DataGridRow>
              )}
            </DataGridBody>
          ) : (<Stack className='noData'>No Data Available</Stack>)}
        </DataGrid>
      </Stack>
      {/* Pagination Controls */}
      {enablePagination && actualTotalRecords > 0 && (
        <div className="paginationContainer">
          <div className="pagination_wrapper">
            <div className="paginationSelect_wrapper">
              <label>Rows per page:</label>
              <select
                value={rowsPerPage}
                onChange={handlePaginationOnChange}
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
                onClick={() => handlePageChange("prev")}
              />
              <span className="pagnationInfo">
                {currentPage} / {totalPages}
              </span>
              <ChevronRightRegular
                className={`${currentPage === totalPages || totalPages === 0 ? "paginationBtnDisabled" : ""
                  } paginationBtn`}
                onClick={() => handlePageChange("next")}
              />
            </div>
          </div>
        </div>
      )}
    </Stack>
  );
};
export default CantierDataGrid1;