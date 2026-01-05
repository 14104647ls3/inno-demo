import { useParams } from "react-router-dom";
import { Box, Flex } from "@chakra-ui/react";
import CsvViewer from "../components/CsvViewer";
import LlmPanel from "../components/LlmPanel";

const ViewPage = () => {
    const { id } = useParams(); // id is the table_name

    return (
        <Flex h="100vh" overflow="hidden">
            {/* Main Content Area (80%) */}
            <Box flex="1" overflowY="auto" p={6} borderRight="1px solid" borderColor="gray.200">
                <Box maxW="100%">
                    <CsvViewer tableName={id} />
                </Box>
            </Box>

            {/* AI Side Panel (20%, min-width constraint) */}
            <Box w="20%" minW="300px" bg="white">
                <LlmPanel />
            </Box>
        </Flex>
    );
};

export default ViewPage;
