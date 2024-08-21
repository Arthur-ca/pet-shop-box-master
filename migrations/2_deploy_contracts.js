var Adoption = artifacts.require("Adoption");
var Spond = artifacts.require("Spond");

module.exports = function (deployer) {
  deployer.deploy(Adoption);
};
module.exports = function (deployer) {
  deployer.deploy(Spond);
};