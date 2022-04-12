// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract rps {
	address payable private Alice = payable(0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2);
	bytes32 private AliceChoice = "";
	string public A_Choice = "";
	address payable private Bob = payable(0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db);
	bytes32 private BobChoice = "";
	string public B_Choice = "";
	bool aliceChoiceDeclared;
	bool bobChoiceDeclared;
	bool aliceSentChoice;
	bool bobSentChoice;
	uint256 blockDeadline;
	
	function sendChoice(bytes32 hashed_choice) public payable { //choice, choice and password concantenated 
		require((msg.sender == Alice && aliceSentChoice == false) || (msg.sender == Bob && bobSentChoice == false));
		require(msg.value == 1 ether);
		if (msg.sender == Alice) { //Check if the sender is Alice
			AliceChoice = hashed_choice; 
			aliceSentChoice = true;
		} else if (msg.sender == Bob) { //Check if the sender is Bob
			BobChoice = hashed_choice; 
			bobSentChoice = true;
		}
	}

	// function returnHash(string memory choice, string memory password) public pure returns (bytes32) {
	// 	return keccak256(bytes.concat(bytes(choice), bytes(password)));
	// }

	function reveal(string memory choice, string memory password) public {
		require(aliceSentChoice && bobSentChoice);
		require(msg.sender == Alice || msg.sender == Bob);
		if(msg.sender == Alice) {
			require(keccak256(bytes.concat(bytes(choice), bytes(password))) == AliceChoice); //Check if Alice's choice is correct
			A_Choice = choice;
			aliceChoiceDeclared = true;
		} else if (msg.sender == Bob) {
			require(keccak256(bytes.concat(bytes(choice), bytes(password))) == BobChoice); //Check if Bob's choice is correct
			B_Choice = choice; 
			bobChoiceDeclared = true;
		}
		blockDeadline = block.number + 10;
	}

	function compare() public { //After both Alice and Bob has saved the choice,
		require(blockDeadline > block.number || (aliceChoiceDeclared && bobChoiceDeclared)); //compare the choices.
		if(!aliceChoiceDeclared && bobChoiceDeclared) {
			Bob.transfer(2 ether);
			return;
		}
		else if(aliceChoiceDeclared && !bobChoiceDeclared) {
			Alice.transfer(2 ether);
			return;
		}
		//Alice and Bob both have have made the choice
		if(keccak256(abi.encodePacked(A_Choice)) == keccak256(abi.encodePacked(B_Choice))) {
			Alice.transfer(1 ether);
			Bob.transfer(1 ether);
		}
		else if(keccak256(abi.encodePacked(A_Choice)) == keccak256(abi.encodePacked("Rock")) && keccak256(abi.encodePacked(B_Choice)) == keccak256(abi.encodePacked("Paper"))) {
			Bob.transfer(2 ether);
		}
		else if(keccak256(abi.encodePacked(A_Choice)) == keccak256(abi.encodePacked("Rock")) && keccak256(abi.encodePacked(B_Choice)) == keccak256(abi.encodePacked("Scissors"))) {
			Alice.transfer(2 ether);
		}
		else if(keccak256(abi.encodePacked(A_Choice)) == keccak256(abi.encodePacked("Paper")) && keccak256(abi.encodePacked(B_Choice)) == keccak256(abi.encodePacked("Rock"))) {
			Alice.transfer(2 ether);
		}
		else if(keccak256(abi.encodePacked(A_Choice)) == keccak256(abi.encodePacked("Paper")) && keccak256(abi.encodePacked(B_Choice)) == keccak256(abi.encodePacked("Scissors"))) {
			Bob.transfer(2 ether);
		}
		else if(keccak256(abi.encodePacked(A_Choice)) == keccak256(abi.encodePacked("Scissors")) && keccak256(abi.encodePacked(B_Choice)) == keccak256(abi.encodePacked("Rock"))) {
			Bob.transfer(2 ether);
		}
		else if(keccak256(abi.encodePacked(A_Choice)) == keccak256(abi.encodePacked("Scissors")) && keccak256(abi.encodePacked(B_Choice)) == keccak256(abi.encodePacked("Paper"))) {
			Alice.transfer(2 ether);
		}
		else { //When either the choice of Alice or Bob is invalid.
			Alice.transfer(1 ether);
			Bob.transfer(1 ether);
		}
	}
  
  function checkBalance() public view returns(uint256) {
      return address(this).balance;
  }
}