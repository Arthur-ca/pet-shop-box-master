App = {
  web3Provider: null,
  contracts: {},
  pets: [],//store pet data for filtering

  init: async function () {
    // Load pets.
    $.getJSON('../pets.json', function (data) {
      App.pets = data;//Store data for filtering
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
      //initialize filtering after loading pets
      Filter.init();
    });

    return await App.initWeb3();
  },

  initWeb3: async function () {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function () {
    $.getJSON('Adoption.json', function (data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);

      // Set the provider for our contract
      App.contracts.Adoption.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the adopted pets
      return App.markAdopted();
    });

    return App.bindEvents();
  },

  bindEvents: function () {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
    $(document).on('submit', '#registerPetForm', App.handleRegisterPet);
  },

  markAdopted: function (adopters, account) {
    var adoptionInstance;

    App.contracts.Adoption.deployed().then(function (instance) {
      adoptionInstance = instance;

      return adoptionInstance.getAdopters.call();
    }).then(function (adopters) {
      for (i = 0; i < adopters.length; i++) {
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(i).find('.btn-adopt').text('Success').attr('disabled', true);
        }
      }
    }).catch(function (err) {
      console.log(err.message);
    });
  },

  handleAdopt: function (event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var adoptionInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed().then(function (instance) {
        adoptionInstance = instance;

        // Execute adopt as a transaction by sending account
        return adoptionInstance.adopt(petId, { from: account });
      }).then(function (result) {
        return App.markAdopted();
      }).catch(function (err) {
        console.log(err.message);
      });
    });
  },

  handleRegisterPet: async function (event) {
    event.preventDefault();

    // Initialize IPFS
    const https = require("https");
    const projectId = "<API_KEY>";
    const projectSecret = "<API_KEY_SECRET>";
    const options = {
      host: "ipfs.infura.io",
      port: 5001,
      path: "/api/v0/pin/add?arg=QmeGAVddnBSnKc1DLE7DLV9uuTqo5F7QbaveTjr45JUdQn",
      method: "POST",
      auth: projectId + ":" + projectSecret,
    };
    // const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })
    API_KEY = "";
    API_KEY_SECRET = "";
    xhr.setRequestHeader("Authorization", "Basic " + btoa(API_KEY + ":" + API_KEY_SECRET));

    const name = document.getElementById('petName').value;
    const photoFile = document.getElementById('petPhoto').files[0];
    const registrationFee = document.getElementById('registrationFee').value;

    // Upload photo to IPFS
    const reader = new FileReader();
    reader.readAsArrayBuffer(photoFile);
    reader.onloadend = async () => {
      const buffer = Buffer.from(reader.result);
      const result = await ipfs.add(buffer, (error, result) => {
        console.log('Ipfs result', result)
        if (error) {
          console.error(error)
          return
        }
      });
      const photoUrl = `https://ipfs.infura.io/ipfs/${result.path}`;

      // Register pet on blockchain
      const accounts = await web3.eth.getAccounts();
      const weiFee = web3.utils.toWei(registrationFee, 'ether');
      await registrationContract.methods.registerPet(name, photoUrl, weiFee).send({ from: accounts[0] });

      alert("Pet registered successfully!");
      // Close the modal
      $('#registerPetModal').modal('hide');
    };
  },

  displayPets: function (pets) {
    const petsRow = $('#petsRow');
    petsRow.empty();

    pets.forEach(function (pet) {
      const petTemplate = $('#petTemplate').clone(); // Clone the template
      petTemplate.find('.panel-title').text(pet.name);
      petTemplate.find('img').attr('src', pet.picture);
      petTemplate.find('.pet-breed').text(pet.breed);
      petTemplate.find('.pet-age').text(pet.age);
      petTemplate.find('.pet-location').text(pet.location);
      petTemplate.find('.btn-adopt').attr('data-id', pet.id);

      petsRow.append(petTemplate.html());
    });
  }

};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
