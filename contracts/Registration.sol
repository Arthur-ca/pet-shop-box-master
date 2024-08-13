// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Registration {
    struct Pet {
        uint id;
        string name;
        string breed;
        string photoURI;
        address payable owner;
    }

    uint public petCount = 0;
    mapping(uint => Pet) public pets;

    event PetRegistered(uint id, string name, string breed, string photoURI, address owner);

    function registerPet(string memory _name, string memory _breed, string memory _photoURI) public {
        petCount++;
        pets[petCount] = Pet(petCount, _name, _breed, _photoURI, payable(msg.sender));

        emit PetRegistered(petCount, _name, _breed, _photoURI, msg.sender);
    }

    function getPet(uint petId) public view returns (Pet memory) {
        return pets[petId];
    }
}
