document.getElementById('registerBtn').addEventListener('click', function () {
  fetch('pets.json')
    .then(response => response.json())
    .then(data => {
      // Assuming pets.json contains an array of pets
      const petOptions = data.map(pet => `<option value="${pet.id}">${pet.name}</option>`).join('');

      const formHtml = `
              <div id="registerForm">
                  <button class="close" onclick="document.getElementById('registerForm').remove(); document.querySelector('.overlay').remove();">&times;</button>
                  <h3>Register Your Pet</h3>
                  <form id="petForm">
                      <label for="petName">Select Pet:</label>
                      <select id="petName">
                          ${petOptions}
                      </select>
                      <input type="file" id="petImage" accept="image/*">
                      <button type="submit" class="submit">Submit</button>
                  </form>
              </div>
              <div class="overlay"></div>`;

      document.body.insertAdjacentHTML('beforeend', formHtml);
    })
    .catch(error => console.error('Error fetching pet data:', error));
});
