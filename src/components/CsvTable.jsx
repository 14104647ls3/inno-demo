import { useState, useEffect } from "react";
import { Box, Button, ButtonGroup, Icon, Text, Spinner, Heading } from "@chakra-ui/react";
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { fetchTableData } from "../services/api";
import SortIcon from "./icons/SortIcon";
import { Link } from "react-router-dom";

const columns = [
    { accessorKey: "date", header: "Date" },
    { accessorKey: "lead_owner", header: "Lead Owner" },
    { accessorKey: "source", header: "Source" },
    { accessorKey: "deal_stage", header: "Deal Stage" },
    { accessorKey: "account_id", header: "Account ID" },
    { accessorKey: "first_name", header: "First Name" },
    { accessorKey: "last_name", header: "Last Name" },
    { accessorKey: "company", header: "Company" },
];

const CsvTable = ({ tableName }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const tableData = await fetchTableData(tableName);
                setData(tableData || []);
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

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        columnResizeMode: "onChange",
    });

    if (loading) return <Spinner />;
    if (error) return <Text color="red.500">Error: {error}</Text>;

    return (
        <Box>
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
                {table.getPageCount()}
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
