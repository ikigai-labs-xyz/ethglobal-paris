const axios = require("axios");
require("dotenv").config();

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const getAbi = async (contractAddress) => {
  const abiUrl = `https://api.etherscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=${ETHERSCAN_API_KEY}`;
  const response = await axios.get(abiUrl);
  return response.data.result;
};

module.exports = { getAbi };
