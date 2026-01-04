import { Box, Heading, Button } from "@chakra-ui/react";
import { Routes, Route, Link } from "react-router-dom";
import TaskTable from "./components/TaskTable";
import UploadPage from "./pages/UploadPage";

function Home() {
  return (
    <Box maxW={1000} mx="auto" px={6} pt={24} fontSize="sm">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={10}>
        <Heading>TanStack Table</Heading>
        <Button as={Link} to="/upload" colorScheme="blue">
          Upload CSV
        </Button>
      </Box>
      <TaskTable />
    </Box>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/upload" element={<UploadPage />} />
    </Routes>
  );
}

export default App;
