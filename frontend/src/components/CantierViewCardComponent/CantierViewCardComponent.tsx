import React from "react";
import { MoreHorizontal20Regular } from "@fluentui/react-icons";
import {
	Button,
	Card,
	CardHeader,
	CardPreview,
	Body1,
} from "@fluentui/react-components";
import "./CantierViewCardComponent.css";

export interface ViewCardBaseProps {
	id: number;
	name: string;
	description: string;
	status: "Online" | "Offline" | "Stand By";
	inUse: "In Use" | "Under Repair" | "Stand By";
	onClick?: () => void;
}

export interface StandardViewCardProps extends ViewCardBaseProps {
	variant: "standard";
	imageUrl?: string;
}

export interface CustomViewCardProps extends ViewCardBaseProps {
	variant: "custom";
	customStyles?: React.CSSProperties;
	customImage?: React.ReactNode;
	imageUrl?: string;
}

export type ViewCardProps = StandardViewCardProps | CustomViewCardProps;

const CantierViewCardComponent: React.FC<ViewCardProps> = (props) => {
	const { id, name, description, status, inUse, onClick } = props;

	const statusClass = `status-dot ${status.toLowerCase().replace(" ", "-")}`;
	const inUseClass = `inuse-badge ${inUse.toLowerCase().replace(" ", "-")}`;

	if (props.variant === "custom") {
		const { customStyles, customImage, imageUrl } = props as CustomViewCardProps;
		return (
			<Card key={id} className="cantier-card" style={customStyles} onClick={onClick}>
				<CardPreview>
					{customImage || (
						<img
							src={imageUrl}
							alt={`Machine ${id}`}
							className="card-img"
						/>
					)}
				</CardPreview>
				<CardHeader
					header={
						<Body1>
							<b>{name}</b>
						</Body1>
					}
					action={
						<Button
							appearance="transparent"
							icon={<MoreHorizontal20Regular />}
							aria-label="More options"
						/>
					}
				/>
				<p className="card-description">{description}</p>
				<div className="equipment-container">
					<div>
						<span className={statusClass}></span>
						<span className="status-text">{status}</span>
					</div>
					<span className={inUseClass}>{inUse}</span>
				</div>
			</Card>
		);
	}

	const { imageUrl } = props as StandardViewCardProps;
	return (
		<Card key={id} className="cantier-card" onClick={onClick}>
			<CardPreview>
				<img
					src={imageUrl}
					alt={`Machine ${id}`}
					className="card-img"
				/>
			</CardPreview>
			<CardHeader
				header={
					<Body1>
						<b>{name}</b>
					</Body1>
				}
				action={
					<Button
						appearance="transparent"
						icon={<MoreHorizontal20Regular />}
						aria-label="More options"
					/>
				}
			/>
			<p className="card-description">{description}</p>
			<div className="equipment-container">
				<div>
					<span className={statusClass}></span>
					<span className="status-text">{status}</span>
				</div>
				<span className={inUseClass}>{inUse}</span>
			</div>
		</Card>
	);
};

export default CantierViewCardComponent;
