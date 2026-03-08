import React from 'react';
import { Button, Text } from '@fluentui/react-components';
import CantierDataSummaryBlock from 'src/components/CantierDataSummaryBlock/CantierDataSummaryBlock';
import CantierDataGrid, { Column, RowData } from 'src/components/CantierDataGrid/CantierDataGrid';
import './ChangeoverValidationStatus.css';
import { CheckmarkCircleRegular, ClipboardArrowRightRegular } from '@fluentui/react-icons';

interface ProcessData extends RowData {
    id: number | string;
    [key: string]: any; // Allow dynamic properties
}

interface ColumnConfig {
    header: string;
    key: string;
}

interface ValidationSection {
    id: string;
    title: string;
    status: 'completed' | 'in-progress' | 'pending';
    hasSubData?: boolean;
    subData?: ProcessData[];
    columns?: ColumnConfig[]; // Custom columns for each section
    showActions?: boolean; // NEW: Flag to control action button visibility
}

interface ChangeoverValidationStatusProps {
    title?: string;
    sections: ValidationSection[];
    onSubmit?: () => void;
    onCancel?: () => void;
    onView?: (row: RowData) => void;
}

const ChangeoverValidationStatus: React.FC<ChangeoverValidationStatusProps> = ({
    title,
    sections,
    onSubmit,
    onCancel,
    onView,
}) => {
    const getStatusIndicator = (status: string) => {
        const statusColors: Record<string, string> = {
            completed: '#10b981',
            'in-progress': '#f59e0b',
            pending: '#ec390c',
        };
        return (
            <div
                className="changeover-status-indicator"
                style={{
                    backgroundColor: statusColors[status] || '#6b7280',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    flexShrink: 0,
                }}
                title={status}
            />
        );
    };

    // Handler for view action
    const handleView = (row: RowData) => {
        if (onView) {
            onView(row);
        }
    };

    // Default columns if none provided
    const defaultColumns: Column<ProcessData>[] = [
        {
            header: 'Process',
            key: 'process',
        },
        {
            header: 'Status',
            key: 'status',
        },
        {
            header: 'Quantity',
            key: 'quantity',
        },
    ];

     const menuOptions = [
            // {
            //     id: 1,
            //     text: "View",
            //     icon: <Eye24Regular />,
            //     onClick: (row: RowData) => handleView(row),
            // },
            {
                id: 0,
                text: "Navigate",
                icon: <ClipboardArrowRightRegular />,
                onClick: (row: RowData) => handleView(row),
            },
        ];
    

    // Convert custom column config to CantierDataGrid format
    const getColumnsForSection = (section: ValidationSection): Column<ProcessData>[] => {
        if (section.columns && section.columns.length > 0) {
            return section.columns.map(col => ({
                header: col.header,
                key: col.key,
            }));
        }
        return defaultColumns;
    };

    return (
        <div className="changeover-validation-wrapper">
            {title && (
                <div className="changeover-validation-main-header">
                    <Text className="changeover-validation-main-title">{title}</Text>
                </div>
            )}

            <div className="changeover-validation-sections">
                {sections.map((section) => (
                    <CantierDataSummaryBlock
                        key={section.id}
                        title={
                            <>
                                <span className="changeover-section-title-text">{section.title}</span>
                                {getStatusIndicator(section.status)}
                            </>
                        }
                        itemsPerRow={1}
                        data={[]}
                        defaultExpanded={false}
                        hasToggle={section.hasSubData}
                        hasBorder={true}
                        customInput={
                            <>
                                {section.hasSubData && section.subData && section.subData.length > 0 ? (
                                    <div className="changeover-grid-wrapper">
                                        <CantierDataGrid
                                            data={section.subData}
                                            columns={getColumnsForSection(section)}
                                            isActioncolumn={section.showActions !== false} // Show actions only if showActions is true
                                            isEdit={false}
                                            isdelete={false}
                                            isView={false} // Show view only if showActions is true
                                            getView={section.showActions !== false ? handleView : undefined}
                                            showCheckbox={false}
                                            enablePagination={true}
                                            isLoading={false}
                                            isMenu={true}
                                            menuOptions={menuOptions}
                                            disableMenuDropdown={true}
                                        />
                                    </div>
                                ) : undefined}
                            </>
                        }
                        isCustomInputPrimary={true}
                    />
                ))}
            </div>

            {(onSubmit || onCancel) && (
                <div className="changeover-validation-footer">
                    {onCancel && (
                        <Button
                            appearance="secondary"
                            onClick={onCancel}
                            className="changeover-cancel-btn"
                        >
                            Cancel
                        </Button>
                    )}
                    {onSubmit && (
                        <Button
                            appearance="primary"
                            onClick={onSubmit}
                            className="changeover-submit-btn"
                        >
                            Submit
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChangeoverValidationStatus;