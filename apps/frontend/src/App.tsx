import { useState } from "react";
import { Box } from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";
import { AppHeader } from "./components/header";
import { WelcomeText } from "./components/welcomeText";
import { ProductList } from "./components/ProductList";
import { PurchaseProduct } from "./components/PurchaseProduct";
import { OwnerPanel } from "./components/OwnerPanel";
import "./App.css";

const App = () => {
  const [refreshProducts, setRefreshProducts] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<{ id: number; price: bigint } | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handlePurchase = (productId: number, price: bigint) => {
    setSelectedProduct({ id: productId, price });
    onOpen();
  };

  const handlePurchaseSuccess = () => {
    setRefreshProducts((prev) => prev + 1);
    onClose();
  };

  const handleProductAdded = () => {
    setRefreshProducts((prev) => prev + 1);
  };

  return (
    <Box minH="100vh" width="100%">
      <AppHeader />
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        width="100%"
        maxW="1200px"
        px={{ base: 4, md: 6 }}
        pt={{ base: 20, md: 24 }}
        pb={6}
        flex={1}
        mx="auto"
      >
        <WelcomeText />
        <OwnerPanel onProductAdded={handleProductAdded} />
        <ProductList key={refreshProducts} onPurchase={handlePurchase} />
      </Box>

      {selectedProduct && (
        <PurchaseProduct
          isOpen={isOpen}
          onClose={onClose}
          productId={selectedProduct.id}
          productPrice={selectedProduct.price}
          onSuccess={handlePurchaseSuccess}
        />
      )}
    </Box>
  );
};

export default App;
