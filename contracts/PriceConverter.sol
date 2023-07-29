// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
  function getPrice(
    AggregatorV3Interface priceFeed
  ) internal view returns (uint256) {
    // Address 0x694AA1769357215DE4FAC081bf1f309aDC325306
    (, int256 price, , , ) = priceFeed.latestRoundData();
    // ETH in terms of USD  2023.07.27
    // 1859.00000000 USD / ETH

    return uint256(price * 1e10);
  }

  function getConversionRate(
    uint256 ethAmount,
    AggregatorV3Interface priceFeed
  ) internal view returns (uint256) {
    uint256 ethPrice = getPrice(priceFeed);
    // 1859_000000000000000000 = ETH / USD price
    // 1   _000000000000000000 ETH
    uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18;
    return ethAmountInUsd;
  }
}
