import { useState, useEffect } from "react";
import { Box, Button, Heading, Text, Link as ChakraLink, Spinner, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { fetchMasterUploads } from "../services/api";

const UploadsTable = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUploads = async () => {
        setLoading(true);
        try {
            const uploads = await fetchMasterUploads();
            setData(uploads || []);
        } catch (error) {
            console.error('Error fetching uploads:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUploads();
    }, []);

    const columns = [
        {
            accessorKey: "filename",
            header: "Filename",
        },
        {
            accessorKey: "table_name",
            header: "Upload ID",
        },
        {
            accessorKey: "created_at",
            header: "Uploaded At",
            cell: (info) => new Date(info.getValue()).toLocaleString(),
        },
        {
            id: "actions",
            header: "Actions",
            cell: (info) => (
                <Button
                    as={Link}
                    to={`/view/${info.row.original.table_name}`}
                    colorScheme="blue"
                    size="sm"
                >
                    View
                </Button>
            ),
        },
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (loading) {
        return <Spinner />;
    }

    if (data.length === 0) {
        return <Text>No uploads found.</Text>;
    }

    return (
        <Box className="table" w={table.getTotalSize()}>
            {table.getHeaderGroups().map((headerGroup) => (
                <Box className="tr" key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                        <Box className="th" w={header.getSize()} key={header.id}>
                            {flexRender(header.column.columnDef.header, header.getContext())}
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
    );
};

export default UploadsTable;
