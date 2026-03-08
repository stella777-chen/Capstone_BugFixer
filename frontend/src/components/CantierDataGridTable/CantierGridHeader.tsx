import React from "react";
import {
	Field,
	SearchBox,
	SearchBoxProps,
} from "@fluentui/react-components";
import { FilterRegular } from "@fluentui/react-icons";
import "./CantierGridHeader.css";

export interface GridHeaderProps {
  headerTitle: string;
  isSearch: boolean;
  headerBtn: React.ReactNode;
  onSearch: SearchBoxProps["onChange"];
}

const CantierGridHeader: React.FC<GridHeaderProps> = ({
  headerTitle,
  isSearch,
  headerBtn,
  onSearch,
}) => {
	return (
		<div className="gridHeader">
			<h2 className="gridHeader_title">{headerTitle}</h2>

			<div className="gridHeader_actions">
				<div className="gridHeader_btnWrapper">{headerBtn}</div>
				<div style={{ flexGrow: 1 }}></div>

				{isSearch && (
					<div className="gridHeader_searchWrapper">
						<div className="gridHeader_filter">
							<FilterRegular className="gridHeader_filterIcon" />
							<span className="gridHeader_filterText">Filter</span>
						</div>
						{/* <Field label=""> */}
							<SearchBox placeholder="Find" onChange={onSearch} />
						{/* </Field> */}
					</div>
				)}
			</div>
		</div>
	);
};

export default CantierGridHeader;
