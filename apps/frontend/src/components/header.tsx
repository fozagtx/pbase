import { Box, Flex, Text } from "@chakra-ui/react";
import { LoginButton } from "./loginbutton";
import './header.css';

export function AppHeader() {
    return (
        <Box
            width="100%"
            position="fixed"
            top={0}
            left={0}
            zIndex={1000}
            bg="transparent"
            py={4}
        >
            <Flex
                maxW="1200px"
                mx="auto"
                px={{ base: 4, md: 6 }}
                alignItems="center"
                justifyContent="center"
                gap={6}
            >
                <Text
                    fontSize={{ base: "xl", md: "2xl" }}
                    fontWeight="bold"
                    bgGradient="linear(to-r, blue.400, purple.500)"
                    bgClip="text"
                >
                    pbase
                </Text>
                <LoginButton />
            </Flex>
        </Box>
    );
}
