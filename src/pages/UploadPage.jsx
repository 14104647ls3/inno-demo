import { useState } from "react";
import { Box, Heading, Button, Text, Input, FormControl, FormLabel, useToast, Progress } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import Papa from "papaparse";
import { createMasterEntry, createTableSchema, insertTableData } from "../services/api";
import UploadsTable from "../components/UploadsTable";

const UploadPage = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploadKey, setUploadKey] = useState(0);
    const toast = useToast();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const sanitizeHeader = (header) => {
        // Sanitize headers to be safe column names (alphanumeric + underscores)
        return header.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        setProgress(10);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const { data } = results;

                    if (data.length === 0) {
                        throw new Error("CSV file is empty");
                    }

                    setProgress(30);

                    // 1. Create Metadata Entry in Master Table
                    const timestamp = new Date().getTime();
                    const cleanFileName = file.name.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
                    const uniqueTableName = `leads_${cleanFileName}_${timestamp}`; // e.g. leads_sample_csv_123456

                    await createMasterEntry(file.name, uniqueTableName);

                    setProgress(50);

                    // 2. Create Table with Fixed Schema using RPC
                    await createTableSchema(uniqueTableName);

                    setProgress(70);

                    // 3. Prepare and Insert Data
                    // Map CSV columns to our fixed DB columns
                    // CSV: Date,Lead Owner,Source,Deal Stage,Account Id,First Name,Last Name,Company
                    // DB: date, lead_owner, source, deal_stage, account_id, first_name, last_name, company
                    const formattedData = data.map(row => {
                        // Helper to safe get value
                        const getVal = (key) => row[key] || row[Object.keys(row).find(k => k.trim().toLowerCase() === key.toLowerCase())] || null;

                        return {
                            date: getVal("Date"),
                            lead_owner: getVal("Lead Owner"),
                            source: getVal("Source"),
                            deal_stage: getVal("Deal Stage"),
                            account_id: getVal("Account Id"),
                            first_name: getVal("First Name"),
                            last_name: getVal("Last Name"),
                            company: getVal("Company")
                        };
                    }).filter(row => row.date || row.lead_owner); // Filter out potentially empty parsing artifacts

                    // Insert in batches
                    await insertTableData(uniqueTableName, formattedData);

                    setProgress(100);
                    toast({
                        title: "Upload Successful",
                        description: `File uploaded and table '${uniqueTableName}' created with lead data.`,
                        status: "success",
                        duration: 5000,
                        isClosable: true,
                    });
                    setUploadKey(prev => prev + 1);

                } catch (error) {
                    console.error("Upload failed:", error);
                    toast({
                        title: "Upload Failed",
                        description: error.message || "An unexpected error occurred",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                } finally {
                    setLoading(false);
                    setFile(null); // Reset file input
                }
            },
            error: (error) => {
                console.error("CSV Parse Error:", error);
                setLoading(false);
                toast({
                    title: "CSV Parse Error",
                    status: "error",
                    isClosable: true,
                });
            }
        });
    };

    return (
        <Box maxW={1000} mx="auto" px={6} pt={24} fontSize="sm">
            <Heading mb={10}>Upload CSV</Heading>

            {/* <Box mb={6}>
                <Button as={Link} to="/" colorScheme="teal" variant="outline" mb={4}>
                    Back to Home
                </Button>
            </Box> */}

            <Box p={6} borderWidth={1} borderRadius="md" boxShadow="sm" mb={10}>
                <FormControl mb={4}>
                    <FormLabel>Select CSV File</FormLabel>
                    <Input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        p={1}
                    />
                </FormControl>

                {loading && (
                    <Box mb={4}>
                        <Text mb={2}>Uploading... {progress}%</Text>
                        <Progress value={progress} size="sm" colorScheme="blue" />
                    </Box>
                )}

                <Button
                    colorScheme="blue"
                    onClick={handleUpload}
                    isLoading={loading}
                    isDisabled={!file}
                >
                    {loading ? "Uploading..." : "Upload & Seed Database"}
                </Button>
            </Box>

            <Heading size="md" mb={4}>Uploaded Files</Heading>
            <UploadsTable key={uploadKey} />
        </Box>
    );
};

export default UploadPage;
