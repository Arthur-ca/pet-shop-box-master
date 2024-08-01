const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.static('public')); // Serve your CSS, JS, and images from the public directory

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './src/images') // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Avoid conflicts with original names
  }
});

const upload = multer({ storage: storage });

// Endpoint to handle pet image uploads and JSON data updates
app.post('/registerPet', upload.single('petImage'), (req, res) => {
  const petData = { image: `/images/${req.file.filename}`, ...req.body };
  const petsFile = path.join(__dirname, './src/pets.json');

  fs.readFile(petsFile, (err, data) => {
    if (err) {
      console.error("Error reading pets file:", err);
      return res.status(500).send("Error reading pet data.");
    }

    let pets = JSON.parse(data);
    pets.push(petData);

    fs.writeFile(petsFile, JSON.stringify(pets, null, 2), (err) => {
      if (err) {
        console.error("Error writing pet data:", err);
        return res.status(500).send("Error updating pet data.");
      }
      res.send('Pet registered successfully!');
    });
  });
});


App = {
  web3Provider: null,
  contracts: {},

  init: async function () {
    // Load pets.
    $.getJSON('../pets.json', function (data) {
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
  }

};

$(function () {
  $(window).load(function () {
    App.init();
  });
});

// Start the server
app.listen(3000, () => console.log('Server running on port 3000'));
