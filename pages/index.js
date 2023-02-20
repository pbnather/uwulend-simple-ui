
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
  "0xEc12f63116bD2493104a26FbDBCd70f51ab7B2C1"
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
  "uSIFU (deposit)",
  "uSIFU (borrow)",
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
  "uBLUSD (borrow)"
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
        indexed.push({ idx: i, val: r });
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

  return (
    <div style={{ "padding": 10 }}>
      <h1>UwU Lend vesting UI</h1>
      <p>This UI allows you to vest UwU rewards from specific deposits/borrows which greatly reduces gas fees.</p>
      <div className="flex flex-col items-center justify-center">
        {!active ? <button style={{ "margin-right": 10 }} onClick={connect}>Connect to MetaMask</button> : <span></span>}
        {!active ? <button style={{ "margin-right": 10 }} onClick={connectWalletConnect}> Connect to WalletConnect </button> : <span></span>}
        {active ? <span>Connected with <b>{account} </b></span> : <span></span>}
        {active ? <span><button onClick={disconnect}>Disconnect</button> <button onClick={updateTokenState}> Refresh state </button></span> : <span></span>}
        <br /><br />
        {active ? <div>
          {UwURewards.map((item, index) => (
            <div key={index}>
              <input value={item["val"]} type="checkbox" onChange={handleCheck} />
              <span>{Number(ethers.utils.formatEther(item["val"])).toFixed(2)}{"\t"}UwU{"\t"} — {uwuContractNames[item["idx"]]}</span>
            </div>
          ))}
        </div> : <span></span>}<br />
        {active ? <span><button disabled={sumChecked == 0} onClick={claimUwU}>Vest {Number(ethers.utils.formatEther(sumChecked)).toFixed(2)} UwU</button></span> : <span></span>}
        <br /><br />
        <p><a color="green" href="https://github.com/pbnather/uwulend-simple-ui">Github ↗</a>, copyright by <a color="green" href="https://twitter.com/pbnather">@pbnather</a> 2023</p>
      </div>
    </div >
  )
}