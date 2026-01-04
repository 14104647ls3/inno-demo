import { Box, Button, ButtonGroup } from "@chakra-ui/react";

const EditToolbar = ({ selectedCount, onDelete, onAdd, onDeselectAll }) => {
    return (
        <ButtonGroup size="sm">
            <Button colorScheme="blue" onClick={onAdd}>
                Add Row
            </Button>
            <Button
                colorScheme="red"
                isDisabled={selectedCount === 0}
                onClick={onDelete}
            >
                Delete Selected ({selectedCount})
            </Button>
            <Button
                variant="outline"
                isDisabled={selectedCount === 0}
                onClick={onDeselectAll}
            >
                Deselect All
            </Button>
        </ButtonGroup>
    );
};

export default EditToolbar;
