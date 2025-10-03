import { ABIContract, Address, Clause } from "@vechain/sdk-core";
import { ThorClient } from "@vechain/sdk-network";
import {
  Box,
  Button,
  Stack,
  Heading,
  useToast,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  Text,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { DIGITAL_PRODUCT_STORE_ABI, config } from "@repo/config-contract";
import { THOR_URL } from "../config/constants";
import { AddProduct } from "./AddProduct";
import { useWallet } from "@vechain/dapp-kit-react";
import { useState, useEffect } from "react";

enum TransactionStatus {
  NotSent = "NOT_SENT",
  Pending = "PENDING",
  Success = "SUCCESS",
  Reverted = "REVERTED",
}

export function OwnerPanel({ onProductAdded }: { onProductAdded: () => void }) {
  const { account, signer } = useWallet();
  const toast = useToast();
  const {
    isOpen: isAddProductOpen,
    onOpen: onAddProductOpen,
    onClose: onAddProductClose,
  } = useDisclosure();
  const {
    isOpen: isDrawerOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure();
  const [sellerBalance, setSellerBalance] = useState<bigint>(BigInt(0));
  const [txId, setTxId] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<TransactionStatus>(TransactionStatus.NotSent);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkSellerBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  const checkSellerBalance = async () => {
    if (!account) {
      setSellerBalance(BigInt(0));
      return;
    }

    try {
      const thorClient = ThorClient.at(THOR_URL);
      const contract = ABIContract.ofAbi(DIGITAL_PRODUCT_STORE_ABI);
      const result = await thorClient.contracts.executeCall(
        config.CONTRACT_ADDRESS,
        contract.getFunction("sellerBalances"),
        [account]
      );
      const balance = BigInt(String((result as unknown as unknown[])[0]));
      setSellerBalance(balance);
    } catch (error) {
      console.error("Error checking seller balance:", error);
      setSellerBalance(BigInt(0));
    }
  };

  const onWithdrawFunds = async () => {
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
      const contract = ABIContract.ofAbi(DIGITAL_PRODUCT_STORE_ABI);
      const contractClause = Clause.callFunction(
        Address.of(config.CONTRACT_ADDRESS),
        contract.getFunction("withdrawFunds"),
        []
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
          comment: "Withdraw seller earnings",
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
          description: "The withdrawal transaction was reverted.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } else {
        setTxStatus(TransactionStatus.Success);
        toast({
          title: "Success!",
          description: "Funds withdrawn successfully!",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        checkSellerBalance();
      }
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      setTxStatus(TransactionStatus.Reverted);
      toast({
        title: "Error",
        description: "An error occurred while withdrawing funds.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!account) {
    return null;
  }

  const balanceInVET = Number(sellerBalance) / 1e18;

  return (
    <>
      <Box width="100%" maxW="1200px" mx="auto" px={4} py={6}>
        <Card bg="green.50" borderColor="green.200" borderWidth={2}>
          <CardBody>
            <Stack spacing={4}>
              <Heading size="md">Seller Panel</Heading>
              <Text fontSize="lg">
                Your Balance: <strong>{balanceInVET.toFixed(4)} VET</strong>
              </Text>
              <Stack direction={{ base: "column", md: "row" }} spacing={4}>
                <Button colorScheme="green" onClick={onAddProductOpen}>
                  Add New Product
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={onWithdrawFunds}
                  isLoading={isLoading}
                  loadingText="Withdrawing..."
                  isDisabled={sellerBalance === BigInt(0)}
                >
                  Withdraw Funds
                </Button>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
      </Box>

      <AddProduct
        isOpen={isAddProductOpen}
        onClose={onAddProductClose}
        onSuccess={() => {
          onAddProductClose();
          onProductAdded();
        }}
      />

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
