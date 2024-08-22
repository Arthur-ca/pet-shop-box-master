// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

contract Adoption {
address[] public adopters;
// Adopting a pet
function adopt(uint petId) public returns (uint) {
  require(petId >= 0);

  // Expand the array if necessary
  if (petId >= adopters.length) {
       adopters.length = petId + 1;
  }

  adopters[petId] = msg.sender;
  return petId;
}
// Retrieving the adopters
function getAdopters() public view returns (address[] memory) {
  return adopters;
}

}