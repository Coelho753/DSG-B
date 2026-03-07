async function calculateFreight(user) {

  if (!user || !user.address) {
    return 0;
  }

  const cep = user.address.cep || "";

  if (cep.startsWith("01")) {
    return 15;
  }

  if (cep.startsWith("02")) {
    return 18;
  }

  return 25;
}

module.exports = {
  calculateFreight
};