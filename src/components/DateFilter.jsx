import {
    Button,
    Icon,
    Popover,
    PopoverArrow,
    PopoverCloseButton,
    PopoverContent,
    PopoverBody,
    PopoverTrigger,
    VStack,
    Text,
    Input,
    HStack,
    Box,
} from "@chakra-ui/react";
import FilterIcon from "./icons/FilterIcon"; // Reusing FilterIcon or could use a CalendarIcon if available

const DateFilter = ({ columnFilters, setColumnFilters }) => {
    const dateFilter = columnFilters.find((f) => f.id === "date")?.value || { start: "", end: "" };
    const { start, end } = dateFilter;

    const handleFilterChange = (type, value) => {
        setColumnFilters((prev) => {
            const currentfilter = prev.find((f) => f.id === "date")?.value || { start: "", end: "" };
            const newFilter = { ...currentfilter, [type]: value };

            // If both are empty, remove the filter
            if (!newFilter.start && !newFilter.end) {
                return prev.filter((f) => f.id !== "date");
            }

            return prev
                .filter((f) => f.id !== "date")
                .concat({
                    id: "date",
                    value: newFilter,
                });
        });
    };

    const isActive = !!start || !!end;

    return (
        <Popover isLazy>
            <PopoverTrigger>
                <Button
                    size="sm"
                    color={isActive ? "blue.300" : ""}
                    leftIcon={<Icon as={FilterIcon} fontSize={18} />}
                >
                    Date
                </Button>
            </PopoverTrigger>
            <PopoverContent>
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverBody>
                    <Text fontSize="md" fontWeight="bold" mb={4}>
                        Filter By Date:
                    </Text>
                    <VStack spacing={3} align="stretch">
                        <Box>
                            <Text fontSize="xs" fontWeight="bold" mb={1} color="gray.500">
                                Start Date
                            </Text>
                            <Input
                                type="date"
                                size="sm"
                                value={start}
                                onChange={(e) => handleFilterChange("start", e.target.value)}
                            />
                        </Box>
                        <Box>
                            <Text fontSize="xs" fontWeight="bold" mb={1} color="gray.500">
                                End Date
                            </Text>
                            <Input
                                type="date"
                                size="sm"
                                value={end}
                                onChange={(e) => handleFilterChange("end", e.target.value)}
                            />
                        </Box>
                    </VStack>
                </PopoverBody>
            </PopoverContent>
        </Popover>
    );
};

export default DateFilter;
