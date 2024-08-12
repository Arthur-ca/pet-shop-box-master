// IPFS setup
// const ipfsClient = require('ipfs-http-client');
// import * as IPFS from 'ipfs-core'

const ipfs = await IPFS.create()
// const ipfs = IpfsHttpClient.create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

const contractAddress = '0x6f6FC759B6127AddDa211C2170CD5773de8cb538';
const registrationABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "photoUrl",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "registrationFee",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "PetRegistered",
    "type": "event"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "petCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "petToOwner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "pets",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "photoUrl",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "registrationFee",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_photoUrl",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_registrationFee",
        "type": "uint256"
      }
    ],
    "name": "registerPet",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getPets",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "photoUrl",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "registrationFee",
            "type": "uint256"
          }
        ],
        "internalType": "struct Registration.Pet[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
];
const registrationContract = new web3.eth.Contract(registrationABI, contractAddress);

document.getElementById('registerPetForm').onsubmit = async function (event) {
  event.preventDefault();

  const name = document.getElementById('petName').value;
  const photoFile = document.getElementById('petPhoto').files[0];
  const registrationFee = document.getElementById('registrationFee').value;

  // Upload photo to IPFS
  const reader = new FileReader();
  reader.readAsArrayBuffer(photoFile);
  reader.onloadend = async () => {
    const buffer = Buffer.from(reader.result);
    const result = await ipfs.add(buffer);
    const photoUrl = `https://ipfs.infura.io/ipfs/${result.path}`;

    // Register pet on blockchain
    const accounts = await web3.eth.getAccounts();
    const weiFee = web3.utils.toWei(registrationFee, 'ether');
    await registrationContract.methods.registerPet(name, photoUrl, weiFee).send({ from: accounts[0] });

    alert("Pet registered successfully!");
    // Close the modal
    $('#registerPetModal').modal('hide');
  };
};