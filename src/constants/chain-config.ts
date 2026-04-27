// 1:1 port of subgraph per-chain configs (subgraphs/liquidity-hub-analytics/config + subgraphs/orbs-twap/config).
// oracleAddresses values can be either a 20-byte Chainlink contract address (42 chars) or a 32-byte
// Pyth feed ID (66 chars). pricing.ts branches on length.

export type SpecialTokenType =
  | "v2price"             // pool ratio / decimals
  | "v2price_inverse"     // decimals / pool ratio
  | "v2recursive"         // pool ratio * baseAsset USD price
  | "v2recursive_inverse" // baseAsset USD price / pool ratio

export interface SpecialTokenConfig {
  pool: string;
  decimals: string;
  type: SpecialTokenType;
  // For "v2recursive" / "v2recursive_inverse" — the base asset whose USD price
  // we multiply/divide by (e.g. WETH on Arbitrum/Base/Linea, WFTM on Fantom).
  baseAsset?: string;
  baseAssetAddress?: string;
}

export interface ChainConfig {
  nativeAsset: string;
  // TWAP DEX fees address — used by twap.ts to extract dexFee from Transfer logs.
  feesAddress: string;
  // Pyth oracle contract address (empty if chain uses Chainlink only).
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
  specialTokens: Record<string, SpecialTokenConfig>;
}

export const CHAIN_CONFIG: Record<number, ChainConfig> = {
  // === ETHEREUM MAINNET ===
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
      "1INCH": "0xc929ad75B72593967DE83E7F7Cda0493458261D9",
      AAVE: "0x547a514d5e3769680Ce22B2361c10Ea13619e8a9",
      AVAX: "0xFF3EEb22B5E3dE6e705b44749C2559d704923FD7",
      ARB: "0x31697852a68433DbCc2Ff612c516d69E3D9bd08F",
      CRV: "0xCd627aA160A6fA45Eb793D19Ef54f5062F20f33f",
      CVX: "0xd962fC30A72A84cE50161031391756Bf2876Af5D",
      ENS: "0x5C00128d4d1c2F4f652C267d7bcdD7aC99C16E16",
      GRT: "0x86cF33a451dE9dc61a2862FD94FF4ad4Bd65A5d2",
      LINK: "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c",
      MKR: "0xec1D1B3b0443256cc3860e24a46F108e699484Aa",
      RDNT: "0x393CC05baD439c9B36489384F11487d9C8410471",
      RPL: "0x4E155eD98aFE9034b7A5962f6C84c86d869daA9d",
      SNX: "0xDC3EA94CD0AC27d9A86C180091e7f78C683d3699",
      SOL: "0x4ffC43a60e009B551865A93d232E33Fce9f01507",
      stETH: "0xCfE54B5cD566aB89272946F602D76Ea879CAb4a8",
      SUSHI: "0xCc70F09A6CC17553b2E31954cD36E4A2d89501f7",
      UNI: "0x553303d460EE0afB37EdFf9bE42922D8FF63220e",
    },
  },

  // === POLYGON ===
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
      QUICK: {
        pool: "0x747375305b825c49fb97ee0ac09d19ec9ef94bd2",
        decimals: "1e18",
        type: "v2price",
      },
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
      "1INCH": "0x443C5116CdF663Eb387e72C688D276e702135C87",
      AAVE: "0x72484B12719E23115761D5DA1646945632979bB6",
      ADA: "0x882554df528115a743c4537828DA8D5B58e52544",
      ALGO: "0x03Bc6D9EFed65708D35fDaEfb25E87631a0a3437",
      APE: "0x2Ac3F3Bfac8fC9094BC3f0F9041a51375235B992",
      AVAX: "0xe01eA2fbd8D76ee323FbEd03eB9a8625EC981A10",
      AXS: "0x9c371aE34509590E10aB98205d2dF5936A1aD875",
      BAT: "0x2346Ce62bd732c62618944E51cbFa09D985d86D2",
      BCH: "0x327d9822e9932996f55b39F557AEC838313da8b7",
      CRV: "0x336584C8E6Dc19637A5b36206B1c79923111b405",
      DOGE: "0xbaf9327b6564454F4a3364C33eFeEf032b4b4444",
      DOT: "0xacb51F1a83922632ca02B25a8164c10748001BdE",
      ETC: "0xDf3f72Be10d194b58B1BB56f2c4183e661cB2114",
      FIL: "0xa07703E5C2eD1516107c7c72A494493Dcb99C676",
      FTM: "0x58326c0F831b2Dbf7234A4204F28Bba79AA06d5f",
      WFTM: "0x58326c0F831b2Dbf7234A4204F28Bba79AA06d5f",
      FXS: "0x6C0fe985D3cAcbCdE428b84fc9431792694d0f51",
      GRT: "0x3FabBfb300B1e2D7c9B84512fe9D30aeDF24C410",
      ICP: "0x84227A76a04289473057BEF706646199D7C58c34",
      LINK: "0xd9FFdb71EbE7496cC440152d43986Aae0AB76665",
      LTC: "0xEB99F173cf7d9a6dC4D889C2Ad7103e8383b6Efa",
      MKR: "0xa070427bF5bA5709f70e98b94Cb2F435a242C46C",
      QNT: "0xF7F291042F6Cbc4deC0Ad75c17786511a530dbe8",
      SAND: "0x3D49406EDd4D52Fb7FFd25485f32E073b529C924",
      SHIB: "0x3710abeb1A0Fc7C2EC59C26c8DAA7a448ff6125A",
      SOL: "0x10C8264C0935b3B9870013e057f330Ff3e9C56dC",
      SUSHI: "0x49B0c695039243BBfEb8EcD054EB70061fd54aa0",
      TRX: "0x307cCF7cBD17b69A487b9C3dbe483931Cf3E1833",
      UNI: "0xdf0Fb4e4F928d2dCB76f438575fDD8682386e13C",
      XRP: "0x785ba89291f676b5386652eB12b30cF361020694",
    },
  },

  // === BSC ===
  56: {
    nativeAsset: "BNB",
    feesAddress: "0xfee0000a55d378afbcbbaeaef29b58f8872b7f02",
    pythOracleAddress: "",
    executorAddressV4: "0x120971cac17b63ffdadf862724925914b025a9e6",
    treasuryAddress: "0xb1baf397b3946a81c7f5c54807474ecf194dc446",
    treasuryAddressNew: "0x000066320a467de62b1548f46465abbb82662331",
    lhFeesAddress: "0xbe2dae039bb3b92e8f457e69bfd6543604a297f2",
    specialTokens: {
      THE: {
        pool: "0x34b897289fccb43c048b2cea6405e840a129e021",
        decimals: "1e18",
        type: "v2price",
      },
    },
    oracleAddresses: {
      USDT: "0xB97Ad0E74fa7d920791E90258A6E2085088b4320",
      USDC: "0x51597f405303C4377E36123cBc172b13269EA163",
      USDD: "0x51c78c299C42b058Bf11d47FbB74aC437C6a0c8C",
      TUSD: "0xa3334A9762090E827413A7495AfeCE76F41dFc06",
      DAI: "0x132d3C0B1D2cEa0BC552588063bdBb210FDeecfA",
      ETH: "0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e",
      WETH: "0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e",
      BTC: "0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf",
      WBTC: "0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf",
      MATIC: "0x7CA57b0cA6367191c94C8914d7Df09A57655905f",
      BNB: "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE",
      WBNB: "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE",
      CAKE: "0xB6064eD41d4f67e353768aA239cA86f4F73665a1",
      "1INCH": "0x9a177Bb9f5b6083E962f9e62bD21d4b5660Aeb03",
      AAVE: "0xA8357BF572460fC40f4B0aCacbB2a6A61c89f475",
      ADA: "0xa767f745331D267c7751297D982b050c93985627",
      AVAX: "0x5974855ce31EE8E1fff2e76591CbF83D7110F151",
      AXS: "0x7B49524ee5740c99435f52d731dFC94082fE61Ab",
      BCH: "0x43d80f616DAf0b0B42a928EeD32147dC59027D41",
      DOGE: "0x3AB0A0d137D4F946fBB19eecc6e92E64660231C8",
      DOT: "0xC333eb0086309a16aa7c8308DfD32c8BBA0a2592",
      FIL: "0xE5dbFD9003bFf9dF5feB2f4F445Ca00fb121fb83",
      FTM: "0xe2A47e87C0f4134c8D06A41975F6860468b2F925",
      WFTM: "0xe2A47e87C0f4134c8D06A41975F6860468b2F925",
      FXS: "0x0E9D55932893Fb1308882C7857285B2B0bcc4f4a",
      ICP: "0x84210d9013A30C6ab169e28840A6CC54B60fa042",
      LINK: "0xca236E327F629f9Fc2c30A4E95775EbF0B89fac8",
      LTC: "0x74E72F37A8c415c8f1a98Ed42E78Ff997435791D",
      SHIB: "0xA615Be6cb0f3F36A641858dB6F30B9242d0ABeD8",
      SOL: "0x0E8a53DD9c13589df6382F13dA6B3Ec8F919B323",
      SUSHI: "0xa679C72a97B654CFfF58aB704de3BA15Cde89B07",
      TRX: "0xF4C5e535756D11994fCBB12Ba8adD0192D9b88be",
      UNI: "0xb57f259E7C24e56a1dA00F66b55A5640d9f9E7e4",
      XRP: "0x93A67D414896A280bF8FFB3b389fE3686E014fda",
    },
  },

  // === BASE ===
  8453: {
    nativeAsset: "ETH",
    feesAddress: "0xfee0000a55d378afbcbbaeaef29b58f8872b7f02",
    pythOracleAddress: "",
    executorAddressV4: "0xBeF2e13a4eFE626b5F3833D9DCb2f03895060FD4",
    treasuryAddress: "0xdfaa8117df6d1f4745d61722d9aac8f3aa87cd1e",
    treasuryAddressNew: "0x000066320a467de62b1548f46465abbb82662331",
    lhFeesAddress: "0xbe2dae039bb3b92e8f457e69bfd6543604a297f2",
    specialTokens: {
      BSWAP: {
        pool: "0xE80B4F755417FB4baF4dbd23C029db3F62786523",
        decimals: "1e18",
        type: "v2recursive",
        baseAsset: "WETH",
        baseAssetAddress: "0x4200000000000000000000000000000000000006",
      },
    },
    oracleAddresses: {
      USDT: "0xf19d560eB8d2ADf07BD6D13ed03e1D11215721F9",
      USDC: "0x7e860098F58bBFC8648a4311b374B1D669a2bc6B",
      DAI: "0x591e79239a7d679378eC8c847e5038150364C78F",
      ETH: "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70",
      WETH: "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70",
      BTC: "0xCCADC697c55bbB68dc5bCdf8d3CBe83CdD4E071E",
      WBTC: "0xCCADC697c55bbB68dc5bCdf8d3CBe83CdD4E071E",
      LINK: "0x17CAb8FE31E32f08326e5E27412894e49B0f9D65",
      SOL: "0x975043adBb80fc32276CbF9Bbcfd4A601a12462D",
    },
  },

  // === FANTOM ===
  250: {
    nativeAsset: "FTM",
    feesAddress: "0xfEe070067c7102F99DB9d8ef4e5EeDDF9bf7614A",
    pythOracleAddress: "",
    executorAddressV4: "0xACb08e5A61D859320eeaaDA38CE7346840F40e60",
    treasuryAddress: "0x83Ea86A719b19c855A192Fd3340c27e9bFb93547",
    treasuryAddressNew: "0x000066320a467de62b1548f46465abbb82662331",
    lhFeesAddress: "0xbe2dae039bb3b92e8f457e69bfd6543604a297f2",
    specialTokens: {
      BOO: {
        pool: "0xEc7178F4C41f346b2721907F5cF7628E388A7a58",
        decimals: "1e18",
        type: "v2recursive",
        baseAsset: "WFTM",
        baseAssetAddress: "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
      },
    },
    oracleAddresses: {
      USDT: "0xF64b636c5dFe1d3555A847341cDC449f612307d0",
      USDC: "0x2553f4eeb82d5A26427b8d1106C51499CBa5D99c",
      DAI: "0x91d5DEFAFfE2854C7D02F50c80FA1fdc8A721e52",
      ETH: "0x11DdD3d147E5b83D01cee7070027092397d63658",
      WETH: "0x11DdD3d147E5b83D01cee7070027092397d63658",
      BTC: "0x8e94C22142F4A64b99022ccDd994f4e9EC86E4B4",
      WBTC: "0x8e94C22142F4A64b99022ccDd994f4e9EC86E4B4",
      BNB: "0x6dE70f4791C4151E00aD02e969bD900DC961f92a",
      AAVE: "0xE6ecF7d2361B6459cBb3b4fb065E0eF4B175Fe74",
      FTM: "0xf4766552D15AE4d256Ad41B6cf2933482B0680dc",
      WFTM: "0xf4766552D15AE4d256Ad41B6cf2933482B0680dc",
      LINK: "0x221C773d8647BC3034e91a0c47062e26D20d97B4",
      SUSHI: "0xCcc059a1a17577676c8673952Dc02070D29e5a66",
    },
  },

  // === LINEA ===
  59144: {
    nativeAsset: "ETH",
    feesAddress: "0xfee0000a55d378afbcbbaeaef29b58f8872b7f02",
    pythOracleAddress: "",
    executorAddressV4: "0xc626f9AeD3164E4fa190F98a754f19996A06De2A",
    treasuryAddress: "0x2B6b06E352730f1d783526fBE847169Ff5a5Bf76",
    treasuryAddressNew: "0x000066320a467de62b1548f46465abbb82662331",
    lhFeesAddress: "0xbe2dae039bb3b92e8f457e69bfd6543604a297f2",
    specialTokens: {
      LYNX: {
        pool: "0x1C6Fb08C1ef4E505a4Ae3Ffc3C99E443070Df64A",
        decimals: "1e18",
        type: "v2recursive_inverse",
        baseAsset: "WETH",
        baseAssetAddress: "0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f",
      },
    },
    oracleAddresses: {
      USDT: "0xefCA2bbe0EdD0E22b2e0d2F8248E99F4bEf4A7dB",
      USDC: "0xAADAa473C1bDF7317ec07c915680Af29DeBfdCb5",
      DAI: "0x5133D67c38AFbdd02997c14Abd8d83676B4e309A",
      ETH: "0x3c6Cd9Cc7c7a4c2Cf5a82734CD249D7D593354dA",
      WETH: "0x3c6Cd9Cc7c7a4c2Cf5a82734CD249D7D593354dA",
      BTC: "0x7A99092816C8BD5ec8ba229e3a6E6Da1E628E1F9",
      WBTC: "0x7A99092816C8BD5ec8ba229e3a6E6Da1E628E1F9",
      MATIC: "0x9ce4473B42a639d010eD741df3CA829E6e480803",
      AAVE: "0x09B0a8AFD9185500d7C64FC68338b4C50db6df1d",
      ARB: "0x28606F10277Cc2e99e57ae2C55D26860E13A1BBD",
      // FOXY intentionally omitted — the configured oracle 0xdE14081b6bd...
      // is not a real Chainlink feed (decimals() reverts) but latestAnswer()
      // returns ~1e16 garbage values, producing $1e13 dollar values per swap.
      // See PRICING_NOTES.md.
      LINK: "0x8dF01C2eFed1404872b54a69f40a57FeC1545998",
      POL: "0xEF77B4A7D92eBDC89025B8E11916A69BDA6d189c",
      wstETH: "0x8eCE1AbA32716FdDe8D6482bfd88E9a0ee01f565",
    },
  },

  // === ARBITRUM ===
  42161: {
    nativeAsset: "ETH",
    feesAddress: "0xfee0000a55d378afbcbbaeaef29b58f8872b7f02",
    pythOracleAddress: "",
    treasuryAddressNew: "0x000066320a467de62b1548f46465abbb82662331",
    lhFeesAddress: "0xbe2dae039bb3b92e8f457e69bfd6543604a297f2",
    specialTokens: {
      CHR: {
        pool: "0x20585BFBC272A9D58ad17582BCdA9A5A57271d6A",
        decimals: "1e18",
        type: "v2price_inverse",
      },
      ARX: {
        pool: "0x62fddfc2d4b35adec79c6082ca2894eab01ac0db",
        decimals: "1e18",
        type: "v2recursive",
        baseAsset: "WETH",
        baseAssetAddress: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      },
      RAM: {
        // RAM/WETH pool ordering: WETH = token0, RAM = token1 (by hex sort).
        // poolPrice = real_WETH/real_RAM, so per-raw-RAM = poolPrice * basePerRawWETH.
        // Original subgraph uses the LYNX-style `basePrice / pool` here, which is
        // mathematically wrong for this pool ordering and inflates RAM swaps by
        // a factor of ~1e10. Use v2recursive (the same formula ARX/BSWAP/BOO use).
        // See PRICING_NOTES.md for derivation.
        pool: "0x1E50482e9185D9DAC418768D14b2F2AC2b4DAF39",
        decimals: "1e18",
        type: "v2recursive",
        baseAsset: "WETH",
        baseAssetAddress: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      },
    },
    oracleAddresses: {
      USDT: "0x3f3f5dF88dC9F13eac63DF89EC16ef6e7E25DdE7",
      USDC: "0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3",
      USDD: "0x4Ee1f9ec1048979930aC832a3C1d18a0b4955a02",
      USDe: "0x88AC7Bca36567525A866138F03a6F6844868E0Bc",
      DAI: "0xc5C8E77B397E531B8EC06BFb0048328B30E9eCfB",
      ETH: "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612",
      WETH: "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612",
      BTC: "0x6ce185860a4963106506C203335A2910413708e9",
      WBTC: "0x6ce185860a4963106506C203335A2910413708e9",
      MATIC: "0x52099D4523531f678Dfc568a7B1e5038aadcE1d6",
      BNB: "0x6970460aabF80C5BE983C6b74e5D06dEDCA95D4A",
      CAKE: "0x256654437f1ADA8057684b18d742eFD14034C400",
      "1INCH": "0x4bC735Ef24bf286983024CAd5D03f0738865Aaef",
      AAVE: "0xaD1d5344AaDE45F43E596773Bcc4c423EAbdD034",
      ADA: "0xD9f615A9b820225edbA2d821c4A696a0924051c6",
      AVAX: "0x8bf61728eeDCE2F32c456454d87B5d6eD6150208",
      ARB: "0xb2A824043730FE05F3DA2efaFa1CBbe83fa548D6",
      AXS: "0x5B58aA6E0651Ae311864876A55411F481aD86080",
      CRV: "0xaebDA2c976cfd1eE1977Eac079B4382acb849325",
      CVX: "0xc5C8E77B397E531B8EC06BFb0048328B30E9eCfB",
      DOGE: "0x9A7FB1b3950837a8D9b40517626E11D4127C098C",
      DOT: "0xa6bC5bAF2000424e90434bA7104ee399dEe80DEc",
      ENA: "0x9eE96caa9972c801058CAA8E23419fc6516FbF7e",
      FTM: "0xFeaC1A3936514746e70170c0f539e70b23d36F19",
      WFTM: "0xFeaC1A3936514746e70170c0f539e70b23d36F19",
      FXS: "0x36a121448D74Fa81450c992A1a44B9b7377CD3a5",
      GMX: "0xDB98056FecFff59D032aB628337A4887110df3dB",
      GNS: "0xE89E98CE4E19071E59Ed4780E0598b541CE76486",
      GRT: "0x0F38D86FceF4955B705F35c9e41d1A16e0637c73",
      LDO: "0xA43A34030088E6510FecCFb77E88ee5e7ed0fE64",
      LINK: "0x86E53CF1B870786351Da77A57575e79CB55812CB",
      LTC: "0x5698690a7B7B84F6aa985ef7690A8A7288FBc9c8",
      MAGIC: "0x47E55cCec6582838E173f252D08Afd8116c2202d",
      MKR: "0xdE9f0894670c4EFcacF370426F10C3AD2Cdf147e",
      OP: "0x205aaD468a11fd5D34fA7211bC6Bad5b3deB9b98",
      PENDLE: "0x66853E19d73c0F9301fe099c324A1E9726953433",
      PEPE: "0x02DEd5a7EDDA750E3Eb240b54437a54d57b74dBE",
      POL: "0x82BA56a2fADF9C14f17D08bc51bDA0bDB83A8934",
      RDNT: "0x20d0Fcab0ECFD078B036b6CAf1FaC69A6453b352",
      RPL: "0xF0b7159BbFc341Cc41E7Cb182216F62c6d40533D",
      SNX: "0x054296f0D036b95531B4E14aFB578B80CFb41252",
      SOL: "0x24ceA4b8ce57cdA5058b924B9B9987992450590c",
      stETH: "0x07C5b924399cc23c24a95c8743DE4006a32b7f2a",
      SUSHI: "0xb2A8BA74cbca38508BA1632761b56C897060147C",
      TAO: "0x6aCcBB82aF71B8a576B4C05D4aF92A83A035B991",
      TIA: "0x4096b9bfB4c34497B7a3939D4f629cf65EBf5634",
      UNI: "0x9C917083fDb403ab5ADbEC26Ee294f6EcAda2720",
      XRP: "0xB4AD57B52aB9141de9926a3e0C8dc6264c2ef205",
    },
  },

  // === SONIC ===
  146: {
    nativeAsset: "S",
    feesAddress: "",
    pythOracleAddress: "",
    treasuryAddressNew: "0x000066320a467de62b1548f46465abbb82662331",
    lhFeesAddress: "0xbe2dae039bb3b92e8f457e69bfd6543604a297f2",
    specialTokens: {},
    oracleAddresses: {
      USDT: "0x76F4C040A792aFB7F6dBadC7e30ca3EEa140D216",
      USDC: "0x55bCa887199d5520B3Ce285D41e6dC10C08716C9",
      DAI: "0x1654Df3d2543717534eE1c38eb9aF5F0407Ec708",
      ETH: "0x824364077993847f71293B24ccA8567c00c2de11",
      WETH: "0x824364077993847f71293B24ccA8567c00c2de11",
      BTC: "0x8Bcd59Cb7eEEea8e2Da3080C891609483dae53EF",
      WBTC: "0x8Bcd59Cb7eEEea8e2Da3080C891609483dae53EF",
      LINK: "0x26e450ca14D7bF598C89f212010c691434486119",
      S: "0xc76dFb89fF298145b417d221B2c747d84952e01d",
      wS: "0xc76dFb89fF298145b417d221B2c747d84952e01d",
    },
  },

  // === POLYGON ZKEVM ===
  1101: {
    nativeAsset: "ETH",
    feesAddress: "",
    pythOracleAddress: "",
    executorAddressV4: "0x3b17F4c26A80a3BfcEC1CC0d03615ba02A104556",
    treasuryAddress: "0xA80558F2C28f5bE7FD023d20f9355EbF8390AF48",
    treasuryAddressNew: "0x000066320a467de62b1548f46465abbb82662331",
    lhFeesAddress: "0xbe2dae039bb3b92e8f457e69bfd6543604a297f2",
    specialTokens: {},
    oracleAddresses: {
      USDT: "0x8499f6E7D6Ac56C83f66206035D33bD1908a8b5D",
      USDC: "0x0167D934CB7240e65c35e347F00Ca5b12567523a",
      DAI: "0xa4Fd5C39d975067c877F287E78D600da07E8344c",
      ETH: "0x97d9F9A00dEE0004BE8ca0A8fa374d486567eE2D",
      WETH: "0x97d9F9A00dEE0004BE8ca0A8fa374d486567eE2D",
      BTC: "0xAE243804e1903BdbE26ae5f35bc6E4794Be21574",
      WBTC: "0xAE243804e1903BdbE26ae5f35bc6E4794Be21574",
      MATIC: "0x7C85dD6eBc1d318E909F22d51e756Cf066643341",
      AAVE: "0xF2F574b5E45E4c179F4AF62BbFDCa7df2e2C6ca9",
      // LINK intentionally omitted — only LINK/ETH feed is published on Polygon zkEVM,
      // which would produce ETH-denominated values mistaken for USD. See PRICING_NOTES.md.
      POL: "0x44285b60Cc13557935CA4945d20475BD1f1058f4",
    },
  },

  // === AVALANCHE ===
  43114: {
    nativeAsset: "AVAX",
    feesAddress: "",
    pythOracleAddress: "",
    treasuryAddressNew: "0x000066320a467de62b1548f46465abbb82662331",
    specialTokens: {},
    oracleAddresses: {
      USDT: "0x7898AcCC83587C3C55116c5230C17a6Cd9C71bad",
      USDC: "0x97FE42a7E96640D932bbc0e1580c73E705A8EB73",
      ETH: "0x86d67c3D38D2bCeE722E601025C25a575021c6EA",
      WETH: "0x86d67c3D38D2bCeE722E601025C25a575021c6EA",
      BTC: "0x31CF013A08c6Ac228C94551d535d5BAfE19c602a",
      WBTC: "0x31CF013A08c6Ac228C94551d535d5BAfE19c602a",
      LINK: "0x34C4c526902d88a3Aa98DB8a9b802603EB1E3470",
      AVAX: "0x0A77230d17318075983913bC2145DB16C7366156",
      WAVAX: "0x0A77230d17318075983913bC2145DB16C7366156",
    },
  },

  // === KATANA ===
  824: {
    nativeAsset: "ETH",
    feesAddress: "",
    pythOracleAddress: "",
    treasuryAddressNew: "0x000066320a467de62b1548f46465abbb82662331",
    specialTokens: {},
    oracleAddresses: {
      USDT: "0xF03E1566Fc6B0eBFA3dD3aA197759C4c6617ec78",
      USDC: "0xbe5CE90e16B9d9d988D64b0E1f6ed46EbAfb9606",
      USDS: "0x44cdCd6F81cEe5BAC68B21845Fc82846ee09A369",
      ETH: "0x7BdBDB772f4a073BadD676A567C6ED82049a8eEE",
      WETH: "0x7BdBDB772f4a073BadD676A567C6ED82049a8eEE",
      BTC: "0x41DdB7F8F5e1b2bD28193B84C1C36Be698dEd162",
      WBTC: "0x41DdB7F8F5e1b2bD28193B84C1C36Be698dEd162",
      SUSHI: "0xA30C356781E5e1b455b274cdDe524FB7BF3809da",
      LINK: "0x06bD6464e94Bee9393Ae15B5Dd5eCDFAa4F299C1",
      POL: "0xF6630799b5387e0E9ACe92a5E82673021781B440",
      SOL: "0x709c4dc298322916eaE59bfdc2e3d750B55C864B",
      wstETH: "0xCB568C33EA2B0B81852655d722E3a52d9D44e7De",
      weETH: "0x3Eae75C0a2f9b1038C7c9993C1Da36281E838811",
      YFI: "0xfcDcCF5C2BEAB72FDb910481beaE807F5453686B",
    },
  },

  // === BLAST (Pyth) ===
  81457: {
    nativeAsset: "ETH",
    feesAddress: "",
    pythOracleAddress: "0xA2aa501b19aff244D90cc15a4Cf739D2725B5729",
    executorAddressV4: "0x2f815a7C8047aa649960eaDB1557249fFc93A0CD",
    treasuryAddress: "0xE92329709A7C19e1568294fc3693a064CcaeAc39",
    treasuryAddressNew: "0x000066320a467de62b1548f46465abbb82662331",
    lhFeesAddress: "0xbe2dae039bb3b92e8f457e69bfd6543604a297f2",
    specialTokens: {},
    oracleAddresses: {
      ETH: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
      WETH: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
      BTC: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
      WBTC: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
      BLAST: "0x057345a7e9ef0f36dca8ad1c4e5788808b85f3084cc7b0d8cb29ac5012d88f0d",
      BLUR: "0x856aac602516addee497edf6f50d39e8c95ae5fb0da1ed434a8c2ab9c3e877e9",
      USDB: "0x41283d3f78ccb459a24e5f1f1b9f5a72a415a26ff9ce0391a6878f4cda6b477b",
      USDC: "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a",
      USDT: "0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b",
      USDe: "0x6ec879b1e9963de5ee97e9c8710b742d6228252a5e2ca12d4ae81d7fe5ee8c5d",
      pxETH: "0x834be8951394714988606b3a1ac299c48bd07d68e5abb02766bcf881fdc1e69c",
    },
  },

  // === SEI (Pyth) ===
  1329: {
    nativeAsset: "SEI",
    feesAddress: "",
    pythOracleAddress: "0x2880aB155794e7179c9eE2e38200202908C17B43",
    treasuryAddressNew: "0x000066320a467de62b1548f46465abbb82662331",
    specialTokens: {},
    oracleAddresses: {
      SEI: "0x53614f1cb0c031d4af66c04cb9c756234adad0e1cee85303795091499a4084eb",
      WSEI: "0x53614f1cb0c031d4af66c04cb9c756234adad0e1cee85303795091499a4084eb",
      USDT: "0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b",
      USDC: "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a",
    },
  },

  // === BERACHAIN (Pyth) ===
  80094: {
    nativeAsset: "BERA",
    feesAddress: "",
    pythOracleAddress: "0x2880aB155794e7179c9eE2e38200202908C17B43",
    treasuryAddressNew: "0x000066320a467de62b1548f46465abbb82662331",
    specialTokens: {},
    oracleAddresses: {
      ETH: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
      WETH: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
      BTC: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
      WBTC: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
      BERA: "0x962088abcfdbdb6e30db2e340c8cf887d9efb311b1f2f17b155a63dbb6d40265",
      WBERA: "0x962088abcfdbdb6e30db2e340c8cf887d9efb311b1f2f17b155a63dbb6d40265",
      USDC: "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a",
      USDT: "0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b",
    },
  },

  // === FLARE (no oracle config in original — entries left blank for now) ===
  14: {
    nativeAsset: "FLR",
    feesAddress: "",
    pythOracleAddress: "",
    treasuryAddressNew: "0x000066320a467de62b1548f46465abbb82662331",
    specialTokens: {},
    oracleAddresses: {},
  },
};

export function getOracleAddress(chainId: number, assetName: string): string | null {
  const config = CHAIN_CONFIG[chainId];
  if (!config) return null;

  // Mirrors the alias map in subgraphs/{liquidity-hub-analytics,orbs-twap}/src/utils/constants.template.ts.
  // Each entry: canonical → alternate symbol names that should resolve to the same oracle.
  const aliases: Record<string, string[]> = {
    USDT: ["USDV", "lisUSD", "USD+", "vbUSDT", "vUSD"],
    USDC: ["axlUSDC", "multiUSDC", "USDbC", "vbUSDC", "USDC.e"],
    DAI: ["BUSD"],
    ETH: ["WETH", "BETH", "vbETH", "vETH"],
    BTC: ["WBTC", "BTCB", "vbWBTC"],
    MATIC: ["WMATIC"],
    BNB: ["WBNB", "slisBNB"],
    CAKE: ["Cake"],
    FTM: ["WFTM"],
    POL: ["WPOL"],
    S: ["wS", "WS"],
    SEI: ["WSEI"],
    BERA: ["WBERA"],
    AVAX: ["WAVAX"],
    FLR: ["WFLR"],
  };

  // Direct lookup
  if (config.oracleAddresses[assetName]) return config.oracleAddresses[assetName];

  // Alias lookup
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
