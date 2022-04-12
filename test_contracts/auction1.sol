// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;
import "@openzeppelin/contracts/utils/Strings.sol";
//!!!VARIANT!!!
//Everyone before they make the bid must pay for the bid

contract auction1 {
	address public king;
	uint256 public king_bid;
	uint256 public minimum_bid;
	mapping(address=>bytes32) public bid_amount;

	//In order to send the bidding amount in a secret way, one must hash the amount with a password and make the payment.
	constructor(uint256 amount) payable { //The smart contract creator sets the minimum bid
		king = msg.sender;
		king_bid = amount;
		minimum_bid = amount;
		bid_amount[msg.sender] = bytes32(amount);
	}

	function makeBid(bytes32 bid) public payable  {//bid here is the amount of ether and a password
        bid_amount[msg.sender] = bid;
  }
	
	function checkBid(uint256 amount, string memory password) public { //Can check the king through this function
		require(amount >= minimum_bid);
		require(keccak256(bytes.concat(bytes(Strings.toString(amount)), bytes(password))) == bid_amount[msg.sender]);
		if(amount > king_bid){ //What if the bid amount is the same?
			king = msg.sender;
			king_bid = amount;
		}
	}
	function returnBid(uint256 amount, string memory password) public pure returns (bytes32){
		return keccak256(bytes.concat(bytes(Strings.toString(amount)), bytes(password)));
	}
}