<script setup>
import "./assets/css/normalize.css";
import "./assets/css/common.scss";
import "./assets/css/Header.scss";
import "./assets/css/Machine.scss";
import "./assets/css/GameRule.scss";
import APIS from "./service/apis";
import { ref, reactive } from "vue";

const INIT_BET_BTN_LIST = [
  { num: 0, serial_number: 0 },
  { num: 0, serial_number: 0 },
  { num: 0, serial_number: 0 },
  { num: 0, serial_number: 0 },
  { num: 0, serial_number: 0 },
  { num: 0, serial_number: 0 },
  { num: 0, serial_number: 0 },
  { num: 0, serial_number: 0 },
];
const isShowRule = ref(false);
const baseInformation = reactive({});
const soundEffect = reactive({});
const UIConfig = reactive({});
const userInfo = reactive({});
const betItemPosition = reactive({});
const rewardScore = ref(0);
const ownedScore = ref(0);
const bigorsmallNumber = ref(0);
</script>

<template>
  <div class="main">
    <header class="header">
      <span class="back-btn" @click="pagebackFunc"></span>
      <span class="gametitle"></span>
      <span class="gamerule" @click="swichGameRuleFunc"></span>
    </header>
    <main class="machine-main">
      <section class="score-container">
        <span class="score-item reward-score"
          ><span class="score-text">{{ rewardScore }}</span></span
        >
        <span class="score-item owned-score"
          ><span class="score-text">{{ ownedScore }}</span></span
        >
      </section>
      <section class="game-panel">
        <ul class="bet-list">
          <li
            :class="`bet-item${keyindex} ${
              keyindex == currentLightPosition ? 'light-on' : ''
            } ${
              keyindex == currentLightPosition - 1 && runningTimer
                ? 'light-on'
                : ''
            } ${
              keyindex == currentLightPosition - 2 && runningTimer
                ? 'light-on'
                : ''
            } ${
              keyindex == currentLightPosition - 3 && runningTimer
                ? 'light-on'
                : ''
            } ${winFruitList.includes(Number(keyindex)) ? 'light-on' : ''}`"
            :style="{ backgroundImage: `url(${item.img})` }"
            v-for="(item, keyindex) in betItemPosition"
            :key="keyindex"
          ></li>
        </ul>
        <div class="big-item-image">
          <img
            :class="{ 'display-none': currentLightPosition != index }"
            v-for="(item, index) in betItemPosition"
            :src="item.maximg"
            :key="index"
          />
        </div>
        <div class="big-or-small">
          <span class="big-or-small-number">{{
            bigorsmallNumber == 0 ? "" : bigorsmallNumber
          }}</span
          ><i
            class="big-or-small-lighton"
            :class="{
              'display-none': bigorsmallNumber == 0,
              left: bigorsmallNumber <= 7,
              right: bigorsmallNumber > 7,
            }"
          ></i>
        </div>
      </section>
      <section class="bet-active-buttons">
        <span class="button-circle reset-button" @click="resetbetBtnCountFunc"></span>
        <span
          class="button-circle small-button" :class="{'btn-on' :isBigorsmallBtnSwitch}"
          @click="bigorsmallFunc(1)"
        ></span>
        <span
          class="button-circle big-button" :class="{'btn-on' :isBigorsmallBtnSwitch}"
          @click="bigorsmallFunc(2)"
        ></span>
        <span class="button-rectangle" @click="collectScoreFunc"></span>
        <span
          class="button-circle auto-button"
          :class="{ 'auto-button-lock': activeAuto }"
          @click="runAutoFunc"
        ></span>
        <span class="button-circle start-button" @click="runBetFunc"></span>
      </section>
      <section class="number-of-bet">
        <span
          class="number-count-item"
          v-for="(item, index) in betBtnList"
          :key="index"
          >{{ item.num }}</span
        >
      </section>
      <section class="bet-buttons">
        <span
          class="bet-button-item"
          :class="`bet-button-item${index + 1}`"
          @touchstart="betHitFunc(index)"
          @touchend="cancelLongTouchFunc()"
          v-for="(item, index) in betBtnList"
          :key="index"
        ></span>
      </section>
    </main>
    <section class="game-rule" v-show="isShowRule">
      <div class="game-rule-pop">
        <div class="game-rule-text-box">
          <article class="game-rule-article">
            <div class="game-rule-text">
              {{ baseInformation.rule }}
            </div>
          </article>
        </div>
        <span class="close-game-rule" @click="swichGameRuleFunc"></span>
      </div>
    </section>
  </div>
</template>
<style lang="scss">
#app {
  height: 100vh;
  background-image: url(./assets/images/bottom-base.png);
  background-size: 100%;
  background-repeat: repeat-y;
}
.main {
  background-image: url(./assets/images/main-bg.png);
  background-size: 100%;
  background-repeat: no-repeat;
}
</style>
