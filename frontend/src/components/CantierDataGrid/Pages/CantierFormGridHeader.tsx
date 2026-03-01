	import React from "react";
import { makeStyles } from "@fluentui/react-components";

const useStyles = makeStyles({
	wrapper: {
		display: "flex",
	},
	root: {
		width: "100%",
	},
	tabList: {
		marginBottom: "10px",
	},
	selectedTab: {
		fontWeight: "bold",
	},
});

export interface GridHeaderProps {
	headerBtn: React.ReactNode;
}

const CantierFormGridHeader: React.FC<GridHeaderProps> = ({ headerBtn }) => {
	const styles = useStyles();

	return (
		<>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "1vh",
					paddingTop: "10px",
					// paddingLeft: "15px",
					height: "auto",
					marginTop: "1.1%",
					paddingBottom: "10px",
				}}>
				<div
					style={{
						display: "flex",
						right: "20px",
					}}>
					<div className={styles.wrapper}>{headerBtn}</div>
				</div>
			</div>
		</>
	);
};

export default CantierFormGridHeader;
