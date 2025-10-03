import { useState } from "react";
import { useWallet } from "@vechain/dapp-kit-react";
import { ABIContract, Address, Clause } from "@vechain/sdk-core";
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
  Text,
  useToast,
  Stack,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
} from "@chakra-ui/react";
import { DIGITAL_PRODUCT_STORE_ABI, config } from "@repo/config-contract";
import { THOR_URL } from "../config/constants";
import { VetBalance } from "./vetbalance";

enum TransactionStatus {
  NotSent = "NOT_SENT",
  Pending = "PENDING",
  Success = "SUCCESS",
  Reverted = "REVERTED",
}

interface PurchaseProductProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  productPrice: bigint;
  onSuccess: () => void;
}

export function PurchaseProduct({ isOpen, onClose, productId, productPrice, onSuccess }: PurchaseProductProps) {
  const { account, signer } = useWallet();
  const toast = useToast();
  const {
    isOpen: isDrawerOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure();

  const [txId, setTxId] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<TransactionStatus>(TransactionStatus.NotSent);
  const [isLoading, setIsLoading] = useState(false);

  const onPurchase = async () => {
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

      const contractClause = Clause.callFunction(
        Address.of(config.CONTRACT_ADDRESS),
        ABIContract.ofAbi(DIGITAL_PRODUCT_STORE_ABI).getFunction("purchaseProduct"),
        [productId]
      );

      const tx = () =>
        signer.sendTransaction({
          clauses: [
            {
              to: contractClause.to,
              value: productPrice.toString(),
              data: contractClause.data.toString(),
            },
          ],
          comment: `Product #${productId} purchase`,
        });

      const result = await tx();
      setTxId(result);
      setTxStatus(TransactionStatus.Pending);
      onDrawerOpen();

      const thorClient = ThorClient.at(THOR_URL);
      const txReceipt = await thorClient.transactions.waitForTransaction(result);

      if (txReceipt?.reverted) {
        setTxStatus(TransactionStatus.Reverted);
        toast({
          title: "Transaction Failed",
          description: "The purchase transaction was reverted.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } else {
        setTxStatus(TransactionStatus.Success);
        toast({
          title: "Success!",
          description: "Product purchased successfully! Check your product list for the download link.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        onSuccess();
      }
    } catch (error) {
      console.error("Error purchasing product:", error);
      setTxStatus(TransactionStatus.Reverted);
      toast({
        title: "Error",
        description: "An error occurred while purchasing the product.",
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
          <ModalHeader>Confirm Purchase</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <Text fontSize="md">
                You are about to purchase this digital product for:
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                {(Number(productPrice) / 1e18).toFixed(2)} VET
              </Text>
              <Text fontSize="sm" color="gray.600">
                After purchase, you will receive access to the download link.
              </Text>
              <VetBalance />
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={onPurchase}
              isLoading={isLoading}
              loadingText="Processing..."
            >
              Confirm Purchase
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
          <DrawerHeader>Purchase Status</DrawerHeader>
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
