// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DigitalProductStore {
    address public owner;
    Product[] public products;
    mapping(address => mapping(uint => bool)) public hasPurchased;
    mapping(uint => uint) public productSales;
    mapping(uint => address) public productOwners;
    mapping(address => uint256) public sellerBalances;

    struct Product {
        string name;
        string link;
        uint256 price;
        bool isActive;
        address seller;
    }

    event ProductAdded(
        uint indexed productId,
        string name,
        string link,
        uint256 price
    );
    event ProductPurchased(
        address indexed buyer,
        uint indexed productId,
        string link
    );
    event FundsWithdrawn(address indexed owner, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    function addProduct(
        string memory name,
        string memory link,
        uint256 price
    ) public {
        require(price > 0, "Price must be greater than zero");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(link).length > 0, "Link cannot be empty");

        uint productId = products.length;
        products.push(
            Product({
                name: name,
                link: link,
                price: price,
                isActive: true,
                seller: msg.sender
            })
        );
        productOwners[productId] = msg.sender;

        emit ProductAdded(productId, name, link, price);
    }

    function purchaseProduct(uint productId) public payable {
        require(productId < products.length, "Product does not exist");
        Product memory product = products[productId];
        require(product.isActive, "Product is not available");
        require(msg.value == product.price, "Incorrect payment amount");
        require(
            !hasPurchased[msg.sender][productId],
            "Product already purchased"
        );

        hasPurchased[msg.sender][productId] = true;
        productSales[productId] += 1;

        // Credit the seller's balance
        sellerBalances[product.seller] += msg.value;

        emit ProductPurchased(msg.sender, productId, product.link);
    }

    function getProduct(
        uint productId
    )
        public
        view
        returns (
            string memory name,
            string memory link,
            uint256 price,
            bool isActive
        )
    {
        require(productId < products.length, "Product does not exist");
        Product memory product = products[productId];
        string memory productLink = (hasPurchased[msg.sender][productId] ||
            msg.sender == owner)
            ? product.link
            : "";
        return (product.name, productLink, product.price, product.isActive);
    }

    function getProductLength() public view returns (uint) {
        return products.length;
    }

    function withdrawFunds() public {
        uint256 balance = sellerBalances[msg.sender];
        require(balance > 0, "No funds to withdraw");

        sellerBalances[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success, "Withdrawal failed");

        emit FundsWithdrawn(msg.sender, balance);
    }

    function deactivateProduct(uint productId) public {
        require(productId < products.length, "Product does not exist");
        require(
            productOwners[productId] == msg.sender || msg.sender == owner,
            "Only product owner or contract owner can deactivate"
        );
        products[productId].isActive = false;
    }

    function hasUserPurchased(
        address user,
        uint productId
    ) public view returns (bool) {
        require(productId < products.length, "Product does not exist");
        return hasPurchased[user][productId];
    }
}
