export interface ChainConfig {
  nativeAsset: string;
  feesAddress: string;
  pythOracleAddress: string;
  oracleAddresses: Record<string, string>;
  // LH-specific
  executorAddressV1?: string;
  executorAddressV2?: string;
  executorAddressV3?: string;
  executorAddressV4?: string;
  treasuryAddress?: string;
  treasuryAddressNew?: string;
  lhFeesAddress?: string;
  // Special token pools
  specialTokens: Record<string, { pool: string; decimals: string; type: "v2price" | "v2recursive" }>;
}

export const CHAIN_CONFIG: Record<number, ChainConfig> = {
  137: {
    nativeAsset: "POL",
    feesAddress: "0xfee0000a55d378afbcbbaeaef29b58f8872b7f02",
    pythOracleAddress: "",
    executorAddressV1: "0x64bc3532991d8147167ee028a7adbf01c05594f7",
    executorAddressV2: "0x25135c8513fd5c54eca806f040d323cb60995b4a",
    executorAddressV3: "0x1a08d64fb4a7d0b6da5606a1e4619c147c3fb95e",
    executorAddressV4: "0x896d9b9eee18f6c88c5575b78247834029375575",
    treasuryAddress: "0x7ae466596c57241459ebae32d2e64f51da68f3b8",
    treasuryAddressNew: "0x000066320a467de62b1548f46465abbb82662331",
    lhFeesAddress: "0xbd098db9ad3dbaf2bdaf581340b2662d9a3ca8d2",
    specialTokens: {
      QUICK: { pool: "0x747375305b825c49fb97ee0ac09d19ec9ef94bd2", decimals: "1e18", type: "v2price" },
    },
    oracleAddresses: {
      USDT: "0x0A6513e40db6EB1b165753AD52E80663aeA50545",
      USDC: "0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7",
      TUSD: "0x7C5D415B64312D38c56B54358449d0a4058339d2",
      DAI: "0x4746DeC9e833A82EC7C2C1356372CcF2cfcD2F3D",
      ETH: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
      WETH: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
      BTC: "0xc907E116054Ad103354f2D350FD2514433D57F6f",
      WBTC: "0xc907E116054Ad103354f2D350FD2514433D57F6f",
      MATIC: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0",
      WMATIC: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0",
      POL: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0",
      BNB: "0x82a6c4AF830caa6c97bb504425f6A66165C2c26e",
      LINK: "0xd9FFdb71EbE7496cC440152d43986Aae0AB76665",
      UNI: "0xdf0Fb4e4F928d2dCB76f438575fDD8682386e13C",
      AAVE: "0x72484B12719E23115761D5DA1646945632979bB6",
      SOL: "0x10C8264C0935b3B9870013e057f330Ff3e9C56dC",
      SUSHI: "0x49B0c695039243BBfEb8EcD054EB70061fd54aa0",
      MKR: "0xa070427bF5bA5709f70e98b94Cb2F435a242C46C",
      AVAX: "0xe01eA2fbd8D76ee323FbEd03eB9a8625EC981A10",
      DOGE: "0xbaf9327b6564454F4a3364C33eFeEf032b4b4444",
    },
  },
  1: {
    nativeAsset: "ETH",
    feesAddress: "0xfee0000a55d378afbcbbaeaef29b58f8872b7f02",
    pythOracleAddress: "",
    executorAddressV4: "0x1a293cbaeeba96a6b0178d4f266a6df58996de99b",
    treasuryAddress: "0xed0718fd0a9c5f8b7f8433f02d9f01c40cd0a3d8",
    treasuryAddressNew: "0x000066320a467de62b1548f46465abbb82662331",
    lhFeesAddress: "0xbe2dae039bb3b92e8f457e69bfd6543604a297f2",
    specialTokens: {},
    oracleAddresses: {
      USDT: "0x3E7d1eAB13ad0104d2750B8863b489D65364e32D",
      USDC: "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6",
      DAI: "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9",
      ETH: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
      WETH: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
      BTC: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c",
      WBTC: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c",
      MATIC: "0x7bAC85A8a13A4BcD8abb3eB7d6b4d632c5a57676",
      BNB: "0x14e613AC84a31f709eadbdF89C6CC390fDc9540A",
      LINK: "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c",
      UNI: "0x553303d460EE0afB37EdFf9bE42922D8FF63220e",
      AAVE: "0x547a514d5e3769680Ce22B2361c10Ea13619e8a9",
      SOL: "0x4ffC43a60e009B551865A93d232E33Fce9f01507",
      SUSHI: "0xCc70F09A6CC17553b2E31954cD36E4A2d89501f7",
      MKR: "0xec1D1B3b0443256cc3860e24a46F108e699484Aa",
      SNX: "0xDC3EA94CD0AC27d9A86C180091e7f78C683d3699",
      stETH: "0xCfE54B5cD566aB89272946F602D76Ea879CAb4a8",
      CRV: "0xCd627aA160A6fA45Eb793D19Ef54f5062F20f33f",
      GRT: "0x86cF33a451dE9dc61a2862FD94FF4ad4Bd65A5d2",
      ENS: "0x5C00128d4d1c2F4f652C267d7bcdD7aC99C16E16",
      AVAX: "0xFF3EEb22B5E3dE6e705b44749C2559d704923FD7",
      ARB: "0x31697852a68433DbCc2Ff612c516d69E3D9bd08F",
    },
  },
};

export function getOracleAddress(chainId: number, assetName: string): string | null {
  const config = CHAIN_CONFIG[chainId];
  if (!config) return null;
  // Map common aliases
  const aliases: Record<string, string[]> = {
    USDT: ["USDV", "lisUSD", "USD+", "vbUSDT", "vUSD"],
    USDC: ["axlUSDC", "multiUSDC", "USDbC", "vbUSDC", "USDC.e"],
    DAI: ["BUSD"],
    ETH: ["BETH", "vbETH", "vETH"],
    WETH: [],
    BTC: ["BTCB", "vbWBTC"],
    WBTC: [],
    MATIC: [],
    WMATIC: [],
  };
  // Direct lookup
  if (config.oracleAddresses[assetName]) return config.oracleAddresses[assetName];
  // Check aliases
  for (const [canonical, alts] of Object.entries(aliases)) {
    if (alts.includes(assetName) && config.oracleAddresses[canonical]) {
      return config.oracleAddresses[canonical];
    }
  }
  return null;
}

export const EXECUTE_SIGNATURE_V1 = "((bytes,bytes),(address,address,uint256,address,bytes)[])";
export const EXECUTE_SIGNATURE_V2 = "((bytes,bytes)[],(address,bytes)[])";
export const EXECUTE_SIGNATURE_V4 = "((bytes,bytes)[],(address,bytes)[],address,address[])";
export const ORDER_SIGNATURE = "((address,address,uint256,uint256,address,bytes),uint256,uint256,address,uint256,(address,uint256,uint256),(address,uint256,uint256,address)[])";
export const TUPLE_PREFIX = "0x0000000000000000000000000000000000000000000000000000000000000020";
export const SWAP_TOTAL_ID = "TOTAL";
