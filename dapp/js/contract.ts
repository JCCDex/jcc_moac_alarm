import { smartContract as SmartContract, Moac, SolidityFunction } from "jcc-moac-utils";
import tpInfo from "./tp";
import tp from "tp-js-sdk";
import { isMainnet } from "./util";
const abi = require("@/abi/jcc-moac-alarm-abi");
const ethers = require("ethers");
const abiCoder = ethers.utils.defaultAbiCoder;

/**
 * hijacking `call` to return origin bytes so that we could decode it by ethers abi coder.
 * [origin code](https://github.com/MOACChain/chain3/blob/master/lib/chain3/function.js#L130)
 */
Object.defineProperty(SolidityFunction.prototype, "call", {
  get() {
    return function() {
      return new Promise((resolve, reject) => {
        const args = Array.prototype.slice.call(arguments).filter(function(a) {
          return a !== undefined;
        });
        const defaultBlock = this.extractDefaultBlock(args);
        const payload = this.toPayload(args);
        this._mc.call(payload, defaultBlock, function(error, output) {
          if (error) return reject(error);
          console.log("output: ", output);
          return resolve(output);
        });
      });
    };
  }
});

export class AlarmContract extends SmartContract {
  private _contractAddress: string;

  constructor(contractAddress: string) {
    super();
    this._contractAddress = contractAddress;
  }

  public initContract(moac: Moac) {
    super.init(this._contractAddress, moac, abi);
  }

  /**
   * deposit
   *
   * @param {string} amount
   * @param {string} address
   * @returns {Promise<string>}
   * @memberof AlarmContract
   */
  public async deposit(amount: string, address: String): Promise<string> {
    const bytes = await super.callABI("deposit", address);
    let hash: string;
    if (!tpInfo.isConnected()) {
      hash = await super.moac.sendTransactionWithCallData(process.env.MOAC_SECRET, process.env.CONTRACT, amount, bytes, { gasLimit: 170000 });
    } else {
      hash = await this.sendTransactionByTp(process.env.CONTRACT, amount, bytes, { gasLimit: 170000 });
    }
    return hash;
  }

  /**
   * request contract addr balance
   *
   * @param {string} address
   * @returns {Promise<string>}
   * @memberof AlarmContract
   */
  public async getContractBalance(address: string): Promise<string> {
    const abiItem = abi.find(item => item.name == "balance");
    const output = await super.callABI("balance", address);
    const decodeData = abiCoder.decode(abiItem.outputs, output);
    return super.moac.getChain3().fromSha(decodeData[0].toString(10));
  }

  /**
   * contract register
   *
   * @param {string} address
   * @returns {Promise<string>}
   * @memberof AlarmContract
   */
  public async contractRegister(address: String): Promise<string> {
    // const abiItem = abi.find(item => item.name == "addClient");
    // const output = await super.callABI("addClient", address);
    // const decodeData = abiCoder.decode(abiItem.outputs, output);
    // return decodeData[0];
    const bytes = await super.callABI("addClient", address);
    let hash: string;
    if (!tpInfo.isConnected()) {
      hash = await super.moac.sendTransactionWithCallData(process.env.MOAC_SECRET, process.env.CONTRACT, "0", bytes, { gasLimit: 96000 });
    } else {
      hash = await this.sendTransactionByTp(process.env.CONTRACT, "0", bytes, { gasLimit: 96000 });
    }
    return hash;
  }

  /**
   * send transaction by tokenpocket javascript sdk
   *
   * this app will be published to [TokenPocket](https://www.tokenpocket.pro/)
   *
   * @private
   * @param {string} contractAddr
   * @param {string} value
   * @param {string} calldata
   * @param {ITransactionOption} [options]
   * @returns {Promise<string>}
   * @memberof AlarmContract
   */
  private async sendTransactionByTp(contractAddr: string, value: string, calldata: string, options): Promise<string> {
    const sender = await tpInfo.getAddress();
    options = await super.moac.getOptions(options || {}, sender);
    const tx = super.moac.getTx(sender, contractAddr, options.nonce, options.gasLimit, options.gasPrice, value, calldata);

    let system = await tpInfo.getSystem();
    if (system === "ios") {
      // fixed value
      tx.value = super.moac.getChain3().toSha(value);

      // fixed gasLimit
      tx.gasLimit = options.gasLimit;
      // fixed gasPrice
      tx.gasPrice = options.gasPrice;
    }
    const res = await tp.signMoacTransaction(tx);
    if (res && res.result) {
      const hash = await super.moac.sendSignedTransaction(res.data);
      return hash;
    } else {
      throw new Error(res.msg);
    }
  }
}

const AlarmContractInstance = (() => {
  let inst: AlarmContract | null = null;

  const init = (node: string): AlarmContract => {
    if (inst === null) {
      const contractAddress = process.env.CONTRACT;
      const mainnet = isMainnet();
      const moac = new Moac(node, mainnet);
      moac.initChain3();
      inst = new AlarmContract(contractAddress);
      inst.initContract(moac);
    }

    return inst;
  };

  const destroy = () => {
    inst = null;
  };

  return {
    destroy,
    init
  };
})();

export default AlarmContractInstance;
