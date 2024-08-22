// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

contract Spond {
  address[] public sponsors;

  // Sponding a pet
  function spond(uint petId) public returns (uint) {
      require(petId >= 0);

      if (petId >= sponsors.length) {
        sponsors.length = petId + 1;
    }
  
       sponsors[petId] = msg.sender;
       return petId;
  }

  // Retrieving the sponsors
   function getSponsors() public view returns (address[] memory) {
       return sponsors;
}

}