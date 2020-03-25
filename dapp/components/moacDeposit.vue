<template>
  <div ref="scroll" flex class="scroll-wrapper" style="height: calc(100%-1.1rem);">
    <div flex-box="1" flex="dir:top cross: center">
      <div style="text-align:left;margin-top: 0.2rem;">
        {{ $t("moac_wallet") }}
      </div>
      <div style="word-break:break-all;text-align:left;margin-top:0.1rem;">
        {{ address }}
      </div>
      <van-field v-model="moacContractAddress" center type="text" :placeholder="$t('input_deposit_maoc_address')" style="margin-top: 0.3rem;" />
      <div flex="main:justify cross:center" class="jcc-moac-alarm-balance-text" style="margin-top: 0.3rem;">
        {{ $t("your_wallet_balance", { amount: isNaN(parseFloat(balance)) ? "--" : parseFloat(balance).toFixed(8), token: $t("moac") }) }}
      </div>
      <div flex="main:justify cross:center" class="jcc-moac-alarm-balance-text" style="margin-top: 0.3rem;">
        {{ $t("contract_address_balance", { amount: isNaN(parseFloat(contractAddrBalance)) ? "--" : parseFloat(contractAddrBalance).toFixed(8), token: $t("moac") }) }}
      </div>
      <van-field v-model="amount" center type="number" :placeholder="$t('input_deposit_amount')" style="margin-top: 0.3rem;" />
      <div v-show="showElement" flex-box="1" flex="cross:bottom" style="margin-top: 0.4rem;">
        <button :disabled="!depositEnable" class="jcc-moac-alarm-button jcc-moac-alarm-register-button" style="width:100%;" @click="show = true">
          {{ $t("deposit") }}
        </button>
      </div>

      <van-action-sheet v-model="show" :title="$t('deposit_action.title')">
        <p style="text-align:left;margin-top:0.45rem;margin-bottom:0.95rem">
          {{ $t("deposit_action.content", { amount, token: $t("moac") }) }}
        </p>
        <button class="jcc-moac-alarm-button jcc-moac-alarm-confirm-button" style="width:100%;" @click="depositConfirm">
          {{ $t("deposit_action.button") }}
        </button>
      </van-action-sheet>
    </div>
  </div>
</template>
<script>
import BigNumber from "bignumber.js";
import tpInfo from "@/js/tp";
import AlarmContractInstance from "@/js/contract";
import { Toast } from "vant";
import * as transaction from "@/js/transaction";
import { moacWallet } from "jcc_wallet";
import scrollIntoView from "@/mixins/scrollIntoView";
import keyEvent from "@/mixins/keyEvent";
export default {
  name: "Deposit",
  mixins: [scrollIntoView, keyEvent],
  props: {
    isAdmin: {
      type: Boolean
    }
  },
  data() {
    return {
      address: "",
      moacContractAddress: "",
      amount: "",
      balance: "",
      contractAddrBalance: "",
      show: false
    };
  },
  computed: {
    depositEnable() {
      const minGas = 0.1;
      const bn = new BigNumber(this.amount);
      // bn.modulo(1).toNumber() === 0
      return moacWallet.isValidAddress(this.moacContractAddress.trim()) && BigNumber.isBigNumber(bn) && bn.isGreaterThanOrEqualTo(0) && bn.plus(minGas).isLessThan(this.balance);
    },
    inputAddress() {
      return this.moacContractAddress;
    }
  },
  watch: {
    inputAddress(newVal) {
      const newMoacAddress = newVal.trim();
      if (!moacWallet.isValidAddress(newMoacAddress)) {
        this.contractAddrBalance = "--";
        return;
      }
      this.getContractBalance(newMoacAddress);
    }
  },
  mounted() {
    console.log("是否是管理员", this.isAdmin);
    this.getCurrentWallet();
    this.getBalance();
  },
  beforeDestroy() {
    AlarmContractInstance.destroy();
  },
  methods: {
    async getCurrentWallet() {
      this.address = await tpInfo.getAddress();
    },
    async getBalance() {
      try {
        const node = await tpInfo.getNode();
        const balance = await AlarmContractInstance.init(node).moac.getBalance(this.address);
        this.balance = balance;
      } catch (error) {
        console.log("reqeust moac balance error: ", error);
        this.balance = "0";
      }
    },
    async getContractBalance(newMoacAddress) {
      try {
        const node = await tpInfo.getNode();
        const instance = AlarmContractInstance.init(node);
        const balance = await instance.getContractBalance(newMoacAddress);
        this.contractAddrBalance = balance;
      } catch (error) {
        console.log("reqeust moac balance error: ", error);
        this.contractAddrBalance = "0";
      }
    },
    async depositConfirm() {
      this.show = false;
      try {
        const address = this.moacContractAddress;
        const node = await tpInfo.getNode();
        const instance = AlarmContractInstance.init(node);
        const hash = await instance.deposit(this.amount, address);
        console.log("deposit hash: ", hash);

        Toast.loading({
          duration: 0,
          forbidClick: true,
          loadingType: "spinner",
          message: this.$t("message.loading")
        });
        // confirm status by hash
        setTimeout(async () => {
          const res = await transaction.requestReceipt(hash);

          if (res) {
            if (transaction.isSuccessful(res)) {
              Toast.success(this.$t("message.submit_succeed"));
            } else {
              Toast.fail(this.$t("message.submit_failed"));
            }
          } else {
            Toast.fail(this.$t("message.request_receipt_failed"));
          }
        }, 20000);
      } catch (error) {
        console.log("deposit error: ", error);
        Toast.fail(error.message);
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.jcc-moac-alarm-balance-text {
  position: relative;
  display: inline-block;
  box-sizing: border-box;
  width: 100%;
  height: 0.8rem;
  margin: 0;
  padding: 0;
  line-height: 0.8rem;
  border-radius: 0.08rem;
  text-align: left;
  text-indent: 0.16rem;
  background-color: #eef1f5;
  color: #565e69;
  border: none;
  -webkit-appearance: none;
  -webkit-text-size-adjust: 100%;
}
</style>
