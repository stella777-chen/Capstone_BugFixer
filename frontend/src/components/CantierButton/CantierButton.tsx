import React from "react";
import { Button } from "@fluentui/react-components";
import "./CantierButton.scss";

export interface ButtonBaseProps {
	label?: string;
	onClick?: (e?: React.SyntheticEvent) => void;
	style?: keyof typeof buttonStyles;
	type?: string;
	disabled?: boolean;
}

export interface StandardButtonProps extends ButtonBaseProps {
	variant: "standard";
	icon?: React.ReactElement;
}

export interface CantierButtonProps extends ButtonBaseProps {
	variant: "custom";
	icon?: React.ReactElement;
	tooltip?: string;
	sx?: React.CSSProperties;
}

const themeColors = {
	buttonPrimary: "var(--color-accent)",
	buttonSecondary: "#ebebeb",
	accentOrange: "var(--color-accent)",
	textPrimary: "var(--color-primary)",
	textSecondary: "#616161",
	background: "#ffffff",
	transparent: "transparent",
	buttonPlain: "#242424",
	buttonDisable: "#E0E0E0"
};

const buttonStyles = {
	primary: {
		backgroundColor: themeColors.buttonPrimary,
		color: "#ffffff",
	},
	secondary: {
		backgroundColor: themeColors.transparent,
		color: "var(--color-accent)",
		border: "1px solid var(--color-accent)",
	},
	accent: {
		backgroundColor: themeColors.accentOrange,
		color: "#ffffff",
	},
	transparent: {
		backgroundColor: themeColors.transparent,
		color: themeColors.textPrimary,
		border: "none",
	},
	transparentborder: {
		backgroundColor: themeColors.transparent,
		color: themeColors.textPrimary,
	},
	plain: {
		backgroundColor: themeColors.transparent,
		color: "var(--color-accent)",
		border: "1px solid var(--color-accent)",
	},
	disable: {
		backgroundColor: themeColors.buttonDisable,
		color: "#9E9E9E",
	},
	fail: {
		backgroundColor: "#d41814",
		color: "#ffffff",
	},
	pass: {
		backgroundColor: "#86bd14",
		color: "#ffffff",
	},
};

export type ButtonsProps = StandardButtonProps | CantierButtonProps;

const CantierButton: React.FC<ButtonsProps> = ({
	variant = "standard",
	label,
	icon,
	style = "primary",
	type,
	onClick,
	...restProps
}) => {
	// Apply disabled style if button is disabled
	const baseStyle = restProps.disabled 
		? buttonStyles.disable 
		: buttonStyles[style || "primary"];

	if (variant === "custom") {
		const { sx, tooltip } = restProps as CantierButtonProps;
		return (
			<Button
				className="cantier_btn"
				style={{ ...baseStyle, ...sx }}
				icon={icon ? { children: icon } : undefined}
				onClick={onClick}
				title={tooltip}
				disabled={restProps.disabled}
			>
				{label}
			</Button>
		);
	}

	return (
		<>
			<Button
				style={baseStyle}
				className="cantier_btn"
				icon={icon ? { children: icon } : undefined}
				disabled={restProps.disabled}
				onClick={onClick}
			>
				{label}
			</Button>
			{type == "submit" && <input type="submit" style={{ display: "none" }} />}
		</>
	);
};

export default CantierButton;