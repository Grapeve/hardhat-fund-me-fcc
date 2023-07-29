const { ethers, deployments } = require("hardhat")

const main = async () => {
  const deploy = await ethers.getSigners()[0]
  const FundMeDeployment = await deployments.get("FundMe")
  const FundMe = await ethers.getContractAt(
    FundMeDeployment.abi,
    FundMeDeployment.address,
    deploy,
  )
  console.log("Funding Contract...")
  const transactionResponse = await FundMe.fund({
    value: ethers.parseEther("0.1"),
  })
  await transactionResponse.wait(1)
  console.log("funded!")
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
