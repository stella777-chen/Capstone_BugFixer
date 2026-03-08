import React, { MouseEvent, KeyboardEvent, useCallback } from 'react';
import { Pivot, PivotItem, IPivotStyles } from '@fluentui/react';

interface MesTabProps {
  tabTitle?: string[];
  tabSize?: string;
  tabContainerSize?: string;
  handleChange?: (newValue: number) => void;
  withScrollButtons?: boolean;
  value?: number | null;
}

export default function MesTab({
  tabTitle = ["DefaultValue1", "DefaultValue2", "DefaultValue3", "DefaultValue4", "DefaultValue5", "DefaultValue6", "DefaultValue7"],
  tabSize = 'tab-size',
  tabContainerSize = 'tab-container-size',
  handleChange = () => alert('Tab is Clicked.'),
  withScrollButtons = false,
  value = null,
}: MesTabProps) {

  const pivotStyles: Partial<IPivotStyles> = {
    link: {
      selectors: {
        '&.is-selected': {
          color: '#4376AF'
        }
      }
    }
  };

  const onTabChange = useCallback(
    (item?: PivotItem, ev?: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>): void => {
      if (item) {
        const index = tabTitle.findIndex(title => title === item.props.headerText);
        handleChange(index);
      }
    },
    [tabTitle, handleChange]
  );

  return (
    <div className={tabSize}>
      <Pivot
        styles={pivotStyles}
        className={tabSize}
        selectedKey={value !== null ? value.toString() : undefined}
        onLinkClick={onTabChange}
        overflowBehavior={withScrollButtons ? "menu" : undefined}
      >
        {tabTitle.map((label, index) => (
          <PivotItem
            key={index.toString()}
            headerText={label}
            itemKey={index.toString()}
            className={tabContainerSize}
          />
        ))}
      </Pivot>
    </div>
  );
}
