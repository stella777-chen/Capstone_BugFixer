import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  isValidElement, ReactElement
} from "react";
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
  Avatar,
  SearchBoxChangeEvent,
  InputOnChangeData,
  SearchBox,
  Spinner,
} from "@fluentui/react-components";
import {
  EditRegular,
  DeleteRegular,
  EyeRegular,
  MoreHorizontalRegular,
  ChevronLeftRegular,
  ChevronRightRegular,
  FilterRegular,
  MoreHorizontal24Regular,
  ArrowUploadRegular,
  CalendarArrowCounterclockwiseFilled,
} from "@fluentui/react-icons";
import { Stack } from "@fluentui/react";
import "./CantierDataGrid.scss";
import "./CantierGridHeader.css";
import CantierFormGridHeader from "./Pages/CantierFormGridHeader";
import { mapToPresenceStatus, useWindowWidth } from "./helper";
import TableFilter from "./TableFilter";
import CantierSpinner from "../CantierSpinner/CantierSpinner";
import CantierMenuList, { MenuItemType } from "../CantierMenuList/CantierMenuList";
import CantierButton from "../CantierButton/CantierButton";
import { postAxios } from "src/services/axios";
import { formatDateTime } from "../../utils/dateFormatter";


export interface RowData {
  id: number | string;
  isActive?: boolean;
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
interface SearchFilter {
  columnField: string;
  operator: string;
  value: string;
}
interface OrderFilter {
  sortColumn: string;
  sortDirection: string;
}
export interface Column<T = any> {
  header: string;
  key: string;
  secondaryKey?: string;
  class?: string;
  filterOption?: boolean;
  istitle?: boolean;
  thclass?: string;
  isCheckable?: boolean;
  cell?: (row: T) => React.ReactNode;
  renderAsAvatar?: boolean;
  avatarNameKeys?: string[];
  statusKey?: string;
  renderWithIcon?: boolean;
  icon?: React.ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  backendKey?: string;
  backendPath?: string;
  type?: 'date' | 'datetime' | 'enum' | string;
  options?: EnumOption[];
  isdotfalse?: boolean;
}

export interface EnumOption {
  value: number | string;
  label: string;
  color?: string;
}

type TableProps = {
  isTableHeader?: boolean;
  headerTitle?: string;
  isSearch?: boolean;
  headerBtn?: React.ReactNode;
  onSearch?: (event: SearchBoxChangeEvent, data: InputOnChangeData) => void;
};

type SortStateProps = {
  sortColumn: string | undefined;
  sortDirection: 'ascending' | 'descending'
};
interface DataGridProps {
  data: RowData[];
  columns: Column[];
  getChecked?: (checkedItems: (string | number)[]) => void;
  getEdit?: (row: RowData) => void;
  getDelete?: (row: RowData) => void;
  getView?: (row: RowData) => void;
  tableHeader?: TableProps;
  formHeader?: {
    headerBtn?: React.ReactNode;
  };
  isMenu?: boolean;
  menuOptions?: MenuOption[];
  enablePagination?: boolean;
  itemsPerPage?: number;
  triggerPagination?: boolean;
  setTriggerPagination?: (val: boolean) => void;
  setPaginationData?: React.Dispatch<React.SetStateAction<IFPageinationData>>;
  getRowStyle?: (row: RowData) => React.CSSProperties;
  isEdit?: boolean;
  isdelete?: boolean;
  isView?: boolean;
  isActioncolumn?: boolean;
  totalCount?: number;
  initialCurrentPage?: number;
  isDataPrePaginated?: boolean;
  showCheckbox?: boolean;
  isLoading?: boolean;
  isHeaderMenu?: boolean;
  headerMenuList?: MenuItemType[];
  headerMenuName?: string;
  onFilterSearch?: (searchPayload: SearchFilter[]) => void;
  getMenuItem?: (row: RowData) => void;
  customHeaderButtonsClassName?: string | "";
  savedSelectedRows?: (string | number)[];
  paginationData?: IFPageinationData;
  columnOrderingLogic?: string;
  getIndexGridFunction?: (orderPayload: any) => void;
  searchPayload?: SearchFilter[] | null;
  setSearchPayload?: React.Dispatch<React.SetStateAction<SearchFilter[] | null>>;
  isAutoFetchDataUsingIndexGridFunction?: boolean;
  isTrackedItemID?: string;
  disableMenuDropdown?: boolean,
  runningRowIds?: Set<number | string>;
  useActiveStateLogic?: boolean;
  isEditDisabled?: (row: RowData) => boolean;
  shouldAddExcelButton?: boolean;
  toExcelEntityName?: string;
  extraActions?: {
    id: number | string;
    icon: React.ReactNode | any;
    onClick: (row: RowData) => void;
    disabled?: (row: RowData) => boolean;
  }[];
  customOpenFilterHandler?: () => void

}

const CantierDataGrid: React.FC<DataGridProps> = ({
  data,
  columns,
  getChecked,
  getEdit,
  getDelete,
  getMenuItem,
  getView,
  tableHeader = {},
  formHeader,
  isMenu,
  menuOptions,
  enablePagination = false,
  disableMenuDropdown = false,
  runningRowIds = new Set(),
  useActiveStateLogic = true,
  itemsPerPage = 10,
  setPaginationData,
  getRowStyle,
  isEdit = true,
  isdelete = true,
  isActioncolumn = true,
  totalCount,
  triggerPagination,
  setTriggerPagination,
  initialCurrentPage = 0,
  isDataPrePaginated = false,
  showCheckbox = true,
  isLoading = false,
  isView = false,
  onFilterSearch,
  headerMenuList = [],
  headerMenuName = "Menu",
  isHeaderMenu = false,
  customHeaderButtonsClassName = "gridHeader_actions",
  savedSelectedRows,
  paginationData,
  isTrackedItemID,
  columnOrderingLogic = "client",
  getIndexGridFunction,
  searchPayload,
  setSearchPayload,
  isAutoFetchDataUsingIndexGridFunction = false,
  extraActions = [],
  isEditDisabled,
  shouldAddExcelButton = false,
  toExcelEntityName,
  customOpenFilterHandler
}) => {
   const config = window.appConfig;
   const extraButton = shouldAddExcelButton && (
        <CantierButton
            style="plain"
            variant="custom"
            label="Export List"
            icon={<CalendarArrowCounterclockwiseFilled />}
            onClick={async () => {
                const response = await postAxios<Blob>(
                    `${config.WIP_BASE_URL}ExportToExcel/Export`,
                    { 
                      entityName: toExcelEntityName, 
                      columns: /*modifiedColumns?.map(x => ({ key: x?.backendKey ?? x?.key, label: x?.header, path: x?.backendPath ?? "" })) ?? */ columns.map(x => ({key: x?.backendKey ?? x.key, label: x?.header, path: x?.backendPath ?? ""})),
                      ...(searchPayload &&
                        searchPayload[0]?.columnField && {
                          filterParameters: [
                            {
                              ...searchPayload[0],
                              columnField:
                                columns.find(c => c.key === searchPayload[0].columnField)
                                  ?.backendKey ?? searchPayload[0].columnField
                            },
                            ...searchPayload.slice(1)
                          ]
                      })
                    },
                    { responseType: "blob" }
                );
  
                const url = window.URL.createObjectURL(response);
                const now = new Date();
                const pad = (n: number) => n.toString().padStart(2, '0');
                const timestamp = `${now.getFullYear()}_${pad(now.getMonth() + 1)}_${pad(now.getDate())}_${pad(now.getHours())}_${pad(now.getMinutes())}_${pad(now.getSeconds())}`;

                const a = document.createElement("a");
                a.href = url;
                a.download = `${toExcelEntityName}_${timestamp}.xlsx`; // add timestamp here
                a.click();
                
                window.URL.revokeObjectURL(url);
            }}
        />
    );

  const mergedHeaderBtn = (
    <>
        {tableHeader?.headerBtn}
        {extraButton}
    </>
  );

  const mergedTableHeader = {
      ...tableHeader,
      headerBtn: mergedHeaderBtn,
  };

  const {
    isTableHeader = false,
    headerTitle = "",
    isSearch = false,
    headerBtn,
    onSearch,
  } = mergedTableHeader ?? {};


  const [isSliderFormOpen, setIsSliderFormOpen] = useState<boolean>(false);
  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(itemsPerPage);
  const [currentPageState, setCurrentPage] = useState(initialCurrentPage);
  const refMap = useRef<Record<string, HTMLElement | null>>({});

  const isServerSidePagination = typeof totalCount === "number" && !isNaN(totalCount);
  const safeData = Array.isArray(data) ? data : [];
  const effectiveTotalCount = isServerSidePagination ? totalCount : safeData.length;
  const totalPages = Math.ceil(effectiveTotalCount / rowsPerPage);
  const currentItems = isServerSidePagination
    ? safeData
    : safeData.slice(currentPageState * rowsPerPage, (currentPageState + 1) * rowsPerPage);

  const initialOrderPayload = {
    sortColumn: "",
    sortDirection: ""
  }

  const [orderPayload, setOrderPayload] = useState<OrderFilter>(initialOrderPayload);
  const [sortState, setSortState] = useState<SortStateProps>({
    sortColumn: undefined,
    sortDirection: 'ascending',
  });
  useEffect(() => {
    if (!enablePagination) return;

    const safeTotal = effectiveTotalCount;
    const newTotalPages = Math.max(1, Math.ceil(safeTotal / rowsPerPage));
    const newLastPageIndex = newTotalPages - 1;

    if (currentPageState > newLastPageIndex) {
      setCurrentPage(newLastPageIndex);
      setPaginationData?.({ rowsPerPage, currentPage: newLastPageIndex });
    }
  }, [effectiveTotalCount, rowsPerPage, enablePagination, currentPageState, safeData.length]);

  const handlePaginationOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(e.target.value);
    setRowsPerPage(newSize);
    setCurrentPage(0);
    setPaginationData?.({ rowsPerPage: newSize, currentPage: 0 });
  };

  const handlePageChange = (direction: "next" | "prev") => {
    const newPage = direction === "prev"
      ? Math.max(0, currentPageState - 1)
      : Math.min(totalPages - 1, currentPageState + 1);

    if (newPage !== currentPageState) {
      setCurrentPage(newPage);
      setPaginationData?.({ rowsPerPage, currentPage: newPage });
    }
  };
  useEffect(() => {
    if (columnOrderingLogic === "server" && getIndexGridFunction && isAutoFetchDataUsingIndexGridFunction) {
      const paginationpayload = {
        rowsPerPage: paginationData?.rowsPerPage,
        currentPage: paginationData?.currentPage,
        ...(searchPayload &&
          searchPayload[0]?.columnField && {
          searchFilters: searchPayload,
        }
        ),
        ...(orderPayload && {
          sortColumn: orderPayload.sortColumn == "" ? isTrackedItemID ? isTrackedItemID : "id" : orderPayload.sortColumn,
          sortDirection: orderPayload.sortDirection == "" ? "descending" : orderPayload.sortDirection
        }
        )
      };
      getIndexGridFunction(paginationpayload);
    }
  }, [paginationData, searchPayload, orderPayload]);

  const onOrderSearch = async (filters: OrderFilter) => {
    setOrderPayload(filters);
  };
  const handleOrderSearch = useCallback((filters: OrderFilter) => {
    onOrderSearch?.(filters);
  }, [onOrderSearch]);

  const actionColumn: TableColumnDefinition<RowData> = createTableColumn({
    columnId: "actions",
    renderHeaderCell: () => <TableCellLayout truncate>Actions</TableCellLayout>,
    renderCell: (item) => (
      <TableCellLayout truncate>
        {isView && (
          <Button
            icon={<EyeRegular />}
            onClick={(e) => {
              e.stopPropagation();
              getView?.(item);
            }}
            className="actionBtn"
            title="View"
          />
        )}
        {isEdit && (
          <Button
            icon={<EditRegular />}
            onClick={(e) => {
              e.stopPropagation();
              getEdit?.(item);
            }}
            className="actionBtn"
            title="Edit"
            disabled={isEditDisabled ? isEditDisabled?.(item) : false}
          />
        )}
        {isdelete && (
          <Button
            icon={<DeleteRegular />}
            onClick={(e) => {
              e.stopPropagation();
              getDelete?.(item);
            }}
            className="actionBtn"
            title="Delete"
          />
        )}
        {extraActions?.map((action) => (
          <Button
            key={action.id}
            icon={action.icon}
            onClick={(e) => {
              e.stopPropagation();
              action.onClick(item);
            }}
            disabled={action.disabled ? action.disabled?.(item) : false}
            className="actionBtn"
          />
        ))}
        {isMenu && menuOptions && (
          disableMenuDropdown ? (
            <>
              {menuOptions.map((val) =>
                val.subMenu ? (
                  val.subMenu.map((sub) => (
                    <Button
                      key={sub.id}
                      icon={sub.icon}
                      onClick={(e) => {
                        e.stopPropagation();
                        sub.onClick(item);
                      }}
                      className="actionBtn"
                      title={sub.text}
                    />
                  ))
                ) : (
                  <Button
                    key={val.id}
                    icon={val.icon || <EyeRegular />}
                    onClick={(e) => {
                      e.stopPropagation();
                      val.onClick(item);
                    }}
                    className="actionBtn"
                    title={val.text}
                  />
                )
              )}
            </>
          ) : (
            <Menu>
              <MenuTrigger disableButtonEnhancement>
                <Button
                  icon={<MoreHorizontalRegular />}
                  className="actionBtn"
                  onClick={(e) => e.stopPropagation()}
                />
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  {menuOptions.map((val) =>
                    val.subMenu ? (
                      <Menu key={val.id}>
                        <MenuTrigger disableButtonEnhancement>
                          <MenuItem icon={val.icon}>{val.text}</MenuItem>
                        </MenuTrigger>
                        <MenuPopover>
                          <MenuList>
                            {val.subMenu.map((sub) => (
                              <MenuItem
                                key={sub.id}
                                icon={sub.icon}
                                onClick={() => sub.onClick(item)}
                              >
                                {sub.text}
                              </MenuItem>
                            ))}
                          </MenuList>
                        </MenuPopover>
                      </Menu>
                    ) : (
                      <MenuItem
                        key={val.id}
                        icon={val.icon || <EyeRegular />}
                        onClick={() => val.onClick(item)}
                      >
                        {val.text}
                      </MenuItem>
                    )
                  )}
                </MenuList>
              </MenuPopover>
            </Menu>
          )
        )}
      </TableCellLayout>
    ),
  });

  const isValidValue = (val: any) =>
    val != null && val !== '' && val.toString().trim() !== '';

  const createFluentColumns = (cols: Column[]) =>
    cols.map((col) =>
      createTableColumn<RowData>({
        columnId: col.key,
        compare: (a, b) => {
          const valA = a[col.key];
          const valB = b[col.key];
          return typeof valA === "number" && typeof valB === "number"
            ? valA - valB
            : String(valA).localeCompare(String(valB));
        },
        renderHeaderCell: () => (
          <TableCellLayout truncate className={col.thclass}>
            {col.header}
          </TableCellLayout>
        ),
        renderCell: (item) => (
          <TableCellLayout
            truncate
            className={col.class}
            media={
              col.renderAsAvatar ? (
                <Avatar
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
            {(() => {
              // If custom cell renderer exists, use it
              if (col.cell && isValidValue(col.cell(item))) {
                return col.cell(item);
              }

              // Get the value
              const value = item[col.key];

              // If no value, show dash
              if (!isValidValue(value)) {
                return <span>-</span>;
              }

              // Format based on type
              // Format based on type
              if (col.type === 'date' || col.type === 'datetime') {
                return <span>{formatDateTime(value as string | number | null | undefined, col.type)}</span>;
              }

              if (col.type === 'enum' && col.options) {
                const matchedOption = col.options.find(opt => opt.value === value);
                if (matchedOption) {
                  return (
                    <div className={`cantier-status-chip ${col.isdotfalse ? 'no-dot' : ''}`} style={{ '--status-color': matchedOption.color } as React.CSSProperties}>
                      {!col.isdotfalse && <span className="cantier-status-dot"></span>}
                      <span className="cantier-status-label">{matchedOption.label}</span>
                    </div>
                  );
                }
              }

              // Default: show as-is
              return <span>{value as React.ReactNode}</span>;
            })()}
          </TableCellLayout>
        ),
      })
    );

  const columnDefs = useMemo(() => createFluentColumns(columns), [columns]);
  const fullColumns = useMemo(
    () => [...columnDefs, ...(isActioncolumn ? [actionColumn] : [])],
    [columnDefs, isActioncolumn, useActiveStateLogic, runningRowIds, disableMenuDropdown]
  );
  const colSize = (count: number) => {
    const maxWidth = window.innerWidth * 0.6;
    return count < 6 ? Math.floor(maxWidth / count) : Math.floor(maxWidth / 4);
  };

  const windowWidth = useWindowWidth();
  const columnSizingOptions = useMemo(() =>
    columns.reduce((acc, col) => {
      acc[col.key] = {
        defaultWidth: col.defaultWidth || colSize(columns.length),
        minWidth: col.minWidth || 100,
      };
      return acc;
    }, {} as Record<string, any>), [columns, windowWidth]);

  useEffect(() => {
    if (getChecked && savedSelectedRows) {
      if (savedSelectedRows.length == 1 || selectedRowIds.length > 0) {
        getChecked(selectedRowIds);
      }
    }
    else if (getChecked) {
      getChecked(selectedRowIds);
    }
  }, [selectedRowIds, getChecked]);

  useEffect(() => {
    if (getChecked) {
      getChecked(selectedRowIds);
    }
  }, [selectedRowIds, getChecked]);

  const handleOpenFilter = () => { setIsSliderFormOpen(true); customOpenFilterHandler?.()};

  const ColumnsNames = useMemo(() =>
    columns.filter(col => col.filterOption !== false).map(col => ({
      columnId: col.header,
      columnKey: col.key,
      type: col.type,
      options: col.options
    })), [columns]);

  const handleFilterSearch = useCallback((searchPayload: SearchFilter[]) => {
    if (onFilterSearch) {
      onFilterSearch?.(searchPayload);
    }
    else {
      setSearchPayload?.(searchPayload);
    }
  }, [onFilterSearch]);

  // Extract button data from headerBtn
  let renderedHeaderBtn: React.ReactNode = null;
  if (isValidElement(headerBtn) && typeof headerBtn.type === "function") {
    renderedHeaderBtn = (headerBtn.type as Function)(headerBtn.props);
  } else {
    renderedHeaderBtn = headerBtn;
  }

  const buttonElements = (renderedHeaderBtn as ReactElement)?.props?.children;
  const buttonsArray = Array.isArray(buttonElements)
    ? buttonElements
    : [buttonElements];

  const buttonData = buttonsArray
    .filter(isValidElement)
    .map((btn: any, index: number) => {
      const label = btn.props.label;
      const onClickFn = btn.props.onClick;
      const icon = btn.props.icon;
      return {
        key: index,
        label,
        onClick: onClickFn,
        icon,
        element: btn
      };
    });

  // Determine if buttons should be shown in menu (>3 buttons)
  const shouldShowInMenu = buttonData.length > 3;
  const firstThreeButtons = buttonData.slice(0, 3);
  const remainingButtons = buttonData.slice(3);

  return (
    <Stack className="datagrid_container">
      {formHeader && (
        <div className="formHeader_wrapper">
          <CantierFormGridHeader
            headerBtn={
              <div className="formHeader_btn">{formHeader.headerBtn}</div>
            }
          />
        </div>
      )}
      {isTableHeader && (
        <>
          <div className="gridHeader">
            {headerTitle && (
              <h2 className="gridHeader_title">{headerTitle}</h2>
            )}
            <div className="gridHeader_actions">
              <div className="gridHeader_btnWrapper">
                <div className='desktop_table_btn'>
                  {!shouldShowInMenu ? (
                    headerBtn
                  ) : (
                    <>
                      {firstThreeButtons.map((btn) => btn.element)}
                      <Menu>
                        <MenuTrigger disableButtonEnhancement>
                          <Button
                            icon={<MoreHorizontal24Regular />}
                            className="gridheader_Wrapperbtn"
                            appearance="secondary"
                          >
                          </Button>

                        </MenuTrigger>
                        <MenuPopover>
                          <MenuList>
                            {remainingButtons.map((btn) => (
                              <MenuItem
                                key={btn.key}
                                onClick={() => btn.onClick?.()}
                                icon={btn.icon}
                              >
                                {btn.label}
                              </MenuItem>
                            ))}
                          </MenuList>
                        </MenuPopover>
                      </Menu>
                    </>
                  )}
                </div>

                {/* Mobile view - always show in menu */}
                {buttonData.length > 0 && (
                  <div className='mobile_table_btn'>
                    <Menu>
                      <MenuTrigger disableButtonEnhancement>
                        <Button
                          icon={<MoreHorizontal24Regular />}
                          appearance="subtle"
                          aria-label="More options"
                        />
                      </MenuTrigger>
                      <MenuPopover>
                        <MenuList>
                          {buttonData.map((btn) => (
                            <MenuItem
                              key={btn.key}
                              onClick={() => btn.onClick?.()}
                              icon={btn.icon}
                            >
                              {btn.label}
                            </MenuItem>
                          ))}
                        </MenuList>
                      </MenuPopover>
                    </Menu>
                  </div>
                )}
              </div>

              {isHeaderMenu && (
                <CantierMenuList btnName={headerMenuName} menuList={headerMenuList} />
              )}
              <div style={{ flexGrow: 1 }}></div>

              {isSearch && (
                <div className="gridHeader_searchWrapper">
                  <div className="gridHeader_filter" onClick={handleOpenFilter}>
                    <FilterRegular className="gridHeader_filterIcon" />
                    <span className="gridHeader_filterText">Filter</span>
                  </div>
                </div>
              )}
            </div>
            <TableFilter
              isSliderFormOpen={isSliderFormOpen}
              setIsSliderFormOpen={setIsSliderFormOpen}
              fullColumns={ColumnsNames}
              //onSearch={handleFilterSearch}
              onSearch={(searchPayload) => {
                handleFilterSearch(searchPayload);
                handleOrderSearch(orderPayload);
              }}
            />
          </div>
        </>
      )}
      <>
        <Stack className="responsive_table custom-scrollbar">
          <DataGrid
            items={currentItems}
            columns={fullColumns}
            sortable
            selectionMode={showCheckbox ? "multiselect" : undefined}
            resizableColumns
            columnSizingOptions={columnSizingOptions}
            resizableColumnsOptions={{ autoFitColumns: false }}
            getRowId={(item) => String(item.id)}
            selectedItems={savedSelectedRows?.map(String)}
            onSelectionChange={(e, { selectedItems }) => {
              const validIds = new Set(safeData.map((item) => item.id));
              const filteredSelected = Array.from(selectedItems).filter((id) =>
                validIds.has(Number(id))
              );
              setSelectedRowIds(filteredSelected.map(Number));
            }}
            sortState={sortState}
            onSortChange={(e, { sortColumn, sortDirection }) => {
              const newSortState = { sortColumn, sortDirection } as OrderFilter;
              setSortState(newSortState as SortStateProps)
              setOrderPayload(newSortState);
            }}
          >
            <DataGridHeader>
              <DataGridRow
                {...(showCheckbox && {
                  selectionCell: {
                    checkboxIndicator: { "aria-label": "Select all rows" },
                  },
                })}
              >
                {({ renderHeaderCell, columnId }, dataGrid) => (
                  <Menu openOnContext>
                    <MenuTrigger>
                      <DataGridHeaderCell
                        className={columnId === "actions" ? "actionColumn" : ""}
                        ref={(el) => (refMap.current[columnId] = el)}
                      >
                        {renderHeaderCell()}
                      </DataGridHeaderCell>
                    </MenuTrigger>
                    {columnId !== "actions" ? (
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
                    ) : (
                      <></>
                    )}
                  </Menu>
                )}
              </DataGridRow>
            </DataGridHeader>

            {isLoading ? (
              <Stack className="noData"><CantierSpinner /></Stack>
            ) : safeData.length ? (
              <DataGridBody<RowData>>
                {({ item, rowId }) => (
                  <DataGridRow<RowData>
                    key={rowId}
                    {...(showCheckbox && {
                      selectionCell: {
                        checkboxIndicator: { "aria-label": "Select row" },
                      },
                    })}
                    style={{
                      backgroundColor: "inherit",
                      ...(getRowStyle ? getRowStyle(item) : {}),
                    }}
                  >
                    {({ renderCell, columnId }) => (
                      <DataGridCell
                        className={columnId === "actions" ? "actionColumn" : ""}
                      >
                        {renderCell(item)}
                      </DataGridCell>
                    )}
                  </DataGridRow>
                )}
              </DataGridBody>
            ) : (
              <Stack className="noData">No Data Available</Stack>
            )}
          </DataGrid>
        </Stack>
      </>

      {enablePagination && currentItems?.length > 0 && (
        <div className="paginationContainer">
          <div className="pagination_wrapper">
            <div className="paginationSelect_wrapper">
              <label>Rows per page:</label>
              <select
                value={rowsPerPage}
                onChange={handlePaginationOnChange}
                className="paginationSelect"
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div className="paginationBtn_wrapper">
              <ChevronLeftRegular
                className={`${currentPageState === 0 ? "paginationBtnDisabled" : ""} paginationBtn`}
                onClick={() => handlePageChange("prev")}
              />
              <span className="pagnationInfo">{currentPageState + 1} / {totalPages}</span>
              <ChevronRightRegular
                className={`${currentPageState === totalPages - 1 ? "paginationBtnDisabled" : ""} paginationBtn`}
                onClick={() => handlePageChange("next")}
              />
            </div>
          </div>
        </div>
      )}
    </Stack>
  );
};

export default CantierDataGrid;