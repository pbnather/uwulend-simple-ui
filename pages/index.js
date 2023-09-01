
import { useWeb3React } from "@web3-react/core"
import { injected, walletConnect } from "../components/wallet/Connectors"
import Contract from "web3-eth-contract"
import { useState, useEffect } from "react"
import { BigNumber, ethers } from "ethers";
import uwuclaim from "../contracts/uwuclaim.json"

const incentiveControllerV2 = "0xDB5C23ae97f76dacC907f5F13bDa54131C8e9e5a";
const incentiveControllerV1 = "0x21953192664867e19F85E96E1D1Dd79dc31cCcdB";
const uwuContracts = [
  "0xb95BD0793bCC5524AF358ffaae3e38c3903C7626",
  "0x1254B1fd988A1168E44a4588bb503a867F8E410F",
  "0x8C240C385305aeb2d5CeB60425AABcb3488fa93d",
  "0x51e0F19bF0B765Bc55724C7374FE00aB229427d9",
  "0x67fadbD9Bf8899d7C578db22D7af5e2E500E13e5",
  "0xBac9D17f290260a1D5f1b69cAC84dBa6b4488d66",
  "0x6Ace5c946a3Abd8241f31f182c479e67A4d8Fc8d",
  "0x64E4843FfdFB62d205B049ddbe8B949534e4e2D4",
  "0x02738ef3f8d8D3161DBBEDbda25574154c560dAe",
  "0x5C8cb0e43CB17553ab4A37011C3DC743aEB3f241",
  "0xC480a11A524E4DB27c6d4E814b4D9B3646bC12Fc",
  "0xd5Bfd3d736477F48eFc873ee464F4a8B5447850b",
  "0xaDFa5Fa0c51d11B54C8a0B6a15F47987BD500086",
  "0x9ABe34021128C17DE3C2180A02932Eb5e1bb18ef",
  "0x243387a7036bfcB09f9bF4EcEd1E60765D31aA70",
  "0x29d567fA37B4aF64DD1b886571CD1fF5d403AC3F",
  "0xdb1A8f07f6964EFcFfF1Aa8025b8ce192Ba59Eba",
  "0xB9e8bcd56F26B0540989a66Aa24D431Cdb0AFfA0",
  "0xC4BF704f51aa4ce1AA946FfE15646f9B271ba0fa",
  "0x13CdfDD18e6BB8D41bE0A55D9Cf697C0EF11176b",
  "0x24959F75d7BDA1884f1Ec9861f644821Ce233c7D",
  "0xaac1d67f1C17EC01593D76E831C51a4F458Dc160",
  "0x8028Ea7da2ea9BCb9288C1F6f603169B8AEa90A6",
  "0x39A873F3f60Bb4cd81fE46f3Beb6285bdb7726b9",
  "0x51144708b82eA3b5b1002C9DC38b71ec63b7e670",
  "0xEc12f63116bD2493104a26FbDBCd70f51ab7B2C1",
  "0xD1E6b03bF65B381cBDecCf275535d40D4C3510E2",
  "0x453842ba9dCD4569407B2adEDeB8636314D023D3"
];

const uwuContractNames = [
  "uDAI (deposit)",
  "uDAI (borrow)",
  "uFRAX (deposit)",
  "uFRAX (borrow)",
  "uWETH (deposit)",
  "uWETH (borrow)",
  "uWBTC (deposit)",
  "uWBTC (borrow)",
  "OLD uSIFU (deposit)",
  "OLD uSIFU (borrow)",
  "uMIM (deposit)",
  "uMIM (borrow)",
  "uLUSD (deposit)",
  "uLUSD (borrow)",
  "usSPELL (deposit)",
  "usSPELL (borrow)",
  "uCRV (deposit)",
  "uCRV (borrow)",
  "uWMEMO (deposit)",
  "uWMEMO (borrow)",
  "uUSDT (deposit)",
  "uUSDT (borrow)",
  "uSIFUM (deposit)",
  "uSIFUM (borrow)",
  "uBLUSD (deposit)",
  "uBLUSD (borrow)",
  "uSIFU (deposit)",
  "uSIFU (borrow)",
];

export default function Home() {
  const { active, account, library, connector, activate, deactivate } = useWeb3React()
  const [UwURewards, setUwURewards] = useState([])
  const [baseRewards, setBaseRewards] = useState(0)
  const [checked, setChecked] = useState([]);
  const [sumChecked, setSumChecked] = useState(0);

  useEffect(() => {
    console.log(active);
    if (active) updateTokenState();
  }, [active]);

  async function connect() {
    try {
      await activate(injected);
    } catch (ex) {
      console.log(ex)
    }
  }

  async function disconnect() {
    try {
      deactivate()
      setUwURewards([])
      setBaseRewards(0)
      setSumChecked(0)
    } catch (ex) {
      console.log(ex)
    }
  }

  async function connectWalletConnect() {
    try {
      await activate(walletConnect);
    } catch (ex) {
      console.log(ex)
    }
  }

  // Add/Remove checked item from list
  async function handleCheck(event) {
    var updatedList = [...checked];
    if (event.target.checked) {
      updatedList = [...checked, event.target.value];
    } else {
      updatedList.splice(checked.indexOf(event.target.value), 1);
    }
    setChecked(updatedList);
    console.log(updatedList);
    var sum = BigNumber.from(0);
    for (var i = 0; i < updatedList.length; i++) {
      sum = sum.add(BigNumber.from(updatedList[i]))
    }
    setSumChecked(sum.add(BigNumber.from(baseRewards)).toString());
  };

  async function updateTokenState() {
    await getUwURewardsBalance();
    var sum = BigNumber.from(0);
    for (var i = 0; i < checked.length; i++) {
      sum = sum.add(BigNumber.from(checked[i]))
    }
  }

  async function getUwURewardsBalance() {
    console.log("Calling reward balances");
    const contract = new Contract(uwuclaim, incentiveControllerV2, {
      from: account, // default from address
      gasPrice: '0'
    });
    contract.setProvider(library);
    const rewards = await contract.methods.claimableReward(account, uwuContracts).call();
    const baseClaimable = await contract.methods.userBaseClaimable(account).call();
    console.log(rewards);
    console.log(baseClaimable);

    // const contract2 = new Contract(uwuclaim, incentiveControllerV1, {
    //   from: account, // default from address
    //   gasPrice: '0'
    // });
    // contract2.setProvider(library);
    // const rewards2 = await contract2.methods.claimableReward(account, uwuContracts).call();
    // const baseClaimable2 = await contract.methods.userBaseClaimable(account).call();
    // console.log(rewards2);
    // console.log(baseClaimable2);

    var indexed = []

    for (var i = 0; i < rewards.length; i++) {
      var r = BigNumber.from(rewards[i]).add(BigNumber.from(0));
      if (!r.eq(BigNumber.from(0))) {
        if (Number(ethers.utils.formatEther(r.toString())).toFixed(2).toString() != "0.00") {
          indexed.push({ idx: i, val: r });
        }
      }
    }

    var sum = BigNumber.from(0);
    for (var i = 0; i < checked.length; i++) {
      sum = sum.add(BigNumber.from(checked[i]))
    }
    setSumChecked(sum.add(BigNumber.from(baseClaimable)).toString());
    setUwURewards(indexed);
    setBaseRewards(baseClaimable);
  }

  async function claimUwU() {
    const contract = new Contract(uwuclaim, incentiveControllerV2, {
      from: account, // default from address
    });
    contract.setProvider(library);
    var addresses = []
    for (var i = 0; i < checked.length; i++) {
      var indexOfRewards = UwURewards.findIndex(value => value["val"] == checked[i]);
      if (indexOfRewards != -1) {
        var indexOfContract = UwURewards[indexOfRewards]["idx"];
        addresses.push(uwuContracts[indexOfContract]);
      }
    }
    console.log(addresses);
    await contract.methods.claim(account, addresses).send({ from: account })
    await updateTokenState();
  }

  function formatEthereumAddress(address) {
    if (typeof address !== 'string' || !address.match(/^0x[0-9a-fA-F]+$/)) {
      throw new Error('Invalid Ethereum address format');
    }

    const prefix = '0x';
    const firstChars = address.slice(2, 6); // Get characters from index 2 to 5
    const lastChars = address.slice(-4); // Get the last 4 characters

    return prefix + firstChars + '...' + lastChars;
  }

  return (
    <div className="p-10 bg-purple-200 flex flex-col h-screen">
      <header className="bg-purple-200">
        <div class="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div class="sm:flex sm:items-center sm:justify-between">
            <div class="text-center sm:text-left">
              <h1 class="text-2xl font-bold text-gray-900 sm:text-3xl">
                UwU Lend Vesting UI
              </h1>

              <p class="mt-1.5 text-sm text-gray-500">
                This UI allows you to vest UwU rewards from specific deposits/borrows, which greatly reduces gas fees.
              </p>
            </div>

            {!active ? (
              <div class="mt-4 flex flex-col gap-4 sm:mt-0 sm:flex-row sm:items-center">
                <button
                  class="inline-flex items-center justify-center gap-1.5 block rounded-lg bg-orange-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-orange-700 focus:outline-none focus:ring"
                  type="button"
                  onClick={connect}
                >
                  <span class="text-sm font-medium"> MetaMask </span>
                </button>

                <button
                  class="block rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring"
                  type="button"
                  onClick={connectWalletConnect}
                >
                  WalletConnect
                </button>
              </div>
            ) : (
              <div class="mt-4 flex flex-col gap-4 sm:mt-0 sm:flex-row sm:items-center">
                <span className="flex flex-col items-left">Connected with <b>{formatEthereumAddress(account)}</b></span>
                {/* <button
                  class="inline-flex items-center justify-center gap-1.5 block rounded-lg bg-orange-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-orange-700 focus:outline-none focus:ring"
                  type="button"
                  onClick={connect}
                >
                  <span class="text-sm font-medium"> MetaMask </span>
                </button> */}

                <button
                  class="block rounded-lg bg-red-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-700 focus:outline-none focus:ring"
                  type="button"
                  onClick={disconnect}
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      {/* <h1 className="text-3xl font-bold">UwU Lend Vesting UI</h1>
      <p className="mt-2">This UI allows you to vest UwU rewards from specific deposits/borrows, which greatly reduces gas fees.</p> */}
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8 bg-purple-200">
        {/* {!active ? (
          <div className="flex flex-col">
            <button className="flex-row mr-4 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={connect}>
              Connect to MetaMask
            </button>
            <button className="flex py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={connectWalletConnect}>
              Connect to WalletConnect
            </button>
          </div>
        ) : (
          <span className="flex flex-col items-left">Connected with <b>{account}</b></span>
        )} */}
        {/* {active && (
          <span>
            <button className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600" onClick={disconnect}>
              Disconnect
            </button>
            <button className="ml-2 py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600" onClick={updateTokenState}>
              Refresh state
            </button>
          </span>
        )} */}
        {active && (
          <div class="h-32 rounded-lg">
            {UwURewards.map((item, index) => (
              <div key={index} className="p-1">
                <input
                  value={item["val"]}
                  type="checkbox"
                  onChange={handleCheck}
                  id={index}
                  class="peer hidden [&:checked_+_label_svg]:block [&:default_+_label_svg]:block"
                />

                <label
                  for={index}
                  class="flex cursor-pointer items-center justify-between rounded-lg border border-gray-100 bg-white p-4 text-sm font-medium shadow-sm hover:border-gray-200 peer-checked:border-blue-500 peer-checked:ring-1 peer-checked:ring-blue-500 fill-slate-300 peer-checked:fill-cyan-500"
                >
                  <div class="flex items-center gap-2">
                    <svg
                      class="h-5 w-5 text-blue-600 fill-inherit"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <p class="text-gray-700">{Number(ethers.utils.formatEther(item["val"])).toFixed(2)} UwU</p>
                  </div>
                  <div>
                    <p>{uwuContractNames[item["idx"]]}</p>
                  </div>
                </label>
              </div>
            ))}
          </div>
        )}
        {/* {active && (
          <div>
            {UwURewards.map((item, index) => (
              <div key={index} className="mb-2">
                <input className="mr-2" value={item["val"]} type="checkbox" onChange={handleCheck} />
                <span>{Number(ethers.utils.formatEther(item["val"])).toFixed(2)} UwU — {uwuContractNames[item["idx"]]}{uwuContractNames[item["idx"]].includes("OLD") ? <a className="text-green-500 hover:underline" href="https://medium.com/sifu-vision-news/sifuvision-token-migration-28b23a7ade9e"> How to migrate (Medium article) ↗</a> : <span></span>}</span>
              </div>
            ))}
          </div>
        )}<br /> */}
        <div class="h-32 inline rounded-lg bg-white flex flex-col place-content-center">
          {active && (
            <div class="mx-auto">
              <button className={`ml-10 inline py-2 px-4 ${sumChecked === 0 ? 'bg-cyan-400 cursor-not-allowed' : 'bg-cyan-500 hover:bg-cyan-400 text-white'} rounded sm:items-center text-center sm:justify-between`} onClick={claimUwU} disabled={sumChecked === 0}>
                Vest {Number(ethers.utils.formatEther(sumChecked)).toFixed(2)} UwU
              </button>
              {UwURewards.length !== 0 && (
                <p class="inline ml-10">Always claimable: {Number(ethers.utils.formatEther(baseRewards)).toFixed(2)} UwU</p>
              )}
            </div>
          )}
        </div>
      </div>
      {/* <footer class="flex absolute bottom-0 bg-purple-200">
        <p><a className="text-green-500 hover:underline" href="https://github.com/pbnather/uwulend-simple-ui">Github ↗</a>, copyright by <a className="text-green-500 hover:underline" href="https://twitter.com/pbnather">@pbnather</a> 2023</p>
      </footer> */}
      <footer class="flex absolute bottom-0 bg-purple-200">
        <div
          class="mt-8 grid grid-cols-2 gap-8 lg:mt-0 lg:grid-cols-5 lg:gap-y-16"
        >
          <div class="col-span-2">
            <div>
              <p><a className="text-green-500 hover:underline" href="https://github.com/pbnather/uwulend-simple-ui">Github ↗</a>, copyright by <a className="text-green-500 hover:underline" href="https://twitter.com/pbnather">@pbnather</a> 2023</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}