import React from 'react';
import {
    Dialog,
    DialogSurface,
    DialogTitle,
    DialogBody,
    DialogActions,
    DialogContent,
} from "@fluentui/react-components";
import { DismissRegular } from "@fluentui/react-icons";
import './CantierPopup.scss';

interface PopupProps {
    open: boolean;
    title?: string;
    modalBody: React.ReactNode;
    modalClose?: () => void;
    closeIcon?: boolean;
    modalBtn?: React.ReactNode;
    titleIcon?: React.ElementType;
    className?: string;
}

const CantierPopup: React.FC<PopupProps> = ({
    open,
    title,
    modalBody,
    modalClose,
    closeIcon,
    modalBtn,
    titleIcon: TitleIcon,
    className = "fui-DialogSurface"
}) => {
    return (
        <Dialog open={open}>
            <DialogSurface className={className}>
                <DialogBody>
                    <DialogTitle>
                        <div className="popup-title-wrapper">
                            <div className="popup-title-content">
                                {TitleIcon && (
                                    <div className="popup-title-icon-container">
                                        <TitleIcon className="popup-title-icon" />
                                        <span className="popup-title-text">{title}</span>
                                    </div>
                                )}
                                {!TitleIcon && <span>{title}</span>}
                            </div>
                            {closeIcon && (
                                <button className="popup-dismiss-button" onClick={modalClose}>
                                    <DismissRegular className="popup-close-icon" />
                                </button>
                            )}
                        </div>
                    </DialogTitle>

                    <DialogContent>
                        {modalBody}
                    </DialogContent>

                    <DialogActions>
                        {modalBtn}
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
};

export default CantierPopup;
