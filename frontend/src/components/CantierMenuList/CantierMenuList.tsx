import React from "react";
import {
    Button,
    Menu,
    MenuItem,
    MenuList,
    MenuPopover,
    MenuTrigger,
} from "@fluentui/react-components";

export type MenuItemType = {
    name: string;
    icon?: JSX.Element;
    onClick: (e?: React.SyntheticEvent) => void;
};

interface IFMenuList {
    btnName: string | JSX.Element;
    menuList: MenuItemType[];
}

const CantierMenuList: React.FC<IFMenuList> = ({ btnName, menuList }) => (
    <Menu>
        <MenuTrigger disableButtonEnhancement>
            <a>
                {typeof btnName === "string" ? btnName : btnName}
            </a>
        </MenuTrigger>

        <MenuPopover>
            <MenuList>
                {menuList.map((item, index) => (
                    <MenuItem
                        key={index}
                        icon={item.icon}
                        onClick={item.onClick}
                    >
                        {item.name}
                    </MenuItem>
                ))}
            </MenuList>
        </MenuPopover>
    </Menu>
);

export default CantierMenuList;
