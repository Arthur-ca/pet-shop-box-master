// IPFS setup
const ipfsClient = require('ipfs-http-client');
const ipfs = ipfsClient.create('https://ipfs.infura.io:5001');

const contractAddress = 'C:\Users\ch243\Desktop\pet-shop-box-master\build\contracts\Registration.json';
const registrationABI = [/* Your Contract ABI Here */];
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