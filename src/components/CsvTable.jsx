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
import { fetchTableData, updateTableRow, batchUpdateTableRows, addTableRow, deleteTableRows } from "../services/api";
import { SortIcon, SortIconAsc, SortIconDesc } from "./icons/SortIcon";
import { Link } from "react-router-dom";

import "./CsvTable.css";
import StatusCell from "./StatusCell";
import EditableCell from "./EditableCell";
import Filters from "./Filters";
import AddRowModal from "./AddRowModal";
import EditToolbar from "./EditToolbar";
import DateCell from "./DateCell";

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
    { accessorKey: "date", header: "Date", cell: DateCell, filterFn: dateFilterFn, enableGlobalFilter: false },
    { accessorKey: "lead_owner", header: "Lead Owner", cell: EditableCell },
    { accessorKey: "source", header: "Source", cell: EditableCell },
    { accessorKey: "deal_stage", header: "Deal Stage", cell: StatusCell, filterFn: multiSelectFilter }, // Removed enableGlobalFilter: false
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
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [rowSelection, setRowSelection] = useState({});

    // Always show checkbox column
    const tableColumns = useMemo(() => {
        return [
            {
                id: "select",
                header: ({ table }) => (
                    <Box display="flex" alignItems="center">
                        <input
                            type="checkbox"
                            checked={table.getIsAllRowsSelected()}
                            onChange={table.getToggleAllRowsSelectedHandler()}
                        />
                    </Box >
                ),
                cell: ({ row }) => (
                    <input
                        type="checkbox"
                        checked={row.getIsSelected()}
                        disabled={!row.getCanSelect()}
                        onChange={(e) => {
                            console.log("Selecting row ID:", row.original.id);
                            row.getToggleSelectedHandler()(e);
                        }}
                    />
                ),
            },
            ...columns
        ];
    }, []);

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

    const handleCancelEdit = () => {
        if (window.confirm("Are you sure you want to revert all changes done in editing mode?")) {
            setData(JSON.parse(JSON.stringify(originalData)));
            setIsEditing(false);
        }
    };

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
                        title: "Updated successfully",
                        description: `${changes.length} Row(s) updated.`,
                        status: "success",
                        duration: 3000,
                        isClosable: true,
                    });
                } catch (err) {
                    console.error("Failed to batch update rows:", err);
                    toast({
                        title: "Failed to update row(s)",
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

    const handleAddRow = async (newData) => {
        try {
            await addTableRow(tableName, newData);
            toast({
                title: "Row added",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            // Refresh data
            const tableData = await fetchTableData(tableName);
            setData(tableData || []);
            setOriginalData(JSON.parse(JSON.stringify(tableData || [])));
        } catch (err) {
            toast({
                title: "Error adding row",
                description: err.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleDeleteRows = async () => {
        const selectedRowIds = Object.keys(rowSelection);

        if (selectedRowIds.length === 0) return;

        if (!window.confirm(`Are you sure you want to delete ${selectedRowIds.length} rows?`)) {
            return;
        }

        try {
            const deletedRows = await deleteTableRows(tableName, selectedRowIds);
            toast({
                title: "Row(s) deleted",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            console.log("Deleted rows:", deletedRows);
            // Refresh data
            const tableData = await fetchTableData(tableName);
            setData(tableData || []);
            setOriginalData(JSON.parse(JSON.stringify(tableData || [])));
            setRowSelection({});
        } catch (err) {
            toast({
                title: "Error deleting rows",
                description: err.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };


    const table = useReactTable({
        data: filteredData,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getRowId: (row) => row.id, // Use row.id as the unique identifier
        enableRowSelection: true, // Enable row selection
        onRowSelectionChange: setRowSelection, // Update state
        initialState: {
            pagination: {
                pageSize: 25,
            },
        },
        state: {
            rowSelection,
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
            <Box mb={6} display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={3}>
                    <Filters
                        columnFilters={table.getState().columnFilters}
                        setColumnFilters={table.setColumnFilters}
                        globalFilter={globalFilter}
                        setGlobalFilter={setGlobalFilter}
                    />
                    <EditToolbar
                        selectedCount={Object.keys(rowSelection).length}
                        onDelete={handleDeleteRows}
                        onAdd={() => setIsAddModalOpen(true)}
                        onDeselectAll={() => setRowSelection({})}
                    />
                </Box>
                <Box display="flex" gap={2}>
                    {isEditing && (
                        <Button onClick={handleCancelEdit} colorScheme="red" size="sm">
                            Cancel
                        </Button>
                    )}
                    <Button onClick={handleToggleEdit} colorScheme={isEditing ? "green" : "blue"} size="sm">
                        {isEditing ? "Save" : "Edit Mode"}
                    </Button>
                </Box>
            </Box>

            <Box className="table" w={table.getTotalSize()}>
                {table.getHeaderGroups().map((headerGroup) => (
                    <Box className="tr" key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                            <Box className="th" w={header.getSize()} key={header.id}>
                                {flexRender(header.column.columnDef.header, header.getContext())}
                                {header.column.getCanSort() && (
                                    <Icon
                                        as={
                                            {
                                                asc: SortIconAsc,
                                                desc: SortIconDesc,
                                            }[header.column.getIsSorted()] ?? SortIcon
                                        }
                                        mx={3}
                                        fontSize={14}
                                        onClick={header.column.getToggleSortingHandler()}
                                        cursor="pointer"
                                    />
                                )}
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
            <AddRowModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddRow}
            />
        </Box>
    );
};
export default CsvTable;
