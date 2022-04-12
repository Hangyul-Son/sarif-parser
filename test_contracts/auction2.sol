// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;
import "@openzeppelin/contracts/utils/Strings.sol";

//!!!VARIANT!!!
//Everyone before they make the bid must pay for the bid
//In order to ensure that the bid is payed, the only way is to actually put in some money. 
contract auction2 {
	address public king;
	uint256 public king_bid;
	uint256 public deposit;
	mapping(address=>bytes32) private bid_amount;
	mapping(address=>bool) private paid;
	uint256 makeBidDeadline;
	uint256 checkBidDeadline;

	//In order to send the bidding amount in a secret way, one must hash the amount with a password and make the payment.
	constructor(uint256 amount) { //The smart contract creator sets the minimum bid
		king = msg.sender; //How do participants know which currency is in use...?
		deposit = amount;
		makeBidDeadline = block.number + 6429; //6429 blocks = 1 day
		checkBidDeadline = makeBidDeadline + 6429; 
	}

	function makeBid(bytes32 bid) public payable { //bid here is the amount of ether and a password
			require(makeBidDeadline > block.number);
			require(msg.value == deposit);
      bid_amount[msg.sender] = bid;
  }

	function checkBid(uint256 amount, string memory password) public { //Can check the king through this function
		require(block.number > makeBidDeadline);
		require(checkBidDeadline > block.number);
		require(paid[msg.sender] == false);
		require(keccak256(bytes.concat(bytes(Strings.toString(amount)), bytes(password))) == bid_amount[msg.sender]);
		paid[msg.sender] = true; //Prevents reentrancy attck
		if(amount > king_bid){ //What if the bid amount is the same? //The king acutally should not be payable. Because this is an auction and king should be the one who makes the payment to the smart contract 
			address payable reciever = payable(king);
			reciever.transfer(deposit);
			king = msg.sender;
			king_bid = amount;
		}
		else { //Only return the minimum bid to the sender that is NOT THE KING //However can be sent more than once. 
			address payable reciever = payable(msg.sender);
			reciever.transfer(deposit);
		}
	}

	// function returnBid(uint256 amount, string memory password) public pure returns (bytes32){
	// 	return keccak256(bytes.concat(bytes(Strings.toString(amount)), bytes(password)));
	// }
}