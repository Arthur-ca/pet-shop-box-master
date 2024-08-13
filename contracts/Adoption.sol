// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Registration.sol";

contract Adoption {
    Registration public petRegistry;

    mapping(uint => address) public adopters;

    event PetAdopted(uint id, address adopter);

    constructor(address _petRegistryAddress) {
        petRegistry = Registration(_petRegistryAddress);
    }

    function adopt(uint petId) public payable {
        require(msg.value > 0, "Adoption fee is required");

        Registration.Pet memory pet = petRegistry.getPet(petId);
        require(pet.id != 0, "Pet not found");
        require(adopters[petId] == address(0), "Pet already adopted");

        // Transfer the adoption fee to the pet owner
        pet.owner.transfer(msg.value);

        // Mark the pet as adopted
        adopters[petId] = msg.sender;

        emit PetAdopted(petId, msg.sender);
    }

    function getAdopter(uint petId) public view returns (address) {
        return adopters[petId];
    }
}
