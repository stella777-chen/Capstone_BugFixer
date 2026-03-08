import React from "react";
import "./OEECard.css";
import OEEProgressCircle from "./OEEProgressCircle";
import CantierButton from "../CantierButton/CantierButton";

interface OEECardProps {
    machineName: string;
    description: string;
    isOnline: boolean;
    oeePercentage: number;
    availability: number;
    quality: number;
    performance: number;
    downtime?: string;
    className?: string;
    showImage?: boolean;
    showOnlineStatus?: boolean;
    showButtons?: boolean;
    onDowntimeClick?: () => void;
    onDashboardClick?: () => void;
}

const OEECard: React.FC<OEECardProps> = ({
    machineName,
    description,
    isOnline,
    oeePercentage,
    availability,
    quality,
    performance,
    downtime,
    className = "",
    showImage = true,
    showOnlineStatus = true,
    showButtons = true,
    onDowntimeClick,
    onDashboardClick,
}) => {
    return (
        <div className={`oee-card ${className}`}>
            {/* Header Section */}
            <div className="oee-card-header">
                <div className="oee-card-title-container">
                    <h3 className="oee-card-title">{machineName}</h3>
                    <p className="oee-card-description">{description}</p>
                </div>
                {showOnlineStatus && (
                    <span
                        className={`oee-card-status ${isOnline ? "online" : "offline"}`}
                    >
                        {isOnline ? "Running" : "Stopped"}
                    </span>
                )}
            </div>

            {/* Main Content Section */}
            <div className="oee-card-main">
                {/* Machine Image */}
                {showImage && (
                    <div className="oee-card-image">
                        <div className="oee-card-image-container">
                            <img
                                src="https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRNQgAApmUqVFJ-4Q3NtftQQnfkRHWityHq-ixggrUqFLCtPzi2"
                                alt="Machine"
                            />
                        </div>
                    </div>
                )}

                {/* OEE Progress Circle */}
                <div className="oee-card-progress">
                    <OEEProgressCircle percentage={oeePercentage} />
                </div>
            </div>

            {/* Metrics Section */}
            <div className="oee-metrics-grid">
                <div className="oee-metric-item">
                    <p className="oee-metric-label">Availability</p>
                    <p className="oee-metric-value">{availability}%</p>
                </div>
                <div className="oee-metric-item">
                    <p className="oee-metric-label">Quality</p>
                    <p className="oee-metric-value">{quality}%</p>
                </div>
                <div className="oee-metric-item">
                    <p className="oee-metric-label">Performance</p>
                    <p className="oee-metric-value">{performance}%</p>
                </div>
                {downtime && (
                    <div className="oee-metric-item">
                        <p className="oee-metric-label">Downtime</p>
                        <p className="oee-metric-value">{downtime}</p>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            {showButtons && (
                <div className="form-button-group">
                    <CantierButton
                        label="DownTime Entry"
                        variant="custom"
                        onClick={onDowntimeClick}
                    />
                    <CantierButton
                        label="Dashboard"
                        variant="custom"
                        onClick={onDashboardClick}
                    />

                </div>
            )}
        </div>
    );
};

export default OEECard;
