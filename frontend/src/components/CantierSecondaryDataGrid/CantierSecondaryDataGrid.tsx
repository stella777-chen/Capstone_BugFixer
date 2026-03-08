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
  onClick: (row: RowData) => void;
};
interface IFPageinationData {
  rowsPerPage: number;
  currentPage: number;
}
export interface Column<T = any> {
  header: string;
  key: string;
  secondaryKey?: string;
  class?: string;
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
import "./CantierSecondaryDataGrid.scss";
import CantierGridHeader from '../CantierDataGrid/CantierGridHeader';
import CantierFormGridHeader from '../CantierDataGrid/Pages/CantierFormGridHeader';
import { Stack } from '@fluentui/react';
import { mapToPresenceStatus } from '../CantierDataGrid/helper';


const CantierSecondaryDataGrid: React.FC<DataGridProps> = ({
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
        <Button
          icon={<EditRegular />}
          onClick={() => getEdit ? getEdit(item) : defaultFun()}
          className="actionBtn"
        />
        <Button
          icon={<DeleteRegular />}
          onClick={() => getDelete ? getDelete(item) : defaultFun()}
          className="actionBtn"
        />
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
                  (val: MenuOption) => {
                    const { text, onClick, id } = val;
                    return (
                      <MenuItem
                        key={id}
                        icon={<EyeRegular />}
                        onClick={() => onClick(item)}
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
        renderHeaderCell: () => (<TableCellLayout truncate>
          {col.header}
        </TableCellLayout>),
        renderCell: (item) => (
          <TableCellLayout truncate style={{
            backgroundColor: "inherit",
            ...(getRowStyle ? getRowStyle(item) : {}),
          }}
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
            {col.cell ? col.cell(item) : <span>{item[col.key] as React.ReactNode}</span>}
          </TableCellLayout>
        ),
      })
    );
  };

  const columnDefs = createFluentColumns(columns);
  //Adding modifiyed column with action column
  const fullColumns: TableColumnDefinition<RowData>[] = [
    ...columnDefs,
    actionColumn,
  ];
  //column resize
  const columnSizingOptions = columns.reduce((acc, col) => {
    acc[col.key] = { defaultWidth: 140, minWidth: 100, idealWidth: 140, };
    return acc;
  }, {} as Record<string, any>);

  //get check box 
  useEffect(() => {
    if (getChecked) {
      getChecked(selectedRowIds);
    }
  }, [selectedRowIds, getChecked]);


  //pageination part
  const safeData = Array.isArray(data) ? data : [];

  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;

  const currentItems = enablePagination
    ? safeData.slice(indexOfFirstItem, indexOfLastItem)
    : safeData;

  const totalPages = Math.ceil(safeData.length / rowsPerPage);

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
          items={data}
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
                </Menu>
              )}
            </DataGridRow>
          </DataGridHeader>

          <DataGridBody<RowData>>
            {({ item, rowId }) => (
              <DataGridRow<RowData>
                key={rowId}
                selectionCell={{
                  checkboxIndicator: { 'aria-label': 'Select row' },
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
        </DataGrid>
      </Stack>
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
                onClick={() => {
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
                onClick={() => {
                  // currentPage < totalPages && setCurrentPage(currentPage + 1)
                  handlePageChange("next");
                }

                }
              />
            </div>
          </div>
        </div>

      )}

    </Stack>
  );
};
export default CantierSecondaryDataGrid;
