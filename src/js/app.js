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
    /*
     * Replace me...
     */
    return App.initContract();
  },

  initContract: function () {
    /*
     * Replace me...
     */

    return App.bindEvents();
  },

  bindEvents: function () {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markAdopted: function (adopters, account) {
    /*
     * Replace me...
     */
  },

  handleAdopt: function (event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    /*
     * Replace me...
     */
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
