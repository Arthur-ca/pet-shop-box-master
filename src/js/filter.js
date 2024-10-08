const Filter = {
  init: function () {
    // Attach change event listeners to filters
    this.fetchAndPopulateFilters();
    $('#breedFilter, #ageFilter, #locationFilter, #stateFilter').change(Filter.applyFilters);
  },

  fetchAndPopulateFilters: async function () {
    try {
      const cidd = App.cid
      const petData = await window.fetchFileFromIPFS(cidd); // Fetch the pet data from IPFS

      // Populate the filters with the pet data
      this.populateFilters(petData);
    } catch (error) {
      console.error('Error fetching pet data:', error);
    }
  },

  populateFilters: function (petData) {
    const breedFilter = $('#breedFilter');
    const locationFilter = $('#locationFilter');
    const ageFilter = $('#ageFilter');
    const stateFilter = $('#stateFilter');

    const breeds = Array.from(new Set(petData.map(pet => pet.breed))).sort();
    const locations = Array.from(new Set(petData.map(pet => pet.location))).sort();
    const ages = Array.from(new Set(petData.map(pet => pet.age))).sort((a, b) => a - b);
    const states = Array.from(new Set(petData.map(pet => pet.state))).sort();


    function populateSelectOptions(selectElement, options) {
      selectElement.empty(); // Clear existing options
      selectElement.append('<option value="">All</option>'); // Default option
      options.forEach(option => {
        if (option && !selectElement.find(`option[value="${option}"]`).length) {
          selectElement.append(`<option value="${option}">${option}</option>`);
        }
      });
    }

    populateSelectOptions(breedFilter, breeds);
    populateSelectOptions(locationFilter, locations);
    populateSelectOptions(ageFilter, ages);
    populateSelectOptions(stateFilter, states);
  },

  applyFilters: async function () {
    const breedFilter = $('#breedFilter').val();
    const ageFilter = $('#ageFilter').val();
    const locationFilter = $('#locationFilter').val();
    const stateFilter = $('#stateFilter').val();
    const cidd = App.cid;
    const petData = await window.fetchFileFromIPFS(cidd);

    const filteredPets = petData.filter((pet) => {
      const breedMatch = breedFilter === '' || pet.breed === breedFilter;
      const ageMatch = ageFilter === '' || pet.age == ageFilter;
      const locationMatch = locationFilter === '' || pet.location === locationFilter;
      const stateMatch = stateFilter === '' || pet.state === stateFilter;

      return breedMatch && ageMatch && locationMatch && stateMatch;
    });

    App.displayPets(filteredPets);
  }
};

$(document).ready(function () {
  Filter.init();
});