import React from "react";
import {
	Text,
	Card,
	CardHeader,
	Caption1,
} from "@fluentui/react-components";
import "./CantierDataTableCardComponent.css";

export type CardColor = "red" | "blue" | "green" | "orange";

const backgroundColor = {
	red: "#E36970",
	blue: "#136D9D",
	green: "#139D8D",
	orange: "#FF8F00",
};

export interface CardBaseProps {
	icon?: React.ReactNode;
	title: string;
	subtitle: string;
	value: string | number;
	backgroundColor: CardColor;
	className?:string;
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

const CantierDataTableCardComponent: React.FC<CardProps> = (props) => {
	const {
		variant = "standard",
		icon,
		title,
		subtitle,
		value,
		backgroundColor: color,
		className,
	} = props;

	const hexColor = backgroundColor[color];

	const isCustom = variant === "custom";
	const customStyles = isCustom ? (props as CustomCardProps).customStyles : {};
	const tooltip = isCustom ? (props as CustomCardProps).tooltip : undefined;

	return (
		<Card
			className={`${variant === "custom" ? "custom-card" : "standard-card"} ${className}`}
			style={{ backgroundColor: hexColor, ...customStyles }}
			title={tooltip}
		>
			<CardHeader
				image={
					icon ? (
						<div className="card-icon">
							{icon}
						</div>
					) : null
				}
				header={
					<Text className="card-header-text">
						{title}
					</Text>
				}
				description={
					<Caption1 className="card-caption">
						{subtitle}
					</Caption1>
				}
			/>
			<p className="card-value">{value}</p>
		</Card>
	);
};

export default CantierDataTableCardComponent;
