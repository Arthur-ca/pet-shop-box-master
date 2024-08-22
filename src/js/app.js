App = {
  web3Provider: null,
  contracts: {},
  pets: [],//store pet data for filtering
  cid: null,

  init: async function () {
    let petsData;
    this.cid = localStorage.getItem('petsJsonCid');

    if (!this.cid) {
      console.log('CID is null, fetching local pets.json...');
      const localPets = await this.fetchLocalPetsJSON();
      this.pets = localPets;

      const petsBlob = new Blob([JSON.stringify(localPets, null, 2)], { type: 'application/json' });
      const cid = await window.pinFileToIPFS(petsBlob, 'pets.json');
      this.cid = cid; // Store the CID for future use
      // Store the new CID in local storage
      localStorage.setItem('petsJsonCid', cid);

      petsData = localPets;
    } else {
      console.log('CID is not null, fetching pets.json from IPFS...');
      petsData = await window.fetchFileFromIPFS(this.cid);
      this.pets = petsData;
    }

    // this.populatePets(petsData);
    Filter.init();

    return await App.initWeb3();
  },

  fetchLocalPetsJSON: async function () {
    return new Promise((resolve, reject) => {
      $.getJSON('../pets.json')
        .done(resolve)
        .fail((jqxhr, textStatus, error) => {
          const err = textStatus + ", " + error;
          console.error('Request Failed: ' + err);
          reject(new Error(err));
        });
    });
  },

  populatePets: function (data) {
    const petsRow = $('#petsRow');
    petsRow.empty(); // Clear the previous content

    data.forEach(pet => {
      const petTemplate = $('#petTemplate').clone();
      pet.state = pet.state || 'available'; // Default to 'available'
      petTemplate.find('.panel-title').text(pet.name);
      petTemplate.find('img').attr('src', pet.picture);
      petTemplate.find('.pet-breed').text(pet.breed);
      petTemplate.find('.pet-age').text(pet.age);
      petTemplate.find('.pet-location').text(pet.location);
      petTemplate.find('.pet-state').text(pet.state);
      petTemplate.find('.btn-adopt').attr('data-id', pet.id);

      if (pet.state === 'unavailable') {
        petTemplate.find('.btn-adopt').text('Success').attr('disabled', true);
      }

      petsRow.append(petTemplate.html());
    });
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

    return this.initContracts();
  },

  initContracts: async function () {
    try {
      const adoptionArtifact = await $.getJSON('Adoption.json');
      const spondArtifact = await $.getJSON('Spond.json');

      App.contracts.Adoption = TruffleContract(adoptionArtifact);
      App.contracts.Spond = TruffleContract(spondArtifact);

      App.contracts.Adoption.setProvider(App.web3Provider);
      App.contracts.Spond.setProvider(App.web3Provider);

      await this.markAdopted();
      this.bindEvents();
    } catch (error) {
      console.error('Error initializing contracts:', error);
    }
  },

  bindEvents: function () {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
    $(document).on('submit', '#registerPetForm', App.handleRegisterPet);
    $(document).on('click', '.btn-spond', App.handleSpond)
  },

  markAdopted: async function () {
    try {
      const adoptionInstance = await App.contracts.Adoption.deployed();
      const adopters = await adoptionInstance.getAdopters.call();
      const petsData = await window.fetchFileFromIPFS(App.cid);

      adopters.forEach((adopter, index) => {
        if (adopter !== '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(index).find('.pet-state').text('unavailable');
          if (petsData[index]) {
            petsData[index].state = 'unavailable';
            console.log("petsData", petsData);
          }
        }
      });

      const updatedPetsBlob = new Blob([JSON.stringify(petsData, null, 2)], { type: 'application/json' });
      const newCid = await window.pinFileToIPFS(updatedPetsBlob, 'pets.json');
      localStorage.setItem('petsJsonCid', newCid);
      App.cid = newCid;

      Filter.fetchAndPopulateFilters();
      App.displayPets(petsData);
    } catch (error) {
      console.error('Error in markAdopted:', error.message);
    }
  },

  handleAdopt: function (event) {
    event.preventDefault();
    var petId = parseInt($(event.target).data('id'));

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log('Error fetching accounts:', error);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed().then(function (instance) {
        return instance.adopt(petId, { from: account });
      }).then(function (result) {
        console.log('Adoption result:', result);
        return App.markAdopted();
      }).then(function () {
        Filter.fetchAndPopulateFilters();
      }).catch(function (err) {
        console.error('Error during adoption process:', err.message);
      });
    });
  },

  handleSpond: function (event) {
    event.preventDefault();
    const petId = parseInt($(event.target).data('id'));
    console.log('pet ID:', petId);

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log('Error fetching accounts:', error);
      }

      var account = accounts[0];

      App.contracts.Spond.deployed().then(function (instance) {
        return instance.spond(petId, { from: account });
      }).then(function (result) {
        return App.updateSpond(petId);
      }).catch(function (err) {
        console.error('Error during spond process:', err.message);
      });
    });
  },

  updateSpond: async function (petId) {
    try {
      // Fetch the latest pets data from IPFS
      const petsData = await window.fetchFileFromIPFS(App.cid);
      const spond_fee = petsData[petId].spond_fee || 0; // Default to 0 if not present

      petsData[petId].spond_fee = spond_fee + 1;
      const updatedPetsBlob = new Blob([JSON.stringify(petsData, null, 2)], { type: 'application/json' });
      const newCid = await window.pinFileToIPFS(updatedPetsBlob, 'pets.json');

      localStorage.setItem('petsJsonCid', newCid);
      App.cid = newCid;
    } catch (error) {
      console.error('Error updating spond_fee in pets.json:', error);
    }
  },

  handleRegisterPet: async function (event) {
    event.preventDefault();
    const file = document.getElementById('petPhoto').files[0];
    const petName = $('#petName').val();
    const breed = $('#petBreed').val();
    const age = $('#petAge').val();
    const location = $('#petLocation').val();
    const adoptionFee = $('#adoptionFee').val();

    try {
      const resizedImageBlob = await App.resizeImage(file, 450, 450);
      const ipfsHash = await window.pinFileToIPFS(resizedImageBlob, petName);
      const photoURI = `https://azure-lazy-vulture-311.mypinata.cloud/ipfs/${ipfsHash}`;
      const petsData = await window.fetchFileFromIPFS(App.cid);

      // Prepare pet data to register
      const petData = {
        id: petsData.length,
        name: petName,
        picture: photoURI,
        age: age,
        breed: breed,
        location: location,
        adoptionFee: adoptionFee,
        spond_fee: 0,
        registeredAt: new Date().toISOString().split('T')[0],
        state: "avaliable"
      };

      // Add the new pet data to the existing pets data
      petsData.push(petData);
      const updatedPetsBlob = new Blob([JSON.stringify(petsData, null, 2)], { type: 'application/json' });
      const newCid = await window.pinFileToIPFS(updatedPetsBlob, 'pets.json');
      localStorage.setItem('petsJsonCid', newCid);
      App.cid = newCid;

      App.displayPets(petsData);
      Filter.populateFilters(petsData);
      Filter.fetchAndPopulateFilters();
      $('#registerPetModal').modal('hide');
      document.getElementById('registerPetForm').reset();

    } catch (error) {
      console.error('Error during pet registration:', error);
    }
  },

  resizeImage: async function (file, maxWidth, maxHeight) {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        let width = img.width;
        let height = img.height;

        // Calculate the aspect ratio
        const widthRatio = maxWidth / width;
        const heightRatio = maxHeight / height;
        const ratio = Math.max(widthRatio, heightRatio);

        // Calculate the new dimensions and position
        const newWidth = width * ratio;
        const newHeight = height * ratio;
        const offsetX = (maxWidth - newWidth) / 2;
        const offsetY = (maxHeight - newHeight) / 2;

        canvas.width = maxWidth;
        canvas.height = maxHeight;

        // Draw the image, cropped to fill the canvas
        ctx.drawImage(img, offsetX, offsetY, newWidth, newHeight);

        canvas.toBlob((blob) => {
          resolve(blob);
          URL.revokeObjectURL(img.src);  // Free up memory
        }, 'image/jpeg', 0.95);  // Adjust the quality if necessary
      };

      img.onerror = (error) => reject(error);
    });
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
      petTemplate.find('.btn-spond').attr('data-id', pet.id);
      // Check if the pet is adopted and disable the Adopt button if necessary
      if (pet.state === 'unavailable') {
        petTemplate.find('.btn-adopt').text('Success').attr('disabled', true);
        petTemplate.find('.btn-spond').text('Spond').attr('disabled', true);
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
