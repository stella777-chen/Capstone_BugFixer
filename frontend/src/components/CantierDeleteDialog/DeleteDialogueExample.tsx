import React, { useState } from 'react';
import CantierDeleteDialog from './CantierDeleteDialogue';

const DeleteDialogueExample: React.FC = () => {
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

    const selectedItems = ['Item 1', 'Item 2', 'Item 3'];

    const handleOpen = () => {
        setIsDialogOpen(true);
    };

    const handleConfirm = () => {
        console.log('Deleting items:', selectedItems);
        setIsDialogOpen(false);
    };

    const handleClose = () => {
        console.log('Dialog closed');
        setIsDialogOpen(false);
    };

    return (
        <div>
            <button onClick={handleOpen} style={{ padding: '8px 16px', backgroundColor: '#0078d4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Open Delete Dialog
            </button>
            <CantierDeleteDialog
                open={isDialogOpen}
                title="Delete Items"
                message={`Are you sure you want to delete ${selectedItems.length} selected item(s)?`}
                confirmBtnLabel="Delete"
                cancelBtnLabel="Cancel"
                confirmButtonStyle={{ backgroundColor: "var(--color-accent)", color: "white" }}
                isConfirmDisabled={selectedItems.length === 0}
                onClose={handleClose}
                onConfirm={handleConfirm}
            />
        </div>
    );
};

export default DeleteDialogueExample;
