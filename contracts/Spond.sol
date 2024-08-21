// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

contract Spond {
  address[16] public sponsors;
  uint public spondAmount = 0.1 ether; // Fixed amount to spond a pet

  // Sponding a pet
  function spond(uint petId) public payable returns (uint) {
      require(petId >= 0 && petId <= 15, "Invalid pet ID");
      require(msg.value == spondAmount, "Incorrect ETH amount sent for sponding");

       sponsors[petId] = msg.sender;
       return petId;
  }

  // Retrieving the sponsors
   function getSponsors() public view returns (address[16] memory) {
       return sponsors;
}

}