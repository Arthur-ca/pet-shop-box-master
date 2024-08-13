var Adoption = artifacts.require("Adoption");
var Registration = artifacts.require("Registration")

module.exports = async function (deployer) {
  await deployer.deploy(Registration);
  const petRegistryInstance = await Registration.deployed();

  await deployer.deploy(Adoption, petRegistryInstance.address)
};