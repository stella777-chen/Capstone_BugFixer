import { FC, PropsWithChildren, ReactNode, useEffect, useState } from "react";
import MesSnackbarContext from "../MesSnackbarContext/MesSnackbarContext";
import {
	makeStyles,
	shorthands,
	tokens,
	FluentProvider,
	webLightTheme,
	Button,
	Text,
	Card,
} from "@fluentui/react-components";
import {
	InfoRegular,
	CheckmarkCircleRegular,
	DismissCircleRegular,
	WarningRegular,
	DismissRegular,
} from "@fluentui/react-icons";
import "./SnackStyles.css";

interface Item {
	id: string;
	heading: string;
	message: string;
	severity: string;
	timeout?: number;
	visible?: boolean;
	timerId?: null | any;
}

interface IMesSnackbarProvider {
	children: PropsWithChildren<{}> | ReactNode | ReactNode[] | any;
	position?: "column-reverse" | "column";
}

const useStyles = makeStyles({
	snackbarContainer: {
		position: "fixed",
		top: 0,
		right: 0,
		display: "flex",
		zIndex: 99999,
		...shorthands.padding(tokens.spacingVerticalM),
	},
	notification: {
		width: "248px",
		maxHeight: "170px",
		backgroundColor: tokens.colorNeutralBackground1,
		boxShadow: tokens.shadow4,
		marginBottom: tokens.spacingVerticalS,
		...shorthands.overflow("hidden"),
		position: "relative",
	},
	notificationContent: {
		display: "flex",
		flexDirection: "column",
		...shorthands.padding("2px"),
	},
	notificationHeader: {
		display: "flex",
		alignItems: "flex-start",
		justifyContent: "space-between",
	},
	headingContainer: {
		display: "flex",
		alignItems: "center",
		gap: "8px",
	},
	heading: {
		fontSize: "15px",
		fontWeight: 600,
		margin: 0,
		padding: 0,
	},
	message: {
		fontSize: "12px",
		fontWeight: 300,
		marginTop: "4px",
		maxHeight: "120px",
	},
	closeButton: {
		minWidth: "20px",
		height: "20px",
		padding: 0,
		marginLeft: "auto",
	},
	hidden: {
		visibility: "hidden",
	},
	visible: {
		visibility: "visible",
	},
	iconContainer: {
		display: "flex",
		alignItems: "center",
		marginRight: "8px",
	},
});

const MesSnackbarProvider: FC<IMesSnackbarProvider> = ({
	children,
	position = "column",
}) => {
	const [items, setItems] = useState<Item[]>([]);
	const styles = useStyles();

	// Function to start the removal timer for an item
	const startRemoveTimer = (item: Item) => {
		item.timerId = setTimeout(() => {
			removeItem(item.id);
		}, item.timeout);
	};

	// Function to pause the removal timer for an item
	const pauseRemoveTimer = (item: Item) => {
		if (item.timerId) {
			clearTimeout(item.timerId);
			item.timerId = null;
		}
	};

	// Function to resume the removal timer for an item
	const resumeRemoveTimer = (item: Item) => {
		if (!item.timerId) {
			startRemoveTimer(item);
		}
	};

	// Function to add a new item to the list
	const addItem = (
		message: string,
		heading: string,
		severity: string,
		timeout: number,
	) => {
		const newItem = {
			heading: heading,
			message: message,
			severity: severity,
			timeout: timeout < 15000 ? 15000 : timeout,
			visible: true,
			id: Date.now().toString(),
			timerId: null, // Store the timer ID for each item
		};
		setItems((prevItems) => [...prevItems, newItem]);
		startRemoveTimer(newItem); // Start the removal timer for the new item
	};

	// Function to hide an item (animate out)
	const hideItem = (id: string) => {
		const oldItems = [...items];
		setItems(
			oldItems.map((val) => {
				if (val.id == id) {
					val.visible = false;
					return val;
				} else {
					return val;
				}
			}),
		);
		setTimeout(
			() =>
				setItems((prevItems) =>
					prevItems.filter((item) => item.id !== id),
				),
			200,
		);
	};

	// Function to remove an item from the list
	const removeItem = (id: string) => {
		setItems((prevItems) =>
			prevItems.filter((item: Item) => item.id !== id),
		);
	};

	// Event handler for the form submission
	const AddNewItem = (
		message: string,
		heading: string,
		severity: string,
		timeout: number,
	) => {
		addItem(message, heading, severity, timeout);
	};

	useEffect(() => {
		console.log = console.warn = console.error = () => { };
	}, []);

	// Helper function to get border color based on severity
	const getBorderColor = (severity: string) => {
		switch (severity) {
			case "error":
				return "#D60000";
			case "success":
				return "#459D7C";
			case "warning":
				return "#FFCA41";
			case "info":
				return "var(--color-primary)";
			default:
				return "var(--color-primary)";
		}
	};

	// Helper function to get icon based on severity
	const getIcon = (severity: string) => {
		switch (severity) {
			case "error":
				return <DismissCircleRegular style={{ color: "#D60000" }} />;
			case "success":
				return <CheckmarkCircleRegular style={{ color: "#459D7C" }} />;
			case "warning":
				return <WarningRegular style={{ color: "#FFCA41" }} />;
			case "info":
				return <InfoRegular style={{ color: "var(--color-primary)" }} />;
			default:
				return <InfoRegular style={{ color: "var(--color-primary)" }} />;
		}
	};

	return (
		<MesSnackbarContext.Provider value={{ addSnack: AddNewItem }}>
			<FluentProvider theme={webLightTheme}>
				{/* Snackbar Container */}
				<div
					className={styles.snackbarContainer}
					style={{
						flexDirection: position,
					}}>
					<div
						className={
							items.length === 0 ? styles.hidden : styles.visible
						}>
						{items.map((item) => (
							<Snack
								key={item.id}
								item={item}
								pauseRemoveTimer={pauseRemoveTimer}
								resumeRemoveTimer={resumeRemoveTimer}
								hideItem={hideItem}
								removeItem={removeItem}
								getBorderColor={getBorderColor}
								getIcon={getIcon}
							/>
						))}
					</div>
				</div>
				{children}
			</FluentProvider>
		</MesSnackbarContext.Provider>
	);
};

export default MesSnackbarProvider;

function Snack({
	item,
	pauseRemoveTimer,
	resumeRemoveTimer,
	hideItem,
	getBorderColor,
	getIcon,
}: any) {
	const [isOpen, setIsOpen] = useState(true);
	const styles = useStyles();

	useEffect(() => {
		setIsOpen(item?.visible);
	}, [item?.visible]);

	useEffect(() => {
		console.log = console.warn = console.error = () => { };
	}, []);

	// Calculate proper height based on message length
	const getCustomHeight = () => {
		if (item?.message?.length > 50) return "170px";
		if (item?.message?.length > 30) return "50px";
		return "70px"; // MinHeight
	};

	// Handle notification close
	const handleClose = () => {
		setIsOpen(false);
		hideItem(item.id);
	};

	// Helper function to get default heading based on severity
	const getDefaultHeading = (severity: string) => {
		switch (severity) {
			case "error":
				return "Danger Notification";
			case "success":
				return "Success Notification";
			case "warning":
				return "Warning Notification";
			case "info":
				return "Info Notification";
			default:
				return "Notification";
		}
	};

	// Get heading text
	const getHeadingText = () => {
		const heading = item?.heading || getDefaultHeading(item?.severity);
		if (heading && heading.length > 0) {
			return heading.charAt(0).toUpperCase() + heading.slice(1);
		}
		return heading;
	};

	if (!isOpen) return null;

	return (
		<Card
			className={`notification-slide-in ${styles.notification}`}
			style={{
				borderLeft: `4px solid ${getBorderColor(item.severity)}`,
				minHeight:
					item.message || item.message === ""
						? "24px"
						: getCustomHeight(),
			}}
			onMouseEnter={() => pauseRemoveTimer(item)}
			onMouseLeave={() => resumeRemoveTimer(item)}>
			<div className={styles.notificationContent}>
				<div className={styles.notificationHeader}>
					<div className={styles.headingContainer}>
						<span className={styles.iconContainer}>
							{getIcon(item.severity)}
						</span>
						<Text className={styles.heading} weight="semibold">
							{getHeadingText()}
						</Text>
					</div>
					<Button
						className={styles.closeButton}
						appearance="subtle"
						icon={<DismissRegular />}
						onClick={handleClose}
					/>
				</div>
				<div
					className={styles.message}
					style={{
						overflowY:
							item?.message?.length > 55 ? "scroll" : "hidden",
					}}>
					<Text size={200} weight="regular">
						{item?.message}
					</Text>
				</div>
			</div>
		</Card>
	);
}
