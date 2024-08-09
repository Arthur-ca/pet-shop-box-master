pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

contract Registration {
    struct Pet {
        uint id;
        string name;
        string photoUrl;
        address owner;
        uint registrationFee;
    }

    Pet[] public pets;
    mapping(uint => address) public petToOwner;
    uint public petCount = 0;

    event PetRegistered(uint id, string name, string photoUrl, uint registrationFee, address owner);

    function registerPet(string memory _name, string memory _photoUrl, uint _registrationFee) public {
        pets.push(Pet(petCount, _name, _photoUrl, msg.sender, _registrationFee));
        petToOwner[petCount] = msg.sender;
        emit PetRegistered(petCount, _name, _photoUrl, _registrationFee, msg.sender);
        petCount++;
    }

    function getPets() public view returns (Pet[] memory) {
        return pets;
    }
}
