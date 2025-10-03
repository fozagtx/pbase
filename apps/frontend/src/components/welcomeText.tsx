import { Box, Heading, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";

const headingVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.3, ease: "easeOut" },
  },
};

const emojiVariants = {
  hover: {
    scale: 1.2,
    rotate: [0, 10, -10, 0],
    transition: { duration: 0.3, repeat: Infinity, repeatType: "loop" as const },
  },
};

export const WelcomeText = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      textAlign="center"
      py={6}
      gap={3}
    >
      <Heading
        as={motion.h1}
        variants={headingVariants}
        initial="hidden"
        animate="visible"
        size={{ base: "lg", md: "xl" }}
        bgGradient="linear(to-r, blue.400, purple.500)"
        bgClip="text"
        fontWeight="bold"
      >
        Digital Product Store
      </Heading>
      <Text
        as={motion.p}
        variants={textVariants}
        initial="hidden"
        animate="visible"
        fontSize={{ base: "md", md: "lg" }}
        color="gray.600"
        display="flex"
        alignItems="center"
        gap={2}
      >
        Browse and purchase digital products with VET{" "}
        <Box
          as={motion.span}
          variants={emojiVariants}
          whileHover="hover"
          display="inline-block"
        >
          🛒💎
        </Box>
      </Text>
    </Box>
  );
};
