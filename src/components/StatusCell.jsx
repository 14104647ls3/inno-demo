import { Box, Menu, MenuButton, MenuItem, MenuList, Text } from "@chakra-ui/react";
import { STATUSES } from "../data";

export const ColorIcon = ({ color, ...props }) => (
  <Box w="12px" h="12px" bg={color} borderRadius="3px" {...props} />
);

const StatusCell = ({ getValue, row, column, table }) => {
  const cellValue = getValue();
  const statusObj = STATUSES.find(s => s.name === cellValue) || { name: cellValue, color: "gray.500" };
  const { updateData, isEditing } = table.options.meta || {};

  if (!isEditing) {
    return (
      <Box display="flex" alignItems="center">
        <ColorIcon color={statusObj.color} mr={2} />
        <Text fontSize="xs">{statusObj.name}</Text>
      </Box>
    );
  }

  return (
    <Menu isLazy offset={[0, 0]} flip={false} autoSelect={false}>
      <MenuButton
        h="100%"
        w="100%"
        textAlign="left"
        size="sm"
        p={1}
        borderRadius="md"
        _hover={{ bg: "gray.700" }}
      >
        <Box display="flex" alignItems="center">
          <ColorIcon color={statusObj.color} mr={2} />
          <Text fontSize="xs">{statusObj.name}</Text>
        </Box>
      </MenuButton>
      <MenuList zIndex={20}>
        <MenuItem onClick={() => updateData(row.index, column.id, "")}>
          <ColorIcon color="gray.400" mr={3} />
          None
        </MenuItem>
        {STATUSES.map((status) => (
          <MenuItem
            onClick={() => updateData(row.index, column.id, status.name)}
            key={status.id}
          >
            <ColorIcon color={status.color} mr={3} />
            {status.name}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};
export default StatusCell;
