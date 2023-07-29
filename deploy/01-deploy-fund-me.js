const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
require("dotenv").config()
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log, get } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId

  // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
  let ethUsdPriceFeedAddress
  if (developmentChains.includes(network.name)) {
    // *mock priceFeed
    const ethUsdAggregator = await get("MockV3Aggregator")
    ethUsdPriceFeedAddress = ethUsdAggregator.address
    console.log("ethUsdPriceFeedAddress: ", ethUsdPriceFeedAddress)
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    console.log("priceFeed from chainlink")
  }

  const args = [ethUsdPriceFeedAddress]
  const FundMe = await deploy("FundMe", {
    from: deployer,
    args: args,
    log: true,
    // waitConfirmations: network.config.blockConfirmations || 1,
  })
  log("-----------------------------------------------")

  // *部署测试网自动验证
  // if (
  //   !developmentChains.includes(network.name) &&
  //   process.env.ETHERSCAN_API_KEY
  // ) {
  //   await verify(FundMe.address, args)
  // }
}

module.exports.tags = ["all", "fundme"]
