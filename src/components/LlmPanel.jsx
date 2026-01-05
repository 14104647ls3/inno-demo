import React, { useState } from 'react';
import { Box, Heading, Input, Text, HStack, Flex, IconButton, Icon } from "@chakra-ui/react";
import { ArrowUpIcon } from "@chakra-ui/icons";
import { FaRobot, FaUser } from "react-icons/fa"; // You might need to install react-icons if not present, but using default icons if fails

const LlmPanel = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your AI assistant. How can I help you with this data?' }
    ]);
    const [inputValue, setInputValue] = useState('');

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        const newMessages = [
            ...messages,
            { role: 'user', content: inputValue }
        ];

        // Simulate a simple response for now since we don't have a backend LLM yet
        setTimeout(() => {
            setMessages(prev => [
                ...prev,
                { role: 'assistant', content: "I'm a placeholder AI. I received your message: " + inputValue }
            ]);
        }, 1000);

        setMessages(newMessages);
        setInputValue('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <Flex direction="column" h="100%" bg="gray.900" color="white" borderLeft="1px solid" borderColor="gray.700">
            {/* Header */}
            <Box p={4} borderBottom="1px solid" borderColor="gray.700" bg="gray.800" boxShadow="sm">
                <HStack spacing={3}>
                    <Box p={1.5} bg="teal.500" borderRadius="md">
                        <FaRobot color="white" />
                    </Box>
                    <Heading size="sm" letterSpacing="wide">AI Data Analyst</Heading>
                </HStack>
            </Box>

            {/* Messages Area */}
            <Box flex="1" overflowY="auto" p={4} display="flex" flexDirection="column" gap={4} css={{
                '&::-webkit-scrollbar': { width: '4px' },
                '&::-webkit-scrollbar-track': { width: '6px' },
                '&::-webkit-scrollbar-thumb': { background: '#4A5568', borderRadius: '24px' },
            }}>
                {messages.map((msg, index) => (
                    <Flex
                        key={index}
                        alignSelf={msg.role === 'user' ? 'flex-end' : 'flex-start'}
                        maxW="85%"
                        align="flex-end"
                        gap={2}
                        flexDirection={msg.role === 'user' ? 'row-reverse' : 'row'}
                    >
                        <Box
                            minW="24px" minH="24px" w="24px" h="24px"
                            borderRadius="full"
                            bg={msg.role === 'user' ? 'blue.500' : 'teal.500'}
                            display="flex" alignItems="center" justifyContent="center"
                            fontSize="xs" fontWeight="bold"
                        >
                            {msg.role === 'user' ? 'U' : 'AI'}
                        </Box>
                        <Box
                            bg={msg.role === 'user' ? 'blue.600' : 'gray.700'}
                            color="white"
                            px={4}
                            py={3}
                            borderRadius="2xl"
                            borderBottomRightRadius={msg.role === 'user' ? 'sm' : '2xl'}
                            borderBottomLeftRadius={msg.role === 'assistant' ? 'sm' : '2xl'}
                            fontSize="sm"
                            boxShadow="md"
                        >
                            <Text>{msg.content}</Text>
                        </Box>
                    </Flex>
                ))}
            </Box>

            {/* Input Area */}
            <Box p={4} borderTop="1px solid" borderColor="gray.700" bg="gray.800">
                <HStack spacing={2} bg="gray.700" borderRadius="full" px={2} py={1} border="1px solid" borderColor="gray.600">
                    <Input
                        placeholder="Ask for insights..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        variant="unstyled"
                        px={3}
                        py={2}
                        color="white"
                        _placeholder={{ color: 'gray.400' }}
                    />
                    <IconButton
                        aria-label="Send message"
                        icon={<ArrowUpIcon />}
                        colorScheme="blue"
                        onClick={handleSendMessage}
                        isRound
                        size="sm"
                        isDisabled={!inputValue.trim()}
                        _hover={{ transform: 'translateY(-1px)', boxShadow: 'lg' }}
                        transition="all 0.2s"
                    />
                </HStack>
                <Text fontSize="xs" color="gray.500" textAlign="center" mt={2}>
                    AI can make mistakes. Verify important info.
                </Text>
            </Box>
        </Flex>
    );
};

export default LlmPanel;
