<template>
  <div class="jcc-moac-alarm-container">
    <div style="position: fixed; height: 100%; width: 100%; top: 0;">
      <div class="jcc-moac-alarm-tab-bar">
          <div class="jcc-moac-alarm-tabs jcc-moac-alarm-tabs-bottom">
            <div class="jcc-moac-alarm-tabs-content-wrap" style="touch-action: pan-x pan-y; position: relative; left: 0%;">     
               <div flex-box="1" flex="dir:top cross: center">
                   <div flex="main:center cross:center dir:top" v-if="admin" style="margin: 0.5rem 0.32rem 0 0.32rem;">
                     <div style="width:100%;">
                       <div @click="switchTab('contractRegister')" :class="{ active: isActive===0 }" class="jcc-moac-alarm-home-tabs jcc-moac-alarm-home-tabs-left" style="float: left;">{{ $t("contract_register") }}</div>
                       <div @click="switchTab('moacDeposit')" :class="{ active: isActive===1}" class="jcc-moac-alarm-home-tabs jcc-moac-alarm-home-tabs-right" style="float: right;">{{ $t("moac_deposit") }}</div>
                     </div>
                     <component style="width:100%;" :is="currentView" :isAdmin="admin"></component>
                   </div>
                    <div v-else flex="main:center cross:center dir:top" style="margin: 0.5rem 0.32rem 0 0.32rem;">
                    <div style="margin:0 auto;">{{ $t("moac_deposit") }}</div>
                    <moac-deposit :isAdmin="admin"></moac-deposit>
                    </div> 
              </div>
           </div>
        </div>
      </div>
     </div>
  </div>
</template>
<script>
import contractRegister from "@/components/contractRegister";
import moacDeposit from "@/components/moacDeposit";
export default {
  name: "Main",
  components: {
    contractRegister,
    moacDeposit
  },
  data() {
    return {
      currentView: contractRegister,
      isActive: 0,
      admin: true
    };
  },
  methods: {
    switchTab(currentView) {
      if (currentView === "contractRegister") {
        this.isActive = 0;
        this.currentView = contractRegister
      } else {
        this.isActive = 1;
        this.currentView = moacDeposit
      }
    }
  }
};
</script>
<style lang="scss">
.jcc-moac-alarm-home-tabs {
  width: 50%;
  text-align: center;
  padding-bottom: 0.1rem;
  border-bottom: 0.01rem solid #e7edf1;
  .jcc-moac-alarm-home-tabs-left {
    padding: 0 0.66rem 0 0.6rem;
  }
  .jcc-moac-alarm-home-tabs-right {
    padding: 0 0.6rem 0 0.67rem;
  }
  &.active {
    color: #4890f3;
    border-bottom: 0.01rem solid #4890f3;
  }
}
</style>
