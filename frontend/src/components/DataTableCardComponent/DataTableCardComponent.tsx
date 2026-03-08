import React from "react";
import { Text, Card, CardHeader, Caption1 } from "@fluentui/react-components";
import {
	AppsListRegular,
	BroadActivityFeedRegular,
	TabShieldDismissRegular,
	PauseRegular,
	PeopleRegular,
	CheckboxPersonRegular,
	DocumentPersonRegular,
	PeopleCheckmarkRegular,
	PeopleErrorRegular,
} from "@fluentui/react-icons";

export type CardColor = "red" | "blue" | "green" | "orange";

const backgroundColor = {
	red: "#E36970",
	blue: "#136D9D",
	green: "#139D8D",
	orange: "#FF8F00",
};

const icons = {
	activity: BroadActivityFeedRegular,
	shield: TabShieldDismissRegular,
	apps: AppsListRegular,
	pause: PauseRegular,
	people: PeopleRegular,
	checkboxPerson: CheckboxPersonRegular,
	documentPerson: DocumentPersonRegular,
	peopleCheckmark: PeopleCheckmarkRegular,
	peopleError: PeopleErrorRegular,
};

export interface CardBaseProps {
	icon?: keyof typeof icons;
	title: string;
	subtitle: string;
	value: string | number;
	backgroundColor: CardColor;
}

export interface StandardCardProps extends CardBaseProps {
	variant: "standard";
}

export interface CustomCardProps extends CardBaseProps {
	variant: "custom";
	customStyles?: React.CSSProperties;
	tooltip?: string;
}

export type CardProps = StandardCardProps | CustomCardProps;

const styles = {
	standard: {
		card: {
			width: "23.5%",
			flex: "1 1 auto",
			margin: "1%",
		},
		text: {
			padding: "12px",
			margin: 0,
			color: "white",
			textAlign: "right" as const,
			fontWeight: "bold" as const,
			fontSize: "5vh",
		},
		caption: {
			color: "white",
		},
	},
	custom: {
		card: {
			width: "23.5%",
			flex: "1 1 auto",
			margin: "1%",
			borderRadius: "8px",
			border: "2px solid #FF8F00",
		},
		text: {
			padding: "12px",
			margin: 0,
			color: "white",
			textAlign: "right" as const,
			fontWeight: "bold" as const,
			fontSize: "5vh",
		},
		caption: {
			color: "white",
		},
	},
};

const DataTableCardComponent: React.FC<CardProps> = (props) => {
	const {
		variant = "standard",
		icon: iconKey = "apps",
		title,
		subtitle,
		value,
		backgroundColor: color,
	} = props;

	const variantStyles = styles[variant];
	const IconComponent = icons[iconKey];
	const hexColor = backgroundColor[color];

	if (variant === "custom") {
		const { customStyles, tooltip } = props as CustomCardProps;
		return (
			<Card
				style={{
					...variantStyles.card,
					backgroundColor: hexColor,
					...customStyles,
				}}
				title={tooltip}>
				<CardHeader
					image={
						<IconComponent
							style={{
								width: "32px",
								height: "32px",
								color: "white",
							}}
						/>
					}
					header={
						<Text
							style={{
								color: "white",
								fontWeight: "bold",
								fontSize: "large",
							}}>
							{title}
						</Text>
					}
					description={
						<Caption1 style={variantStyles.caption}>
							{subtitle}
						</Caption1>
					}
				/>
				<p style={variantStyles.text}>{value}</p>
			</Card>
		);
	}

	return (
		<Card
			style={{
				...variantStyles.card,
				backgroundColor: hexColor,
			}}>
			<CardHeader
				image={
					<IconComponent
						style={{
							width: "32px",
							height: "32px",
							color: "white",
						}}
					/>
				}
				header={
					<Text
						style={{
							color: "white",
							fontWeight: "bold",
							fontSize: "large",
						}}>
						{title}
					</Text>
				}
				description={
					<Caption1 style={variantStyles.caption}>
						{subtitle}
					</Caption1>
				}
			/>
			<p style={variantStyles.text}>{value}</p>
		</Card>
	);
};

export default DataTableCardComponent;
