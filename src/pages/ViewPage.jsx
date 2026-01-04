import { useParams, Link } from "react-router-dom";
import { Box, Heading, Button } from "@chakra-ui/react";
import CsvTable from "../components/CsvTable";

const ViewPage = () => {
    const { id } = useParams(); // id is the table_name

    return (
        <Box maxW={1200} mx="auto" px={6} pt={24} fontSize="sm">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={10}>
                <Heading>Viewing: {id}</Heading>
                <Button as={Link} to="/upload" colorScheme="teal" variant="outline">
                    Back to Uploads
                </Button>
            </Box>
            <CsvTable tableName={id} />
        </Box>
    );
};

export default ViewPage;
