const Filter = {
  init: function () {
    // Attach change event listeners to filters
    $('#breedFilter, #ageFilter, #locationFilter').change(Filter.applyFilters);
  },

  applyFilters: function () {
    const breedFilter = $('#breedFilter').val();
    const ageFilter = $('#ageFilter').val();
    const locationFilter = $('#locationFilter').val();

    // Filter pets based on selected criteria
    const filteredPets = App.pets.filter((pet) => {
      const breedMatch = breedFilter === '' || pet.breed === breedFilter;
      const ageMatch = ageFilter === '' || pet.age == ageFilter;
      const locationMatch = locationFilter === '' || pet.location === locationFilter;
      return breedMatch && ageMatch && locationMatch;
    });

    // Display filtered pets
    App.displayPets(filteredPets);
  }
};

$(document).ready(function () {
  Filter.init();
});
