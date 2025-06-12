// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint amount) external returns (bool);
    function transfer(address to, uint amount) external returns (bool);
}

contract Marketplace {
    uint public productCount;
    IERC20 public token;

    constructor(address tokenAddress) {
        token = IERC20(tokenAddress);
    }

    struct Product {
        uint id;
        address payable seller;
        string name;
        string description;
        uint price; // price in token units
        string category;
        string image;
        bool sold;
        address buyer;
        uint purchaseTime;
        bool settled;
    }

    mapping(uint => Product) public products;

    event ProductCreated(uint id, address indexed seller, uint price, string category);
    event ProductSold(uint id, address indexed buyer);
    event ProductSettled(uint id);
    event ProductRefunded(uint id);

    function createProduct(
        string memory _name,
        string memory _description,
        uint _price,
        string memory _category,
        string memory _image
    ) external {
        require(_price > 0, "Price must be > 0");
        productCount++;
        products[productCount] = Product({
            id: productCount,
            seller: payable(msg.sender),
            name: _name,
            description: _description,
            price: _price,
            category: _category,
            image: _image,
            sold: false,
            buyer: address(0),
            purchaseTime: 0,
            settled: false
        });
        emit ProductCreated(productCount, msg.sender, _price, _category);
    }

    function buyProduct(uint _id) external {
        Product storage product = products[_id];
        require(_id > 0 && _id <= productCount, "Invalid id");
        require(!product.sold, "Already sold");
        require(token.transferFrom(msg.sender, address(this), product.price), "Payment failed");
        product.sold = true;
        product.buyer = msg.sender;
        product.purchaseTime = block.timestamp;
        emit ProductSold(_id, msg.sender);
    }

    function confirmSettlement(uint _id) external {
        Product storage product = products[_id];
        require(product.sold, "Not sold");
        require(!product.settled, "Already settled");
        require(msg.sender == product.buyer || msg.sender == product.seller, "Not participant");
        product.settled = true;
        require(token.transfer(product.seller, product.price), "Transfer failed");
        emit ProductSettled(_id);
    }

    function refund(uint _id) external {
        Product storage product = products[_id];
        require(product.sold, "Not sold");
        require(!product.settled, "Already settled");
        require(block.timestamp >= product.purchaseTime + 15 days, "Too early");
        product.settled = true;
        require(token.transfer(product.buyer, product.price), "Refund failed");
        emit ProductRefunded(_id);
    }
}
