pragma solidity >=0.7.0 <0.9.0;

contract CryptoDoggies
{
    address payable developer; //the address of the developer of this contract
    uint16[] doggies; //a list of all of our current doggies
    mapping(uint16 => address) owner; //maps each doggy to its owner
    mapping(uint16 => address) previous_owner; //previous owner of the doggy (before the sale)
    mapping(uint16 => uint) birthBlock; //maps each doggy to the block number in which the doggy was created/born
    mapping(uint16 => uint) paidCreationFee; //fee paid for creating this doggy
    mapping(uint16 => uint16) currentMate; //current mate of this doggy (decided by its owner)
    mapping(uint16 => uint) price; //the price set by the current owner (assuming they are willing to sell the doggy)

    //The following are hard-coded fees
    uint64 creationFee = 1 ether;
    uint64 breedingFee = 1 ether;
    uint64 sellingFee = 0.1 ether;
    uint64 buyingFee = 0.1 ether;

    event newDoggyEvent(uint16 doggy, address owner); //an event that shows a new doggy was created
    event transferDoggyEvent(uint16 doggy, address old_owner, address new_owner); //an event that is triggered when a doggy is transfered


    constructor()
    {
        developer = payable(msg.sender);
    }


    //creates a random uint16 that can be used e.g. as the DNA of a doggy
    function random_uint16() private view returns (uint16)
    {
        uint random = uint(blockhash(block.number))^tx.gasprice;
        uint16 ans = uint16(random % 2**16);
        return ans;
    }

    //creates a new doggy
    function createNewDoggy() public payable
    {
        //make sure the fee that is paid for creating this doggy is enough
        require(msg.value > creationFee);
        for(uint i=0;i<doggies.length;++i)
        {
            if(birthBlock[doggies[i]] >= block.number - 1000)
                require(paidCreationFee[doggies[i]] * 101 <= msg.value * 100);
        }

        //create a random doggy
        uint16 new_doggy = random_uint16();

        //add it to the list of doggies and put it under the control of the caller of this function
        doggies.push(new_doggy);
        owner[new_doggy] = tx.origin;
        birthBlock[new_doggy] = block.number;
        paidCreationFee[new_doggy] = msg.value;

        emit newDoggyEvent(new_doggy, owner[new_doggy]);

    }

    //This function breeds two new doggies (puppies) from a pair of previously existing doggies. The owners of both doggies must call this function.
    function breedDoggy(uint16 my_doggy, uint16 other_doggy) public payable
    {
        require(msg.value >= breedingFee);
        require(owner[my_doggy] == msg.sender);
        currentMate[my_doggy] = other_doggy; //this records that the breeding is approved by the current owner
        if(currentMate[other_doggy] == my_doggy) //checks if the other owner has already approved the breeding
        {
            //create two offspring puppies
            uint16 puppy1 = random_offspring(my_doggy, other_doggy);
            uint16 puppy2 = random_offspring(my_doggy, other_doggy);
            doggies.push(puppy1);
            doggies.push(puppy2);
            owner[puppy1] = owner[my_doggy];
            owner[puppy2] = owner[other_doggy];
            birthBlock[puppy1] = birthBlock[puppy2] = block.number;
            emit newDoggyEvent(puppy1, owner[puppy1]);
            emit newDoggyEvent(puppy2, owner[puppy2]);
        }
    }

    //creates a random offspring of two doggies
    function random_offspring(uint16 doggy1, uint16 doggy2) private returns(uint16)
    {
        uint16 r = random_uint16(); //we use r to decide which bits of the DNA should come from doggy1 and which from doggy2
        uint16 offspring;
        for(uint16 i=0;i<16;++i)
        {
            if(r%2==1)
                offspring += (doggy1%2) * uint16(2)**i;
            else
                offspring += (doggy2%2) * uint16(2)**i;
            r/=2;
            doggy1/=2;
            doggy2/=2;
        }
        return offspring;
    }

    //puts up a doggy for sale
    function sellDoggy(uint16 my_doggy, uint asking_price) public
    {
        require(owner[my_doggy] == tx.origin);
        price[my_doggy] = asking_price;
    }

    //after the sale goes through, the seller can call this function to get their money
    function receiveMoney(uint16 my_former_doggy) public
    {
        require(msg.sender == previous_owner[my_former_doggy]);
        address payable recipient = payable(msg.sender);
        recipient.call{value: price[my_former_doggy]}(""); //pay the sale value to the previous owner
    }

    //buy a doggy that was previously put up for sale by its owner
    function buyDoggy(uint16 doggy) public payable
    {
        require(price[doggy] > 0); //check that the doggy is put up for sale by its owner
        require(msg.value == price[doggy] + buyingFee); //check that the right value is paid
        previous_owner[doggy] = owner[doggy]; //remember the previous owner so that we pay them later
        owner[doggy] = msg.sender; //update the owner of the doggy
        emit transferDoggyEvent(doggy, previous_owner[doggy], owner[doggy]);
    }

    //gather all the fees that are accumulated in the contract
    function reclaimFees() public
    {
        //we do not need access control since the fees will be paid to the developer anyway (no matter who calls this function)
        developer.transfer(address(this).balance);
    }


}
