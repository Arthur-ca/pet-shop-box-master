const axios = require('axios')
const FormData = require('form-data')

const JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiMzA3NjgzYS04ZmE3LTQzZTctODEwOC1jZTBhYjQ0MGU5OTAiLCJlbWFpbCI6ImppYWhhb2x5LmNoZW5AbWFpbC51dG9yb250by5jYSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfSx7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIxNmMyYzRjZTRhM2RjNzNiYzE3OSIsInNjb3BlZEtleVNlY3JldCI6IjU3Mjc5YmZjNmM1OGM0NGZhMTg2OWRhYmEyZDhkMTUyOTQxNGM2YmNhNGQ4YzFiZWQ0MWM2M2ZkMzBhODA5YTIiLCJpYXQiOjE3MjM1MjcwMTB9.vtvLai54SOR9HNjr0k7ZBT5vVky7JnpNCfY_X5vvI34"

window.pinFileToIPFS = async (file, fileName) => {
  const formData = new FormData();

  formData.append('file', file);

  const pinataMetadata = JSON.stringify({
    name: fileName,
  });
  formData.append('pinataMetadata', pinataMetadata);

  const pinataOptions = JSON.stringify({
    cidVersion: 0,
  });
  formData.append('pinataOptions', pinataOptions);

  try {
    const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
      maxBodyLength: "Infinity",
      headers: {
        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
        'Authorization': `Bearer ${JWT}`
      }
    });
    console.log('File pinned successfully:', res.data);
    return res.data.IpfsHash;
  } catch (error) {
    console.error('Error pinning file to IPFS:', error);
    throw error;
  }
};

// Function to fetch a file from IPFS using its CID
window.fetchFileFromIPFS = async (cid) => {
  try {
    const res = await axios.get(`https://azure-lazy-vulture-311.mypinata.cloud/ipfs/${cid}`);
    console.log('File fetched successfully:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error fetching file from IPFS:', error);
    throw error;
  }
};

window.updateFileOnIPFS = async (cid, newPetData) => {
  try {
    // Fetch the existing file content
    const pets = await window.fetchFileFromIPFS(cid);

    // Add the new pet data
    pets.push(newPetData);

    // Convert the updated pets array to a Blob for pinning
    const updatedFile = new Blob([JSON.stringify(pets, null, 2)], { type: 'application/json' });

    // Pin the updated file to IPFS
    const newCid = await window.pinFileToIPFS(updatedFile, 'pets.json');
    console.log('Updated file pinned successfully with new CID:', newCid);
    return newCid;
  } catch (error) {
    console.error('Error updating file on IPFS:', error);
    throw error;
  }
};

module.exports = { pinFileToIPFS, fetchFileFromIPFS, updateFileOnIPFS };