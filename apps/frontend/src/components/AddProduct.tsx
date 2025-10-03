import { useState } from "react";
import { useWallet } from "@vechain/dapp-kit-react";
import { ABIContract, Address, Clause, VET } from "@vechain/sdk-core";
import { ThorClient } from "@vechain/sdk-network";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Stack,
  Text,
  useToast,
  FormControl,
  FormLabel,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
} from "@chakra-ui/react";
import { DIGITAL_PRODUCT_STORE_ABI, config } from "@repo/config-contract";
import { THOR_URL } from "../config/constants";

enum TransactionStatus {
  NotSent = "NOT_SENT",
  Pending = "PENDING",
  Success = "SUCCESS",
  Reverted = "REVERTED",
}

interface AddProductProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddProduct({ isOpen, onClose, onSuccess }: AddProductProps) {
  const { account, signer } = useWallet();
  const toast = useToast();
  const {
    isOpen: isDrawerOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure();

  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [price, setPrice] = useState("");
  const [txId, setTxId] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<TransactionStatus>(TransactionStatus.NotSent);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setName("");
    setLink("");
    setPrice("");
    setTxId(null);
    setTxStatus(TransactionStatus.NotSent);
  };

  const onAddProduct = async () => {
    if (!name.trim() || !link.trim() || !price.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price greater than zero.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!account || !signer) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsLoading(true);
      onClose();

      const priceInVET = VET.of(priceNum);

      const contractClause = Clause.callFunction(
        Address.of(config.CONTRACT_ADDRESS),
        ABIContract.ofAbi(DIGITAL_PRODUCT_STORE_ABI).getFunction("addProduct"),
        [name, link, priceInVET.wei]
      );

      const tx = () =>
        signer.sendTransaction({
          clauses: [
            {
              to: contractClause.to,
              value: contractClause.value.toString(),
              data: contractClause.data.toString(),
            },
          ],
          comment: `Add product: ${name}`,
        });

      const result = await tx();
      setTxId(result);
      setTxStatus(TransactionStatus.Pending);
      onDrawerOpen();

      const thorClient = ThorClient.at(THOR_URL);
      const txReceipt = await thorClient.transactions.waitForTransaction(result);
      console.log("Transaction receipt:", txReceipt);

      if (txReceipt?.reverted) {
        setTxStatus(TransactionStatus.Reverted);
        toast({
          title: "Transaction Failed",
          description: "The transaction was reverted.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } else {
        setTxStatus(TransactionStatus.Success);
        toast({
          title: "Success!",
          description: "Product added successfully! Refreshing list...",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        resetForm();
        console.log("Calling onSuccess to refresh product list");
        onSuccess();
      }
    } catch (error) {
      console.error("Error adding product:", error);
      setTxStatus(TransactionStatus.Reverted);
      toast({
        title: "Error",
        description: "An error occurred while adding the product.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Product</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Product Name</FormLabel>
                <Input
                  placeholder="Enter product name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Download Link</FormLabel>
                <Input
                  placeholder="https://example.com/download"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Price (VET)</FormLabel>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="10.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="green"
              mr={3}
              onClick={onAddProduct}
              isLoading={isLoading}
              loadingText="Adding..."
            >
              Add Product
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Drawer isOpen={isDrawerOpen} placement="bottom" onClose={onDrawerClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Transaction Status</DrawerHeader>
          <DrawerBody>
            {txId && <Text>Transaction ID: {txId}</Text>}
            {txStatus === TransactionStatus.Pending && (
              <Text>Transaction is pending...</Text>
            )}
            {txStatus === TransactionStatus.Success && (
              <Text>Transaction succeeded! ✅</Text>
            )}
            {txStatus === TransactionStatus.Reverted && (
              <Text>Transaction reverted! ❌</Text>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
