import { Link } from "react-router-dom";
import { Box, Heading, Button } from "@chakra-ui/react";
import CsvTable from "./CsvTable";

const CsvViewer = ({ tableName }) => {
    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={10}>
                <Heading>Viewing: {tableName}</Heading>
                <Button as={Link} to="/upload" colorScheme="teal" variant="outline">
                    Back to Uploads
                </Button>
            </Box>
            <CsvTable tableName={tableName} />
        </Box>
    );
};

export default CsvViewer;
