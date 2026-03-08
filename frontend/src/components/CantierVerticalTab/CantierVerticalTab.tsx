import React from 'react';
import {
    makeStyles,
    Tab,
    TabList,
    FluentProvider,
    webLightTheme,
    SelectTabEvent,
    SelectTabData,
    Card,
} from '@fluentui/react-components';
import {
    DocumentRegular,
    BuildingFactoryRegular,
    ToolboxRegular,
    ArrowRepeatAllRegular,
    DataHistogramRegular,
    ArrowRoutingRegular,
    CalendarMonthRegular,
} from '@fluentui/react-icons';
import "./CantierVerticalTab.scss";


const customTheme = {
    ...webLightTheme,
    colorStrokeFocus: 'var(--color-accent)', // Orange stroke when selected
    colorCompoundBrandStroke: 'var(--color-accent)',
    colorCompoundBrandStrokeHover: "var(--color-accent)",// TabList active state stroke
};
interface IFTabData {
    key: string,
    name: string,
    tabComponents: React.ReactNode,
    icon?: React.ReactElement,
    titleImg?: string,
    hideHeading?: boolean,
    disabled?: boolean,

}
interface IFTabList {
    selectedValue: string,
    onTabSelect: (event: SelectTabEvent, data: SelectTabData) => void,
    tabList: IFTabData[],
}
const CantierVerticalTab: React.FC<IFTabList> = ({ selectedValue, onTabSelect, tabList }) => {
    const selectedTab = tabList.find((tab) => tab.key === selectedValue);
    return (
        <Card className='cantier-vertical-tab-card'>
            <div className="vertical-tabList-wrapper">
                <TabList
                    className="vertical-tab-list"
                    vertical
                    selectedValue={selectedValue}
                    onTabSelect={onTabSelect}
                >
                    {tabList.map((tab) => (
                        <Tab key={tab.key} value={tab.key} icon={tab.icon} disabled={tab.disabled} className={selectedValue==tab.key?"active":""}>
                            {tab.name}
                        </Tab>
                    ))}
                </TabList>
                <div className='tab-wrapper'>
                    {!selectedTab?.hideHeading &&
                        <div className='tab-heading'>
                            {selectedTab?.titleImg && <img src={selectedTab?.titleImg} alt="Icon" className={"tab-heading-img"} />}
                            <div className='tab-heading-text'>{selectedTab?.name}</div>
                        </div>
                    }
                    <div className='tab-content'>
                        {selectedTab?.tabComponents || 'Tab not found'}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default CantierVerticalTab;