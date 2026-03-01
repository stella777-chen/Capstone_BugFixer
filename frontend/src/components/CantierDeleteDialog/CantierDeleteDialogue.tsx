import React from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogBody,
    DialogContent,
    DialogSurface,
    DialogTitle,
} from "@fluentui/react-components";

type DialogProps = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmBtnLabel: string;
    cancelBtnLabel: string;
    confirmButtonStyle?: React.CSSProperties;
    isConfirmDisabled?: boolean;
};

const CantierDeleteDialog: React.FC<DialogProps> = ({open, onClose, onConfirm, title = "Confirm Action", message = "Are you sure you want to proceed?", confirmBtnLabel = "Confirm", cancelBtnLabel = "Cancel", confirmButtonStyle = {backgroundColor: "var(--color-accent)", color: "white"}, isConfirmDisabled}) => {
    return (<Dialog open={open}>
        <DialogSurface>
            <DialogBody>
                <DialogTitle>{title}</DialogTitle>
                <DialogContent>{message}</DialogContent>
                <DialogActions>
                    <Button appearance="secondary" onClick={onClose}>
                        {cancelBtnLabel}
                    </Button>
                    <Button
                        appearance="primary"
                        onClick={onConfirm}
                        style={confirmButtonStyle}
                        disabled={isConfirmDisabled}
                    >
                        {confirmBtnLabel}
                    </Button>
                </DialogActions>
            </DialogBody>
        </DialogSurface>
    </Dialog>);
};

export default CantierDeleteDialog;