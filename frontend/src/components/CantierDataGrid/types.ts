
import {
  SearchBoxChangeEvent,
  InputOnChangeData,
} from '@fluentui/react-components'; export interface RowData {
  id: number | string;
  [key: string]: unknown;
}
export type MenuOption = {
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
export interface IFPageinationData {
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
export type TableProps = {
  isTableHeader?: boolean;
  headerTitle?: string;
  isSearch?: boolean;
  headerBtn?: React.ReactNode;
  onSearch?: (event: SearchBoxChangeEvent, data: InputOnChangeData) => void;
};
export interface DataGridProps {
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
  isEdit?: boolean;
  isdelete?: boolean;
  isActioncolumn?: boolean;
}