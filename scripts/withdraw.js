const { ethers, deployments } = require("hardhat")

const main = async () => {
  const deploy = await ethers.getSigners()[0]
  const FundMeDeployment = await deployments.get("FundMe")
  const FundMe = await ethers.getContractAt(
    FundMeDeployment.abi,
    FundMeDeployment.address,
    deploy,
  )
  console.log("withdraw...")
  const startingFundMeBalance = await ethers.provider.getBalance(
    await FundMe.getAddress(),
  )
  console.log(`startingFundMeBalance: ${startingFundMeBalance}`)
  const transactionResponse = await FundMe.withdraw()
  await transactionResponse.wait(1)
  console.log("Got it!")
  const endingFundMeBalance = await ethers.provider.getBalance(
    await FundMe.getAddress(),
  )
  console.log(`endingFundMeBalance: ${endingFundMeBalance}`)
}

main()
  .then(() => {
    console.log("success!")
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
