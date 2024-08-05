const Filter = {
  init: function () {
    // Attach change event listeners to filters
    $('#breedFilter, #ageFilter, #locationFilter, #stateFilter').change(Filter.applyFilters);
  },

  applyFilters: function () {
    const breedFilter = $('#breedFilter').val();
    const ageFilter = $('#ageFilter').val();
    const locationFilter = $('#locationFilter').val();
    const stateFilter = $('#stateFilter').val();

    // Filter pets based on selected criteria
    const filteredPets = App.pets.filter((pet) => {
      const breedMatch = breedFilter === '' || pet.breed === breedFilter;
      const ageMatch = ageFilter === '' || pet.age == ageFilter;
      const locationMatch = locationFilter === '' || pet.location === locationFilter;
      const stateMatch = stateFilter === '' || pet.state === stateFilter;
      return breedMatch && ageMatch && locationMatch && stateMatch;
    });

    // Display filtered pets
    App.displayPets(filteredPets);
  }
};

$(document).ready(function () {
  Filter.init();
});
