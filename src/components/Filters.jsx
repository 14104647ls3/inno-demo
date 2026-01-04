import {
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import SearchIcon from "./icons/SearchIcon";
import FilterPopover from "./FilterPopover";
import DateFilter from "./DateFilter";

const Filters = ({ columnFilters, setColumnFilters, globalFilter, setGlobalFilter }) => {
  const filterValue = globalFilter || "";

  const onFilterChange = (value) => {
    setGlobalFilter(value || undefined);
  };

  return (
    <HStack mb={6} spacing={3}>
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
