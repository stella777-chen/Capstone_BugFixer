import React, { useState } from 'react';
import { Text } from '@fluentui/react-components';
import { ChevronDown12Regular, ChevronUp12Regular } from '@fluentui/react-icons';
import './CantierDataSummeryBlock.css';
import { formatDateTime } from '../../utils/dateFormatter';

export interface DataItem {
  label: string;
  value: string | number | undefined | null | React.ReactNode;
  type?: 'date' | 'datetime' | 'text';
  isPill?: boolean;
  pillColor?: 'low' | 'Critical' | 'high' | 'pending' | 'cantier' | string | number;
}

interface CantierDataSummaryBlockProps {
  title?: string | React.ReactNode;
  subtitle?: string;
  itemsPerRow: number;
  data: DataItem[];
  defaultExpanded?: boolean;
  collapsedItemsCount?: number;
  customInput?: React.ReactNode;
  isSliderFormSummary?: boolean;
  hasToggle?: boolean;
  hasBorder?: boolean;
  isCustomSingleRow?: boolean;
  isRow?: boolean;
  hasBackgroundShadow?: boolean;
  isDataFirst?: boolean;
  isCustomInputPrimary?: boolean;
  isDataRequired?: boolean;
  isFixedHeight?: boolean;
}

const CantierDataSummaryBlock: React.FC<CantierDataSummaryBlockProps> = ({
  title,
  subtitle,
  itemsPerRow,
  data,
  defaultExpanded = false,
  collapsedItemsCount = 4,
  customInput,
  isSliderFormSummary = false,
  hasToggle = true,
  hasBorder = true,
  isCustomSingleRow = false,
  isRow = false,
  hasBackgroundShadow = true,
  isDataFirst = false,
  isCustomInputPrimary = false,
  isDataRequired = false,
  isFixedHeight = false
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const formatValue = (value: string | number | undefined | null | React.ReactNode, type?: 'date' | 'datetime' | 'text'): string | React.ReactNode => {
    // Check for React elements first - they should never be converted to strings
    if (React.isValidElement(value)) {
      return value;
    }

    // Handle undefined, null, and empty string
    if (value === undefined) {
      return 'undefined';
    }
    if (value === null) {
      return 'null';
    }
    if (value === '') {
      return '(empty)';
    }

    // Format date/datetime if type specified (only for string/number values)
    if (type === 'date' || type === 'datetime') {
      return formatDateTime(String(value), type);
    }

    // Return the value as-is (string or number)
    return value;
  };

  const isUndefinedOrNull = (value: string | number | undefined | null | React.ReactNode): boolean => {
    if (React.isValidElement(value)) {
      return false;
    }
    return value === undefined || value === null || value === '';
  };

  const toggleExpanded = () => {
    if (!isSliderFormSummary) {
      setIsExpanded(!isExpanded);
    }
  };

  const displayData = isExpanded ? data : data.slice(0, collapsedItemsCount);
  const hasMoreData = data.length > collapsedItemsCount;
  const shouldShowGrid = !isDataRequired && displayData.length > 0;
  console.info("displayData:", displayData);
  return (
    <div
      className={
        isSliderFormSummary
          ? 'cantier-data-summary-container-sliderform'
          : hasBorder ? 'cantier-data-summary-container' : hasBackgroundShadow ? (isFixedHeight ? "cantier-data-summary-container-no-border-fixed-height" : 'cantier-data-summary-container-no-border') : 'cantier-data-summary-container-no-background'
      }
    >
      {/* Header */}
      <div className={isSliderFormSummary === true ? "" : "cantier-data-summary-header"}>
        {title && <Text className="cantier-data-summary-title">{title}</Text>}
        {((hasMoreData || customInput) && !isSliderFormSummary && hasToggle) && (
          <button
            className="cantier-data-summary-expand-btn"
            onClick={toggleExpanded}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp12Regular /> : <ChevronDown12Regular />}
          </button>
        )}
      </div>

      {/* Single Row Layout for Custom Input + Data */}
      {isCustomSingleRow ? (
        <div
          className="cantier-data-summary-grid-single-row"
          style={{
            gridTemplateColumns: `repeat(${itemsPerRow}, 1fr)`
          }}
        >
          {/* Render data first if isDataFirst is true */}
          {isDataFirst && displayData.map((item, index) => (
            <div key={index} className={isRow ? "cantier-data-summary-item-row" : "cantier-data-summary-item"}>
              <Text className="cantier-data-summary-label">{item.label} :</Text>
              <div
                className={
                  isUndefinedOrNull(item.value)
                    ? "cantier-data-summary-value cantier-data-summary-undefined"
                    : "cantier-data-summary-value"
                }
              >
                {item.isPill ? (
                  <span className={`status-pill status-pill-${item.pillColor}`}>
                    {formatValue(item.value, item.type)}
                  </span>
                ) : (
                  formatValue(item.value, item.type)
                )}
              </div>
            </div>
          ))}

          {/* Custom Input */}
          {customInput && <div>{customInput}</div>}

          {/* Render data after custom input if isDataFirst is false */}
          {!isDataFirst && displayData.map((item, index) => (
            <div key={index} className={isRow ? "cantier-data-summary-item-row" : "cantier-data-summary-item"}>
              <Text className="cantier-data-summary-label">{item.label} :</Text>
              <div
                className={
                  isUndefinedOrNull(item.value)
                    ? "cantier-data-summary-value cantier-data-summary-undefined"
                    : "cantier-data-summary-value"
                }
              >
                {item.isPill ? (
                  <span className={`status-pill status-pill-${item.pillColor}`}>
                    {formatValue(item.value, item.type)}
                  </span>
                ) : (
                  formatValue(item.value, item.type)
                )}
              </div>
            </div>
          ))}
        </div>
      ) : isCustomInputPrimary ? (
        <>
          {/* Custom input FIRST (now collapsible) */}
          {customInput && isExpanded && (
            <div style={{ marginBottom: '2vh' }}>{customInput}</div>
          )}

          {/* DATA GRID */}
          {shouldShowGrid && isExpanded && (
            <>
              {subtitle && (
                <Text className="cantier-data-summary-subtitle">{subtitle}</Text>
              )}
              <div
                className="cantier-data-summary-grid"
                style={{ "--items-per-row": itemsPerRow } as React.CSSProperties}
              >
                {displayData.map((item, index) => (
                  <div key={index} className={isRow ? "cantier-data-summary-item-row" : "cantier-data-summary-item"}>
                    <Text className="cantier-data-summary-label">{item.label} :</Text>
                    <div
                      className={
                        isUndefinedOrNull(item.value)
                          ? "cantier-data-summary-value cantier-data-summary-undefined"
                          : "cantier-data-summary-value"
                      }
                    >
                      {item.isPill ? (
                        <span className={`status-pill status-pill-${item.pillColor}`}>
                          {formatValue(item.value, item.type)}
                        </span>
                      ) : (
                        formatValue(item.value, item.type)
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <>
          {/* Render data first if isDataFirst is true */}
          {isDataFirst && (
            <>
              {subtitle && (
                <Text className="cantier-data-summary-subtitle">{subtitle}</Text>
              )}
              {displayData.length !== 0 && (
                <div
                  className="cantier-data-summary-grid"
                  style={{ "--items-per-row": itemsPerRow } as React.CSSProperties}
                >
                  {displayData.map((item, index) => (
                    <div key={index} className={isRow ? "cantier-data-summary-item-row" : "cantier-data-summary-item"}>
                      <Text className="cantier-data-summary-label">{item.label} :</Text>
                      <div
                        className={
                          isUndefinedOrNull(item.value)
                            ? "cantier-data-summary-value cantier-data-summary-undefined"
                            : "cantier-data-summary-value"
                        }
                      >
                        {item.isPill ? (
                          <span className={`status-pill status-pill-${item.pillColor}`}>
                            {formatValue(item.value, item.type)}
                          </span>
                        ) : (
                          formatValue(item.value, item.type)
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </>
          )}

          {/* Custom Input */}
          {customInput && <div style={{ marginBottom: "2vh" }}>{customInput}</div>}

          {/* Render data after custom input if isDataFirst is false */}
          {!isDataFirst && (
            <>
              {subtitle && (
                <Text className="cantier-data-summary-subtitle">{subtitle}</Text>
              )}
              {displayData.length !== 0 && (
                <div
                  className="cantier-data-summary-grid"
                  style={{ "--items-per-row": itemsPerRow } as React.CSSProperties}
                >
                  {displayData.map((item, index) => (
                    <div key={index} className={isRow ? "cantier-data-summary-item-row" : "cantier-data-summary-item"}>
                      <Text className="cantier-data-summary-label">{item.label} :</Text>
                      <div
                        className={
                          isUndefinedOrNull(item.value)
                            ? "cantier-data-summary-value cantier-data-summary-undefined"
                            : "cantier-data-summary-value"
                        }
                      >
                        {item.isPill ? (
                          <span className={`status-pill status-pill-${item.pillColor}`}>
                            {formatValue(item.value, item.type)}
                          </span>
                        ) : (
                          formatValue(item.value, item.type)
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

    </div>
  );
};

export default CantierDataSummaryBlock;