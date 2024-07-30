document.getElementById('registerBtn').addEventListener('click', function () {
    const formHtml = `
      <div id="registerForm">
        <button class="close" onclick="document.getElementById('registerForm').remove(); document.querySelector('.overlay').remove();">&times;</button>
        <h3>Register Your Pet</h3>
        <form id="petForm">
          <input type="file" id="petImage" accept="image/*">
          <button type="submit" class="submit">Submit</button>
        </form>
      </div>
      <div class="overlay"></div>`;
    document.body.insertAdjacentHTML('beforeend', formHtml);
});