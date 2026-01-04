import { forwardRef } from "react";
import { Box, Center, Icon } from "@chakra-ui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CalendarIcon from "./icons/CalendarIcon";

const DateCustomInput = forwardRef(({ value, onClick }, ref) => (
  <Center ref={ref} onClick={onClick} cursor="pointer" w="100%">
    {value ? (
      <>{value}</>
    ) : (
      <Icon as={CalendarIcon} fontSize="xl" />
    )}
  </Center>
));

const DateCell = ({ getValue, row, column, table }) => {
  const dateStr = getValue();
  const { updateData, isEditing } = table.options.meta;

  // Parse YYYY-MM-DD string to Date object
  const dateObj = dateStr ? new Date(dateStr + 'T00:00:00') : null;

  // Format for display
  const displayDate = dateObj ?
    `${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getDate()).padStart(2, '0')}/${dateObj.getFullYear()}`
    : "";

  if (!isEditing) {
    return <Box pl={4}>{displayDate}</Box>; // Create consistent padding/alignment with input
  }

  return (
    <DatePicker
      wrapperClassName="date-wrapper"
      dateFormat="MM/dd/yyyy"
      selected={dateObj}
      onChange={(date) => {
        if (!date) return; // Prevent clearing
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const formatted = `${year}-${month}-${day}`;
        updateData(row.index, column.id, formatted);
      }}
      customInput={<DateCustomInput />}
    />
  );
};
export default DateCell;
