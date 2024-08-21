App = {
  web3Provider: null,
  contracts: {},
  pets: [],//store pet data for filtering
  cid: null,

  init: async function () {
    let petsData;

    // Retrieve the CID from local storage
    this.cid = localStorage.getItem('petsJsonCid');

    if (!this.cid) {
      // CID is null, fetch the local pets.json and upload to IPFS
      console.log('CID is null, fetching local pets.json...');
      const localPets = await this.fetchLocalPetsJSON();
      this.pets = localPets;

      const petsBlob = new Blob([JSON.stringify(localPets, null, 2)], { type: 'application/json' });
      const cid = await window.pinFileToIPFS(petsBlob, 'pets.json');
      this.cid = cid; // Store the CID for future use
      console.log('Initial pets.json uploaded to IPFS with CID:', cid);

      // Store the new CID in local storage
      localStorage.setItem('petsJsonCid', cid);

      petsData = localPets;
    } else {
      // CID is not null, fetch the updated pets.json from IPFS
      console.log('CID is not null, fetching pets.json from IPFS...');
      petsData = await window.fetchFileFromIPFS(this.cid);
      this.pets = petsData;
    }
    console.log('Loaded Pets Data:', petsData); // Log the loaded pets data
    // Populate the UI with the pets data
    this.populatePets(petsData);

    // Initialize filtering after loading pets
    Filter.init();

    return await App.initWeb3();
  },

  fetchLocalPetsJSON: async function () {
    // Fetch pets.json from the local server
    return new Promise((resolve, reject) => {
      $.getJSON('../pets.json', function (data) {
        resolve(data);
      }).fail(function (jqxhr, textStatus, error) {
        const err = textStatus + ", " + error;
        console.error('Request Failed: ' + err);
        reject(err);
      });
    });
  },

  populatePets: function (data) {
    var petsRow = $('#petsRow');
    var petTemplate = $('#petTemplate');

    for (let i = 0; i < data.length; i++) {
      // console.log('Processing Pet:', data[i]); // Log each pet being processed
      // Set the state to 'available' if it's not defined
      if (!data[i].state || data[i].state === '') {
        data[i].state = 'available';
      }
      petTemplate.find('.panel-title').text(data[i].name);
      petTemplate.find('img').attr('src', data[i].picture);
      petTemplate.find('.pet-breed').text(data[i].breed);
      petTemplate.find('.pet-age').text(data[i].age);
      petTemplate.find('.pet-location').text(data[i].location);
      // Check if state exists
      if (data[i].state) {
        // console.log('State exists for ' + data[i].name + ': ' + data[i].state);
        petTemplate.find('.pet-state').text(data[i].state);  // Display the state
      } else {
        console.log('No state found for ' + data[i].name);
      }
      // petTemplate.find('.pet-state').text(data[i].state);  // Add this line to include the state
      petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

      petsRow.append(petTemplate.html());
    }
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
    $.getJSON('Adoption.json', function (petAdoptionData) {
      var AdoptionArtifact = petAdoptionData;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);
      App.contracts.Adoption.setProvider(App.web3Provider);

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
    }).then(async function (adopters) {
      for (i = 0; i < adopters.length; i++) {
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          //$('.panel-pet').eq(i).find('.btn-adopt').text('Success').attr('disabled', true);
          // Update the state text to "unavailable" in the UI
          $('.panel-pet').eq(i).find('.pet-state').text('unavailale');//1
          // update the state in the App.pets array as well
          if (App.pets[i]) {
            App.pets[i].state = 'unavailable';
          }
        }
      }
      // Re-upload the updated pets.json to IPFS
      try {
        console.log('Uploading updated pets.json to IPFS...');
        const updatedPetsBlob = new Blob([JSON.stringify(App.pets, null, 2)], { type: 'application/json' });
        const newCid = await window.pinFileToIPFS(updatedPetsBlob, 'pets.json');
        console.log('Updated pets.json file uploaded to IPFS with new CID:', newCid);

        // Store the new CID
        localStorage.setItem('petsJsonCid', newCid);
        App.cid = newCid; // Update the CID in App

        // Optionally, you can also update the filters if necessary
        Filter.fetchAndPopulateFilters();

      } catch (error) {
        console.error('Error uploading updated pets.json to IPFS:', error);
      }
      // Update the entire UI to reflect the latest states in App.pets
      App.displayPets(App.pets);
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
      }).then(function () {
        // Re-populate filters after adoption
        Filter.fetchAndPopulateFilters();
      }).catch(function (err) {
        console.log(err.message);
      });
    });
  },

  handleRegisterPet: async function (event) {
    event.preventDefault();

    const file = document.getElementById('petPhoto').files[0];
    const petName = $('#petName').val();
    const breed = $('#petBreed').val();
    const age = $('#petAge').val();
    const location = $('#petLocation').val();
    const adoptionFee = $('#adoptionFee').val();
    console.log('File selected:', file);
    console.log('Pet name entered:', petName);

    try {
      console.log('Attempting to pin file to IPFS...');
      const ipfsHash = await window.pinFileToIPFS(file, petName);
      const photoURI = `https://azure-lazy-vulture-311.mypinata.cloud/ipfs/${ipfsHash}`;
      console.log('File pinned to IPFS with URI:', photoURI);

      // Step 3: Fetch the existing pets data from IPFS using the stored CID
      console.log('Fetching existing pets data from IPFS...');
      const petsData = await window.fetchFileFromIPFS(App.cid);

      // Prepare pet data to register
      const petData = {
        id: petsData.length + 1, // Use a timestamp as a unique ID
        name: petName,
        picture: photoURI,
        age: age,
        breed: breed,
        location: location,
        adoptionFee: adoptionFee,
        registeredAt: new Date().toISOString().split('T')[0]
      };

      // Step 4: Add the new pet data to the existing pets data
      petsData.push(petData);
      console.log('Pets Data', petsData)

      // Step 5: Upload the updated pets.json to IPFS
      console.log('Uploading updated pets.json to IPFS...');
      const updatedPetsBlob = new Blob([JSON.stringify(petsData, null, 2)], { type: 'application/json' });
      console.log('Blob: ', updatedPetsBlob)
      const newCid = await window.pinFileToIPFS(updatedPetsBlob, 'pets.json');
      console.log('Updated pets.json file uploaded to IPFS with new CID:', newCid);

      localStorage.setItem('petsJsonCid', newCid);
      App.displayPets(petsData)
      Filter.fetchAndPopulateFilters();

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
      petTemplate.find('.pet-state').text(pet.state);
      petTemplate.find('.btn-adopt').attr('data-id', pet.id);
      // Check if the pet is adopted and disable the Adopt button if necessary
      if (pet.state === 'unavailable') {
        petTemplate.find('.btn-adopt').text('Success').attr('disabled', true);
      }

      petsRow.append(petTemplate.html());
    });
  }

};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
