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
    window.web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function () {
    $.getJSON('Registration.json', function (petRegistryData) {
      var PetRegistryArtifact = petRegistryData;
      App.contracts.PetRegistry = TruffleContract(PetRegistryArtifact);
      App.contracts.PetRegistry.setProvider(App.web3Provider);

      $.getJSON('Adoption.json', function (petAdoptionData) {
        var AdoptionArtifact = petAdoptionData;
        App.contracts.Adoption = TruffleContract(AdoptionArtifact);
        App.contracts.Adoption.setProvider(App.web3Provider);

        return App.markAdopted();
      });
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

    const file = document.getElementById('petPhoto').files[0];
    const fileName = $('#petName').val();
    const breed = $('#petBreed').val();
    console.log('File selected:', file);
    console.log('Pet name entered:', fileName);

    try {
      console.log('Attempting to pin file to IPFS...');
      const ipfsHash = await window.pinFileToIPFS(file, fileName);
      const photoURI = `https://azure-lazy-vulture-311.mypinata.cloud/ipfs/${ipfsHash}`;
      console.log('File pinned to IPFS with URI:', photoURI);

      console.log('Attempting to register pet on the blockchain...');
      web3.eth.getAccounts(function (error, accounts) {
        if (error) {
          console.error('Error retrieving accounts:', error);
          return;
        }

        const account = accounts[0];
        console.log('Using account:', account);

        App.contracts.PetRegistry.deployed().then(function (instance) {
          return instance.registerPet(petName, breed, photoURI, { from: account });
        }).then(function (result) {
          console.log('Pet registered successfully on the blockchain:', result);
          window.location.reload();
        }).catch(function (err) {
          console.error('Error registering pet on the blockchain:', err);
        });
      });
    } catch (error) {
      console.error('Error during pet registration:', error);
    }
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
