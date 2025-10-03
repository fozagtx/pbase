import { useEffect, useState } from "react";
import { Box, Card, CardBody, CardHeader, Heading, Text, Button, Stack, Badge, Spinner, useToast } from "@chakra-ui/react";
import { ABIContract } from "@vechain/sdk-core";
import { ThorClient } from "@vechain/sdk-network";
import { DIGITAL_PRODUCT_STORE_ABI, config } from "@repo/config-contract";
import { THOR_URL } from "../config/constants";
import { useWallet } from "@vechain/dapp-kit-react";

interface Product {
  id: number;
  name: string;
  link: string;
  price: bigint;
  isActive: boolean;
  hasPurchased: boolean;
}

export function ProductList({ onPurchase }: { onPurchase: (productId: number, price: bigint) => void }) {
  const { account } = useWallet();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const thorClient = ThorClient.at(THOR_URL);
      const contract = ABIContract.ofAbi(DIGITAL_PRODUCT_STORE_ABI);

      const lengthResult = await thorClient.contracts.executeCall(
        config.CONTRACT_ADDRESS,
        contract.getFunction("getProductLength"),
        []
      );

      const productCount = Number((lengthResult as unknown as unknown[])[0]);
      const productPromises = [];

      for (let i = 0; i < productCount; i++) {
        productPromises.push(
          thorClient.contracts.executeCall(config.CONTRACT_ADDRESS, contract.getFunction("getProduct"), [i])
        );

        if (account) {
          productPromises.push(
            thorClient.contracts.executeCall(config.CONTRACT_ADDRESS, contract.getFunction("hasUserPurchased"), [account, i])
          );
        }
      }

      const results = await Promise.all(productPromises);
      const productList: Product[] = [];

      for (let i = 0; i < productCount; i++) {
        const productIndex = account ? i * 2 : i;
        const purchaseIndex = account ? i * 2 + 1 : -1;

        const productData = results[productIndex] as unknown as unknown[];
        const hasPurchased = purchaseIndex >= 0 ? Boolean((results[purchaseIndex] as unknown as unknown[])[0]) : false;

        productList.push({
          id: i,
          name: String(productData[0]),
          link: String(productData[1]),
          price: BigInt(String(productData[2])),
          isActive: Boolean(productData[3]),
          hasPurchased,
        });
      }

      setProducts(productList);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to load products.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={10}>
        <Spinner size="xl" />
      </Box>
    );
  }

  if (products.length === 0) {
    return (
      <Box textAlign="center" py={10}>
        <Text fontSize="lg" color="gray.500">
          No products available yet.
        </Text>
      </Box>
    );
  }

  return (
    <Box width="100%" maxW="1200px" mx="auto" px={4} py={6}>
      <Heading size="lg" mb={6}>
        Digital Products
      </Heading>
      <Stack spacing={4}>
        {products.map((product) => (
          <Card key={product.id} variant="outline">
            <CardHeader>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Heading size="md">{product.name}</Heading>
                <Badge colorScheme={product.isActive ? "green" : "red"}>
                  {product.isActive ? "Available" : "Unavailable"}
                </Badge>
              </Box>
            </CardHeader>
            <CardBody>
              <Stack spacing={4}>
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                  {(Number(product.price) / 1e18).toFixed(2)} VET
                </Text>
                {product.hasPurchased && product.link && (
                  <Box p={4} bg="green.50" borderRadius="md">
                    <Text fontSize="sm" fontWeight="bold" mb={2}>
                      Download Link:
                    </Text>
                    <Text fontSize="sm" wordBreak="break-all">
                      <a href={product.link} target="_blank" rel="noopener noreferrer" style={{ color: "blue" }}>
                        {product.link}
                      </a>
                    </Text>
                  </Box>
                )}
                {!product.hasPurchased && product.isActive && account && (
                  <Button
                    colorScheme="blue"
                    onClick={() => onPurchase(product.id, product.price)}
                  >
                    Purchase Product
                  </Button>
                )}
                {!product.hasPurchased && product.isActive && !account && (
                  <Text fontSize="sm" color="gray.500">
                    Connect your wallet to purchase
                  </Text>
                )}
                {product.hasPurchased && (
                  <Badge colorScheme="green" fontSize="md" p={2}>
                    ✅ Already Purchased
                  </Badge>
                )}
              </Stack>
            </CardBody>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
