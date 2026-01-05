import { useState, useEffect } from "react";
import {
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Button
} from "@chakra-ui/react";
import SearchIcon from "./icons/SearchIcon";
import FilterPopover from "./FilterPopover";
import DateFilter from "./DateFilter";

const Filters = ({ columnFilters, setColumnFilters, globalFilter, setGlobalFilter, isEditing, onToggleEdit }) => {
  const [value, setValue] = useState(globalFilter || "");

  // Update local state if globalFilter changes externally
  useEffect(() => {
    setValue(globalFilter || "");
  }, [globalFilter]);

  // Debounce updates to the parent globalFilter
  useEffect(() => {
    const timeout = setTimeout(() => {
      setGlobalFilter(value || undefined);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [value, setGlobalFilter]);

  const onFilterChange = (newValue) => {
    setValue(newValue);
  };

  return (
    <HStack spacing={3}>
      <InputGroup size="sm" maxW="12rem">
        <InputLeftElement pointerEvents="none">
          <Icon as={SearchIcon} />
        </InputLeftElement>
        <Input
          type="text"
          variant="filled"
          placeholder="Filter"
          borderRadius={5}
          value={value}
          onChange={(e) => onFilterChange(e.target.value)}
        />
      </InputGroup>
      <DateFilter
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
      />
      <FilterPopover
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
      />
    </HStack>
  );
};
export default Filters;
