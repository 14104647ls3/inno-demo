import { useState, useEffect, useMemo } from "react";
import { Box, Button, ButtonGroup, Icon, Text, Spinner, Heading, useToast } from "@chakra-ui/react";
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { fetchTableData, updateTableRow, batchUpdateTableRows } from "../services/api";
import SortIcon from "./icons/SortIcon";
import { Link } from "react-router-dom";
import StatusCell from "./StatusCell";
import EditableCell from "./EditableCell";
import Filters from "./Filters";

const dateFilterFn = (row, columnId, filterValue) => {
    const { start, end } = filterValue || {};
    if (!start && !end) return true;

    const rowValue = row.getValue(columnId);
    const rowDate = rowValue ? new Date(rowValue) : null;

    // Normalize dates to midnight for comparison to avoid time issues
    if (rowDate) rowDate.setHours(0, 0, 0, 0);

    if (start) {
        const startDate = new Date(start);
        startDate.setHours(0, 0, 0, 0);
        if (!rowDate || rowDate < startDate) return false;
    }

    if (end) {
        const endDate = new Date(end);
        endDate.setHours(0, 0, 0, 0);
        if (!rowDate || rowDate > endDate) return false;
    }

    return true;
};

const multiSelectFilter = (row, columnId, filterValue) => {
    if (!filterValue || filterValue.length === 0) return true;
    const rowValue = row.getValue(columnId);
    // Case-insensitive check
    return filterValue.some(val => String(val).toLowerCase() === String(rowValue || "").toLowerCase());
};

const columns = [
    { accessorKey: "date", header: "Date", cell: EditableCell, filterFn: dateFilterFn, enableGlobalFilter: false },
    { accessorKey: "lead_owner", header: "Lead Owner", cell: EditableCell },
    { accessorKey: "source", header: "Source", cell: EditableCell },
    { accessorKey: "deal_stage", header: "Deal Stage", cell: EditableCell, filterFn: multiSelectFilter }, // Removed enableGlobalFilter: false
    { accessorKey: "account_id", header: "Account ID", cell: EditableCell },
    { accessorKey: "first_name", header: "First Name", cell: EditableCell },
    { accessorKey: "last_name", header: "Last Name", cell: EditableCell },
    { accessorKey: "company", header: "Company", cell: EditableCell },
];

const CsvTable = ({ tableName }) => {
    const toast = useToast();
    const [data, setData] = useState([]);
    const [originalData, setOriginalData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [globalFilter, setGlobalFilter] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const tableData = await fetchTableData(tableName);
                setData(tableData || []);
                setOriginalData(JSON.parse(JSON.stringify(tableData || [])));
            } catch (err) {
                console.error("Error fetching table data:", err);
                setError(err.message);
            }
            setLoading(false);
        };

        if (tableName) {
            fetchData();
        }
    }, [tableName]);

    const filteredData = useMemo(() => {
        return data.filter((row) => {
            if (!globalFilter) return true;
            const searchLower = globalFilter.toLowerCase();

            return columns.some((column) => {
                // Exclude date from global search
                if (column.accessorKey === "date") return false;

                const value = row[column.accessorKey];
                return String(value || "").toLowerCase().includes(searchLower);
            });
        });
    }, [data, globalFilter]);

    const handleToggleEdit = async () => {
        if (isEditing) {
            const changes = [];
            data.forEach((row, index) => {
                const originalRow = originalData[index];
                if (JSON.stringify(row) !== JSON.stringify(originalRow)) {
                    // Identify diffs
                    const updates = {};
                    Object.keys(row).forEach((key) => {
                        if (row[key] !== originalRow[key]) {
                            updates[key] = row[key];
                        }
                    });

                    if (Object.keys(updates).length > 0) {
                        changes.push({ id: row.id, updates });
                    }
                }
            });

            console.log("Changes to save:", changes);

            if (changes.length > 0) {
                // Prepare payload for upsert (must include ID + changed fields)
                // We need to merge the full updates object so we construct the payload correctly
                const payload = changes.map(change => ({
                    id: change.id,
                    ...change.updates
                }));

                try {
                    await batchUpdateTableRows(tableName, payload);
                    toast({
                        title: "Rows updated successfully",
                        description: `${changes.length} rows updated.`,
                        status: "success",
                        duration: 3000,
                        isClosable: true,
                    });
                } catch (err) {
                    console.error("Failed to batch update rows:", err);
                    toast({
                        title: "Failed to update rows",
                        description: err.message,
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                }
            }

            // Sync originalData after save
            setOriginalData(JSON.parse(JSON.stringify(data)));
        }
        setIsEditing(!isEditing);
    };

    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        initialState: {
            pagination: {
                pageSize: 25,
            },
        },
        columnResizeMode: "onChange",
        meta: {
            isEditing,
            updateData: (rowIndex, columnId, value) =>
                setData((prev) =>
                    prev.map((row, index) =>
                        index === rowIndex
                            ? {
                                ...prev[rowIndex],
                                [columnId]: value,
                            }
                            : row
                    )
                ),
        },
    });

    if (loading) return <Spinner />;
    if (error) return <Text color="red.500">Error: {error}</Text>;

    return (
        <Box>
            <Filters
                columnFilters={table.getState().columnFilters}
                setColumnFilters={table.setColumnFilters}
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                isEditing={isEditing}
                onToggleEdit={handleToggleEdit}
            />
            <Box className="table" w={table.getTotalSize()}>
                {table.getHeaderGroups().map((headerGroup) => (
                    <Box className="tr" key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                            <Box className="th" w={header.getSize()} key={header.id}>
                                {header.column.columnDef.header}
                                {header.column.getCanSort() && (
                                    <Icon
                                        as={SortIcon}
                                        mx={3}
                                        fontSize={14}
                                        onClick={header.column.getToggleSortingHandler()}
                                    />
                                )}
                                {
                                    {
                                        asc: " 🔼",
                                        desc: " 🔽",
                                    }[header.column.getIsSorted()]
                                }
                                <Box
                                    onMouseDown={header.getResizeHandler()}
                                    onTouchStart={header.getResizeHandler()}
                                    className={`resizer ${header.column.getIsResizing() ? "isResizing" : ""
                                        }`}
                                />
                            </Box>
                        ))}
                    </Box>
                ))}
                {table.getRowModel().rows.map((row) => (
                    <Box className="tr" key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                            <Box className="td" w={cell.column.getSize()} key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </Box>
                        ))}
                    </Box>
                ))}
            </Box>

            {data.length === 0 && <Text mt={4}>No data found in this table.</Text>}

            <br />
            <Text mb={2}>
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()} | Total Entries: {table.getFilteredRowModel().rows.length}
            </Text>
            <ButtonGroup size="sm" isAttached variant="outline">
                <Button
                    onClick={() => table.previousPage()}
                    isDisabled={!table.getCanPreviousPage()}
                >
                    {"<"}
                </Button>
                <Button
                    onClick={() => table.nextPage()}
                    isDisabled={!table.getCanNextPage()}
                >
                    {">"}
                </Button>
            </ButtonGroup>
        </Box>
    );
};
export default CsvTable;
