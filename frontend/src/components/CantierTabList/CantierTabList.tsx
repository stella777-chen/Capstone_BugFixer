import React from 'react'
import {
  SelectTabData,
  SelectTabEvent,
  Tab,
  TabList,
} from "@fluentui/react-components";
import './CantierTabList.css';
interface IFTabData {
  key: string,
  name: string,
  tabComponents: React.ReactNode,
  disabled?: boolean,
}
interface IFTabList {
  selectedValue: string,
  onTabSelect: (event: SelectTabEvent, data: SelectTabData) => void,
  tabList: IFTabData[],
  className?: string,
}
const CantierTabList: React.FC<IFTabList> = ({ selectedValue, onTabSelect, tabList, className }) => {
  return (
    <div className="tabList-wrapper">
      <TabList className={`tabList ${className}`} selectedValue={selectedValue} onTabSelect={onTabSelect} >
        {tabList.map((tab, index) => {
          return (
            <Tab value={tab.key} disabled={tab.disabled}>{tab.name}</Tab>
          )
        })}
      </TabList>
      <div>{tabList.find((tab) => tab.key === selectedValue)?.tabComponents || 'Tab not found'}</div>
    </div>
  )
}
export default CantierTabList
