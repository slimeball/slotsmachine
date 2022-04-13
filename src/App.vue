<template>
  <div class="main">
    <header class="header">
      <span class="back-btn" @click="pagebackFunc"></span>
      <span class="gametitle"></span>
      <span class="gamerule" @click="swichGameRuleFunc"></span>
    </header>
    <main class="machine-main">
      <section class="score-container">
        <div class="score-item reward-score">
          <span class="score-text">{{ rewardScore }}</span>
        </div>
        <div class="score-item owned-score">
          <span class="score-text">{{ ownedScore }}</span>
        </div>
      </section>
      <section class="game-panel">
        <ul class="bet-list">
          <li
            :class="`bet-item${keyindex}${
              keyindex == currentLightPosition &&
              (_lucktimeout || _lucktimer)
                ? ' light-on'
                : ''
            }${
              keyindex == currentLightPosition - 1 && runningTimer
                ? ' light-on'
                : ''
            }${
              keyindex == currentLightPosition - 2 && runningTimer
                ? ' light-on'
                : ''
            }${
              keyindex == currentLightPosition - 3 && runningTimer
                ? ' light-on'
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
        <span
          class="button-circle reset-button"
          :class="{ 'auto-launching-lock': activeAuto }"
          @click="resetbetBtnCountFunc"
        ></span>
        <span
          class="button-circle small-button"
          :class="{
            'btn-on': isBigorsmallBtnSwitch,
            'auto-launching-lock': activeAuto,
          }"
          @click="bigorsmallFunc(1)"
        ></span>
        <span
          class="button-circle big-button"
          :class="{
            'btn-on': isBigorsmallBtnSwitch,
            'auto-launching-lock': activeAuto,
          }"
          @click="bigorsmallFunc(2)"
        ></span>
        <span
          class="button-rectangle"
          :class="{ 'auto-launching-lock': activeAuto, 'btn-on': isBigorsmallBtnSwitch }"
          @click="collectScoreFunc"
        ></span>
        <span
          class="button-circle auto-button"
          :class="{ 'auto-button-lock': activeAuto }"
          @click="runAutoFunc"
        ></span>
        <span
          class="button-circle start-button"
          :class="{
            'btn-on': _switchStartBtn,
            'auto-launching-lock': activeAuto,
          }"
          @click="runBetFunc"
        ></span>
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
          @touchend="cancelLongTouchFunc"
          @touchmove="cancelLongTouchFunc"
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
<script>
// 音效evnet-> source
// 1: "得分",
// 2: "开始",
// 3: "自动",
// 4: "大小",
// 5: "押注",
// 6: "跑灯",
// 7: "大小跳数字",
// 8: "中奖常规小于100分",
// 9: "中奖等于100分",
import "./assets/css/normalize.css";
import "./assets/css/common.scss";
import "./assets/css/Header.scss";
import "./assets/css/Machine.scss";
import "./assets/css/GameRule.scss";
import APIS from "./service/apis";
import NATIVEFUNC from "./assets/js/nativeFunc";
export default {
  name: "mainpage",
  data() {
    return {
      // _开头为非模板绑定数据
      _INIT_BET_BTN_LIST: [
        { num: 0, serial_number: 0 },
        { num: 0, serial_number: 0 },
        { num: 0, serial_number: 0 },
        { num: 0, serial_number: 0 },
        { num: 0, serial_number: 0 },
        { num: 0, serial_number: 0 },
        { num: 0, serial_number: 0 },
        { num: 0, serial_number: 0 },
      ], // 固定初始化下注按钮数据
      _AUDIO_EVENT_LIST: {}, // 音频对象列表
      _betBtnHitTimes: 0, // 下注总次数
      _isRuned: false, // 是否已经开始 用于再下注重置下注数字
      _isBetLock: false, // 自动开启中 下注锁定 用于下次开始减去分数
      _autoTimeout: null, // 自动 再次开启的间隔
      _bigorsmallTimer: null, // 押大小跳动数字
      _bigorsmallBtnTimer: null, // 押大按钮闪动
      _longtouchTimerArr: [], // 兼容多个手指按下定时器在跑，定时器对象丢失问题
      _lucktimer: null, // 正在结算luck
      _lucktimeout: null, // 开始luck结算间隔
      _betSendData: [], // 下注发送ajax数据
      _isbigorsmallRunning: false, // 押大小是否正在跑，用于锁定其他按键
      _switchStartBtn: false, // 已押分 开始按钮闪动
      _haveBetTimesTimer: false, // 有押注分数开始按钮闪动
      _startBtnStatue: true, // 是否已经开始，用来激活自动时判断
      isShowRule: false, // 是否显示规则弹窗
      baseInformation: {}, // ajax
      UIConfig: {}, // ajax
      userInfo: {}, // ajax
      betItemPosition: {}, // 水果位置列表
      rewardScore: 0, // 中奖分
      ownedScore: 0, // 剩余分
      bigorsmallNumber: 0, // 押大小的数字
      isBigorsmallBtnSwitch: false, // false不闪
      currentLightPosition: 0, // 当前滚动到的水果位置
      winFruitList: [], // ajax开始后获取结果的水果
      betBtnList: [
        { num: 0, serial_number: 0 },
        { num: 0, serial_number: 0 },
        { num: 0, serial_number: 0 },
        { num: 0, serial_number: 0 },
        { num: 0, serial_number: 0 },
        { num: 0, serial_number: 0 },
        { num: 0, serial_number: 0 },
        { num: 0, serial_number: 0 },
      ], // 可变的下注按钮数据
      activeAuto: false, // 自动是否激活中
      runningTimer: null, // 开始的滚动是否正在进行
    };
  },
  computed: {
    isAvableToUse() {
      return (
        this._bigorsmallTimer ||
        this.runningTimer ||
        this.activeAuto ||
        this._lucktimeout ||
        this._lucktimer
      );
    },
  },
  created() {
    // 禁用浏览器长按弹出菜单
    window.addEventListener("contextmenu", function (e) {
      e.preventDefault();
    });
    // 暴露原生关闭音频方法
    window.H5stopAudio = () => {
      this.AudioStopFunc();
    };
    this.ajaxGetBaseInformation();
    this.ajaxGetSoundEffect();
    this.ajaxGetConfig();
    this.ajaxGetUserInfo();
  },
  methods: {
    // 开始大小按钮和收分闪动
    _setBigorsmallBtnTimer() {
      this.isBigorsmallBtnSwitch = true;
      this._bigorsmallBtnTimer = setInterval(() => {
        this.isBigorsmallBtnSwitch = !this.isBigorsmallBtnSwitch;
      }, 100);
    },
    // 重制大小按钮和收分闪动
    _clearBigorsmallBtnTimer() {
      clearInterval(this._bigorsmallBtnTimer);
      this._bigorsmallBtnTimer = null;
      this.isBigorsmallBtnSwitch = false;
    },
    // 重置开始按钮闪动
    _clearStartBtnTimer() {
      clearInterval(this._haveBetTimesTimer);
      this._haveBetTimesTimer = null;
      this._switchStartBtn = false;
    },
    // 开始按钮闪动
    _runStartBtnTimer() {
      if (!this._haveBetTimesTimer) {
        this._switchStartBtn = true;
        this._haveBetTimesTimer = setInterval(() => {
          this._switchStartBtn = !this._switchStartBtn;
        }, 100);
      }
    },
    async ajaxGetBaseInformation() {
      const res = await APIS.getBaseInformation();
      if (res.code == 200) {
        this.baseInformation = res.data;
      }
    },
    async ajaxGetSoundEffect() {
      const res = await APIS.getSoundEffect();
      if (res.code == 200) {
        res.data.forEach((el) => {
          this._AUDIO_EVENT_LIST["audio" + el.event] = new Audio(el.url);
        });
      }
    },
    async ajaxGetConfig() {
      const res = await APIS.getConfig();
      if (res.code == 200) {
        this.UIConfig = res.data;
      }
    },
    async ajaxGetUserInfo() {
      const res = await APIS.getUserInfo();
      if (res.code == 200) {
        this.userInfo = res.data;
        this.ownedScore =
          res.data.useItemUser[res.data.useItem[0].platform_key];
        let betInfo = res.data.activityUserInfo.betInfo;
        this.ajaxGetBetItemPosition(betInfo);
        if (Object.keys(betInfo).length > 0) {
          this.rewardScore = betInfo.numbers;
          this.ajaxPostCollectScore();
        }
      }
    },
    async ajaxGetBetItemPosition(_betInfo) {
      const res = await APIS.getBetItemPosition();
      if (res.code == 200) {
        this.betItemPosition = res.data.location;
        // 重新渲染已下注项
        if (Object.keys(_betInfo).length > 0) {
          for (let item in res.data.location) {
            if (res.data.location[item].id == _betInfo.fruit_id) {
              _betInfo.fruit_list.forEach((el) => {
                if (res.data.location[item].serial_number == el.serial_number) {
                  // init btn number
                  this.betBtnList.forEach((btn, index) => {
                    if (el.serial_number == index + 1) {
                      this.betBtnList[index].num = el.num;
                      this.betBtnList[index].serial_number = el.serial_number;
                      this._betBtnHitTimes = el.num;
                    }
                  });
                }
              });
            }
          }
        }
      }
    },
    // 收分请求
    // isauto true 如果已开启自动 则再次开始
    // isbackPaging true 如果点击返回，收分后返回
    async ajaxPostCollectScore(isauto, isbackPaging) {
      let res = await APIS.postCollectScore({
        betId: this.userInfo.activityUserInfo.betId,
      });
      if (res.code == 200) {
        this.AudioPlayFunc("audio1");
        clearInterval(this._bigorsmallTimer);
        this._bigorsmallTimer = null;
        this._clearBigorsmallBtnTimer();
        this._clearStartBtnTimer();
        this.bigorsmallNumber = 0;
        this.ownedScore = Number(this.ownedScore) + Number(this.rewardScore);
        this.rewardScore = 0;
        // 重制用户信息数据
        this.userInfo.activityUserInfo.betInfo = [];
        this.winFruitList = [];
        // 在没有传参数的时候默认第一个参数是事件对象，所以需要用布尔比对
        if (isauto == true) {
          this.runBetFunc();
        } else {
          if (this._betBtnHitTimes > 0) {
            this._runStartBtnTimer();
          }
        }
        // 当点击返回，收分后离开页面
        if (isbackPaging) {
          NATIVEFUNC.closeApp();
        }
      }
    },
    // 开始请求
    async ajaxPostRunBet(param) {
      let _betResult;
      this._isBetLock = true;
      let _rewardPos;
      let _currentIndex = this.currentLightPosition;
      let _isWin;
      let _tempWinLocationList = [];
      this.winFruitList = [];
      this.runningTimer = setInterval(() => {
        if (_currentIndex == _rewardPos) {
          this._startBtnStatue = true;
          this.currentLightPosition = _currentIndex;
          clearInterval(this.runningTimer);
          this.runningTimer = null;
          this.AudioStopFunc();
          if (_betResult.data.numbers) {
            if (_betResult.data.numbers <= 100) {
              this.AudioPlayFunc("audio8");
            } else {
              this.AudioPlayFunc("audio9");
            }
          }

          // 是中了luck的时候
          if (Object.keys(_betResult.data.trainInfo).length > 0) {
            let _sortWinList = _tempWinLocationList.sort(function (a, b) {
              return a - b;
            });
            let _roundNumbers = 0;
            // 中luck _lucktimeout启动的时候显示，_lucktimeout，_lucktimer 都清掉的时候不显示
            this._lucktimeout = setTimeout(() => {
              this._lucktimer = setInterval(() => {
                clearTimeout(this._lucktimeout);
                this._lucktimeout = null;
                // 反向滚动
                _currentIndex--;
                if (_currentIndex < 1) {
                  _currentIndex = 24;
                }
                this.currentLightPosition = _currentIndex;
                // 需要分次滚动圈数 水果列表等于显示列表 并且 当前位置等于已中位置
                if (
                  _sortWinList.length == this.winFruitList.length &&
                  this.currentLightPosition == _rewardPos
                ) {
                  clearInterval(this._lucktimer);
                  this._lucktimer = null;
                  this.rewardScore = _betResult.data.numbers
                    ? _betResult.data.numbers
                    : 0;
                  if (this.activeAuto) {
                    this._autoRunAgain();
                  } else {
                    this._setBigorsmallBtnTimer();
                  }
                  return;
                }

                // 当前滚动的位置对比一次中奖位置为一圈
                if (_currentIndex == _sortWinList[_roundNumbers]) {
                  this.winFruitList.push(_sortWinList[_roundNumbers]);
                  _roundNumbers++;
                }
              }, 50);
            }, 1000);
          } else {
            this.winFruitList = _tempWinLocationList;
            // 设置未收分数，没有这个对象设0
            this.rewardScore = _betResult.data.numbers
              ? _betResult.data.numbers
              : 0;
            // if auto active
            if (this.activeAuto) {
              this._autoRunAgain();
            } else {
              if (_isWin == 1) {
                this._setBigorsmallBtnTimer();
              } else {
                if (this._betBtnHitTimes > 0) {
                  this._runStartBtnTimer();
                }
              }
            }
          }
          return;
        }
        _currentIndex++;
        if (_currentIndex > 24) {
          _currentIndex = 0;
        }
        this.currentLightPosition = _currentIndex;
      }, 50);
      this._startBtnStatue = false;
      let res = await APIS.postRunBet({ data: param });
      _betResult = res;
      if (res.code == 200) {
        this.AudioPlayFunc("audio6");
        this._AUDIO_EVENT_LIST["audio6"].loop = true;
        setTimeout(() => {
          this._isRuned = true;
          _isWin = res.data.isWin;
          this.userInfo.activityUserInfo.betInfo = {};

          if (_isWin == 1) {
            this.userInfo.activityUserInfo.betInfo.fruit_id =
              res.data.fruitInfo[0].id;
            this.userInfo.activityUserInfo.betId = res.data.winId;
          }
          // 操作用户信息对象，用来匹配是不是中了
          if (Object.keys(_betResult.data.trainInfo).length > 0) {
            _rewardPos = _betResult.data.trainInfo.location;
          } else {
            _rewardPos = _betResult.data.fruitInfo[0].location;
          }
          res.data.fruitInfo.forEach((el) => {
            _tempWinLocationList.push(el.location);
          });
        }, 5000);
      } else {
        this._startBtnStatue = true;
        this.currentLightPosition = _currentIndex;
        clearInterval(this.runningTimer);
        this.runningTimer = null;
      }
    },
    // 自动开始点击
    runAutoFunc() {
      if (this._betBtnHitTimes == 0) return this.$toast.show("请先下注");
      this.activeAuto = !this.activeAuto;
      if (this.activeAuto) {
        this.AudioPlayFunc("audio3");
        this._clearStartBtnTimer();
        if (this.rewardScore > 0) {
          this.collectScoreFunc(true);
        } else {
          this.runBetFunc();
        }
      }
    },
    // 开始点击
    runBetFunc() {
      // 没有未收分
      if (this.rewardScore == 0) {
        if (Object.keys(this.userInfo.activityUserInfo.betInfo).length == 0) {
          let isSetedBet = false;
          this._betSendData = [];
          this.betBtnList.forEach((el) => {
            if (el.num > 0) {
              isSetedBet = true;
              this._betSendData.push(el);
            }
          });
          if (!this._startBtnStatue) {
            if (this.activeAuto) {
              this.$toast.show("下轮开始自动");
            } else {
              this.$toast.show("请等待结果");
            }
            return;
          }
          if (isSetedBet) {
            if (this._isBetLock) {
              if (this._betBtnHitTimes > this.ownedScore) {
                this.$toast.show("余额不足");
                this.activeAuto = false;
                return;
              }
              this.ownedScore = this.ownedScore - this._betBtnHitTimes;
            }
            this.AudioPlayFunc("audio2");
            this._clearStartBtnTimer();
            this.ajaxPostRunBet(this._betSendData);
          } else {
            this.$toast.show("请先下注");
          }
        } else {
          this.$toast.show("请先收分或押注大小");
        }
      } else {
        this.$toast.show("请先收分或押注大小");
      }
    },
    // 点击下注项，包括长按
    betHitFunc(index) {
      if (this.isAvableToUse) return;
      if (this.rewardScore == 0) {
        if (this.ownedScore > 0) {
          // 已开始过，再点击重制数字
          if (this._isRuned) {
            this.betBtnList = JSON.parse(
              JSON.stringify(this._INIT_BET_BTN_LIST)
            );
            this._isRuned = false;
            this._betBtnHitTimes = 0;
            this._isBetLock = false;
          }
          if (this.betBtnList[index].num < 999) {
            let _addnumbers = this.userInfo.useItem[0].useNumbers;
            if (this.ownedScore - _addnumbers >= 0) {
              if (this.betBtnList[index].num + _addnumbers <= 999) {
                this._betBtnHitTimes += _addnumbers;

                this.betBtnList[index].num += _addnumbers;
                this.betBtnList[index].serial_number = index + 1;
                this.ownedScore = this.ownedScore - _addnumbers;
                this.AudioStopFunc();
                this.AudioPlayFunc("audio5");
                this._runStartBtnTimer();
                let _longtouchTimer = setInterval(() => {
                  if (this.betBtnList[index].num < 999) {
                    if (this.ownedScore - _addnumbers >= 0) {
                      if (this.betBtnList[index].num + _addnumbers <= 999) {
                        this._betBtnHitTimes += _addnumbers;
                        this.betBtnList[index].num += _addnumbers;
                        this.ownedScore = this.ownedScore - _addnumbers;
                      } else {
                        this.$toast.show("下注最高为999");
                      }
                    } else {
                      this.$toast.show("余额不足");
                    }
                  } else {
                    this.$toast.show("下注最高为999");
                  }
                }, 50);
                this._longtouchTimerArr.push(_longtouchTimer);
              } else {
                this.$toast.show("下注最高为999");
              }
            } else {
              this.$toast.show("余额不足");
            }
          } else {
            this.$toast.show("下注最高为999");
          }
        } else {
          this.$toast.show("余额不足");
        }
      } else {
        this.$toast.show("请先收分或押注大小");
      }
    },
    // 下注项取消长按时候
    cancelLongTouchFunc() {
      if (this._longtouchTimerArr.length > 0) {
        this._longtouchTimerArr.forEach((el) => {
          clearInterval(el);
          el = null;
        });
        this._longtouchTimerArr = [];
      }
    },
    // 收分点击
    collectScoreFunc(isauto) {
      if (this.runningTimer || this._autoTimeout) return;
      // 是否有未收分
      if (Object.keys(this.userInfo.activityUserInfo.betInfo).length > 0) {
        // this.AudioSpecificStopFunc('audio6');
        this.AudioStopFunc();
        this.ajaxPostCollectScore(isauto);
      }
    },
    // 押大小的动画
    bigorsmallRandom() {
      this.AudioPlayFunc("audio7");
      this._AUDIO_EVENT_LIST["audio7"].loop = true;
      this._bigorsmallTimer = setInterval(() => {
        let _resitemidx = Math.floor(Math.random() * 14) + 1;
        this.bigorsmallNumber = _resitemidx;
      }, 50);
    },
    // 押大小请求
    async ajaxPostBetmm(type) {
      this.bigorsmallRandom();
      const res = await APIS.postBetmm({
        betId: this.userInfo.activityUserInfo.betId,
        isMaxOrMin: type,
      });
      if (res.code == 200) {
        setTimeout(() => {
        this.AudioStopFunc();
          clearInterval(this._bigorsmallTimer);
          this._bigorsmallTimer = null;
          this.bigorsmallNumber = res.data.val;
          if (res.data.isWin == 1) {
            this.rewardScore = res.data.numbers;
            this.AudioPlayFunc("audio1");
            this._isbigorsmallRunning = false;
          } else {
            this.rewardScore = 0;
            this._clearBigorsmallBtnTimer();
            if (this._betBtnHitTimes > 0) {
              this._runStartBtnTimer();
            }
            // 重制用户信息
            this.userInfo.activityUserInfo.betInfo = [];
            this._isbigorsmallRunning = false;
          }
        }, 2000);
      }
    },
    // 押大小点击
    bigorsmallFunc(type) {
      if (this._isbigorsmallRunning || this.runningTimer || this.activeAuto)
        return;
      if (this.rewardScore > 0) {
        if (!this._bigorsmallTimer) {
          this.AudioPlayFunc("audio4");
          this.ajaxPostBetmm(type);
          if (this._bigorsmallTimer) {
            this._isbigorsmallRunning = true;
          }
        }
      } else {
        this.$toast.show("请先下注并中奖");
      }
    },
    // 重置 清空投注
    resetbetBtnCountFunc() {
      if (this.isAvableToUse) return;
      this._clearStartBtnTimer();
      this.betBtnList = JSON.parse(JSON.stringify(this._INIT_BET_BTN_LIST));
      if(!this._isRuned) {
        this.ownedScore = this.ownedScore + this._betBtnHitTimes;
      }
      this._betBtnHitTimes = 0;
    },
    // 页面返回 原生方法
    pagebackFunc() {
      if (this.rewardScore > 0) {
        this.$toast.info("正在为您收分，收分后退出");
        this.ajaxPostCollectScore(false, true);
      } else {
        NATIVEFUNC.closeApp();
      }
    },
    // 切换游戏规则弹窗
    swichGameRuleFunc() {
      this.isShowRule = !this.isShowRule;
    },
    // 播放音频
    AudioPlayFunc(type) {
      let _auobj = this._AUDIO_EVENT_LIST[type];
      if (_auobj) {
        _auobj.play();
      }
    },
    // 停止指定音频
    AudioSpecificStopFunc(type) {
      let _auobj = this._AUDIO_EVENT_LIST[type];
      if (_auobj) {
        _auobj.pause();
        _auobj.currentTime = 0;
      }
    },
    // 停止全部音频
    AudioStopFunc() {
      for (let exportaudio in this._AUDIO_EVENT_LIST) {
        this._AUDIO_EVENT_LIST[exportaudio].pause();
        this._AUDIO_EVENT_LIST[exportaudio].currentTime = 0;
      }
    },
    // 结算后，自动激活状态再次开始
    _autoRunAgain() {
      this._autoTimeout = setTimeout(() => {
        clearTimeout(this._autoTimeout);
        this._autoTimeout = null;
        if (this._betBtnHitTimes > this.ownedScore) {
          this.$toast.show("余额不足");
          this.activeAuto = false;
          return;
        }
        if (this.activeAuto) {
          if (this.rewardScore > 0) {
            this.collectScoreFunc(true);
          } else {
            this.runBetFunc();
          }
        }
      }, 2000);
    },
  },
};
</script>
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
