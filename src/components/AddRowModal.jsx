import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,
    Select,
    VStack,
    useToast
} from "@chakra-ui/react";
import { useState } from "react";
import { STATUSES } from "../data";

const AddRowModal = ({ isOpen, onClose, onAdd }) => {
    const toast = useToast();
    const [formData, setFormData] = useState({
        date: "",
        lead_owner: "",
        source: "",
        deal_stage: "",
        account_id: "",
        first_name: "",
        last_name: "",
        company: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        // Validate required fields
        if (!formData.date || !formData.deal_stage) {
            toast({
                title: "Error",
                description: "Date and Deal Stage are required.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        onAdd(formData);
        setFormData({
            date: "",
            lead_owner: "",
            source: "",
            deal_stage: "",
            account_id: "",
            first_name: "",
            last_name: "",
            company: ""
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Add New Row</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
                        <FormControl isRequired>
                            <FormLabel>Date</FormLabel>
                            <Input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Lead Owner</FormLabel>
                            <Input
                                name="lead_owner"
                                value={formData.lead_owner}
                                onChange={handleChange}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Source</FormLabel>
                            <Input
                                name="source"
                                value={formData.source}
                                onChange={handleChange}
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Deal Stage</FormLabel>
                            <Select
                                name="deal_stage"
                                value={formData.deal_stage}
                                onChange={handleChange}
                                placeholder="Select stage"
                            >
                                {STATUSES.map(status => (
                                    <option key={status.id} value={status.name}>
                                        {status.name}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl>
                            <FormLabel>Account ID</FormLabel>
                            <Input
                                name="account_id"
                                value={formData.account_id}
                                onChange={handleChange}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>First Name</FormLabel>
                            <Input
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Last Name</FormLabel>
                            <Input
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Company</FormLabel>
                            <Input
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                            />
                        </FormControl>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button colorScheme="blue" onClick={handleSubmit}>
                        Add
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default AddRowModal;
