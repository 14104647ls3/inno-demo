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
  const filterValue = globalFilter || "";

  const onFilterChange = (value) => {
    setGlobalFilter(value || undefined);
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
          value={filterValue}
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
