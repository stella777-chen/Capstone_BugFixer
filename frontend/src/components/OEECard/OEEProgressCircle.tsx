import React from "react";

interface OEEProgressCircleProps {
    percentage: number;
    radius?: number;
}

const OEEProgressCircle: React.FC<OEEProgressCircleProps> = ({
    percentage,
    radius = 45,
}) => {
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const getOEEColor = (percentage: number): string => {
        if (percentage >= 0 && percentage < 33) return "#A61A31"; // Red
        if (percentage >= 33 && percentage < 67) return "#FF8F00"; // Orange
        return "#3C8646"; // Green
    };

    const oeeColor = getOEEColor(percentage);

    return (
        <div className="oee-progress-wrapper">
            <svg className="oee-progress-svg" viewBox="0 0 100 100">
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke="#e5e7eb"
                    strokeWidth="6"
                    fill="transparent"
                />
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke={oeeColor}
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                />
            </svg>
            <div className="oee-progress-text">
                <span className="oee-text">OEE</span>
                <span className="oee-percentage-text" style={{ color: oeeColor }}>
                    {percentage}%
                </span>
            </div>
        </div>
    );
};

export default OEEProgressCircle;
