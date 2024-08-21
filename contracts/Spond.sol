// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

contract Spond {
    // Array to store the sponsors for each pet
    address[16] public sponsors;

    // Spond function to allow sending a fixed amount of ETH
    function spond(uint petId) public payable returns (uint) {
        require(petId >= 0 && petId <= 15, "Invalid pet ID");
        require(msg.value == 0.001 ether, "Send exactly 0.001 ETH");

        sponsors[petId] = msg.sender;

        return petId;
    }

    // Function to retrieve the sponsors
    function getSponsors() public view returns (address[16] memory) {
        return sponsors;
    }
}