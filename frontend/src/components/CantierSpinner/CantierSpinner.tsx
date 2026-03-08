import React, { memo } from "react";
import "./CantierSpinner.scss"
import loader from "../../assets/CantierSpinneIcon.svg";

interface SpinnersProps {
    className?: string;
}

const CantierSpinner: React.FC<SpinnersProps> = ({ className = "spin_overlay" }) => {
    return (
        <div className={className}>
            <img src={loader} alt="Loading..." className="spinner" />
        </div>
    );
};

export default memo(CantierSpinner);