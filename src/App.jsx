import './App.scss'
import './assets/css/Header.scss'
import './assets/css/Machine.scss'
import './assets/css/GameRule.scss'
import { useEffect, useState, useCallback } from 'react'
import APIS from './service/apis'
function App() {
  const INIT_BET_BTN_LIST = [
    { num: 0, serial_number: 0 }, { num: 0, serial_number: 0 }, { num: 0, serial_number: 0 }, { num: 0, serial_number: 0 }, { num: 0, serial_number: 0 }, { num: 0, serial_number: 0 }, { num: 0, serial_number: 0 }, { num: 0, serial_number: 0 }
  ];
  // declare state
  const [isShowRule, setIsShowRule] = useState(false);
  const [baseInformation, setBaseInformation] = useState({});
  const [soundEffect, setSoundEffect] = useState({});
  const [UIConfig, setUIConfig] = useState({});
  const [userInfo, setUserInfo] = useState({});
  const [betItemPosition, setBetItemPosition] = useState({});
  const [rewardScore, setRewardScore] = useState(0);
  const [ownedScore, setOwnedScore] = useState(0);
  const [bigorsmallNumber, setBigorsmallNumber] = useState(0);
  const [currentLightPosition, setLightPosition] = useState(0);
  const [startBtnStatue, setStartBtnStatue] = useState(true);
  const [betBtnList, setBetBtnList] = useState(INIT_BET_BTN_LIST);
  const [betBtnHitTimes, setBetBtnHitTimes] = useState(0);
  const [isRuned, setIsRuned] = useState(false);
  // bet and started lock, for rebet
  const [isBetLock, setIsBetLock] = useState(false);
  const [activeAuto, setActiveAuto] = useState(false);
  useEffect(() => {
    ajaxGetBaseInformation();
    ajaxGetSoundEffect();
    ajaxGetConfig();
    ajaxGetUserInfo();
  }, [])

  const ajaxGetBaseInformation = async () => {
    const res = await APIS.getBaseInformation();
    if (res.code == 200) {
      setBaseInformation(res.data)
    }
  }

  const ajaxGetSoundEffect = async () => {
    const res = await APIS.getSoundEffect();
    if (res.code == 200) {
      setSoundEffect(res.data)
    }
  }

  const ajaxGetConfig = async () => {
    const res = await APIS.getConfig();
    if (res.code == 200) {
      setUIConfig(res.data)
    }
  }

  const ajaxGetUserInfo = async () => {
    const res = await APIS.getUserInfo();
    if (res.code == 200) {
      setUserInfo(res.data);
      setOwnedScore(res.data.useItemUser[res.data.useItem[0].platform_key]);
      ajaxGetBetItemPosition(res.data.activityUserInfo.betInfo);
    }
  }

  const ajaxGetBetItemPosition = async (_betInfo) => {
    const res = await APIS.getBetItemPosition();
    if (res.code == 200) {
      setBetItemPosition(res.data.location);
      // rerender uncollect score
      if (Object.keys(_betInfo).length > 0) {
        for (let item in res.data.location) {
          if (res.data.location[item].id == _betInfo.fruit_id) {
            _betInfo.fruit_list.forEach(el => {
              if (res.data.location[item].serial_number == el.serial_number) {
                setRewardScore(el.num * res.data.location[item].double_num)
              }
            })
          }
        }
      }
    }
  }

  // swich rule
  const swichGameRuleFunc = () => {
    if (isShowRule) {
      setIsShowRule(false);
    } else {
      setIsShowRule(true);
    }
  }
  // collect score
  const ajaxPostCollectScore = async () => {
    let res = await APIS.postCollectScore({ betId: userInfo.activityUserInfo.betId });
    if (res.code == 200) {
      setOwnedScore(ownedScore + rewardScore);
      setRewardScore(0);
      // refresh base info
      let _userInfo = JSON.parse(JSON.stringify(userInfo))
      _userInfo.activityUserInfo.betInfo = [];
      setUserInfo(_userInfo);
    }
  }

  // begin request
  const ajaxPostRunBet = async (param, _isAuto) => {
    setIsBetLock(true);
    let currentIndex = currentLightPosition;
    let resultId;
    let _betResult;
    let _isWin;
    let timer = setInterval(() => {
      if (currentIndex == resultId) {
        setStartBtnStatue(true)
        setLightPosition(currentIndex)
        clearInterval(timer);

        // set uncollect score
        Object.keys(betItemPosition).forEach(key => {
          if (resultId == betItemPosition[key].id) {
            betBtnList.forEach(btnel => {
              if (betItemPosition[key].serial_number == btnel.serial_number) {
                setRewardScore(betItemPosition[key].double_num * btnel.num);
              }
            })
          }
        })
        return;
      }
      currentIndex++;
      if (currentIndex > 24) {
        currentIndex = 0;
      } else {
        setLightPosition(currentIndex);
      }
    }, 50)
    setStartBtnStatue(false);
    let res = await APIS.postRunBet(param);
    _betResult = res;
    if (res.code == 200) {
      // remember open
      setTimeout(() => {
        _isWin = res.data.isWin;
        setIsRuned(true);
        let _userInfo = JSON.parse(JSON.stringify(userInfo))
        _userInfo.activityUserInfo.betInfo = {};
        if (_isAuto) {
          // collectScoreFunc();
          // runBetFunc();
          _autoRunAgain(_isAuto);
        } else {
          if (_isWin == 1) {
            resultId = res.data.fruitInfo[0].id;
            // refresh base info
            _userInfo.activityUserInfo.betInfo.fruit_id = resultId;
            _userInfo.activityUserInfo.betId = res.data.winId;
            setUserInfo(_userInfo);
          }
        }
        // if auto active
      }, 1000);
    } else {
      setStartBtnStatue(true)
      setLightPosition(currentIndex)
      clearInterval(timer);
    }
  }
  // auto begin
  const runAutoFunc = () => {
    let _temp = !activeAuto;
    setActiveAuto(_temp);
    if (rewardScore > 0) {
      collectScoreFunc(true);
    } else {
      runBetFunc(_temp);
    }
  }
  // begin
  const runBetFunc = (_isAuto) => {
    // don't have uncollect score
    if (rewardScore == 0) {
      // don't have uncollect score
      if (Object.keys(userInfo.activityUserInfo.betInfo).length == 0) {
        let isSetedBet = false;
        let sendData = [];
        betBtnList.forEach(el => {
          if (el.num > 0) {
            isSetedBet = true;
            sendData.push(el);
          }
        })
        if (startBtnStatue && isSetedBet) {
          // send request
          if (isBetLock) {
            let newownscore = ownedScore - betBtnHitTimes;
            setOwnedScore(newownscore);
          }
          ajaxPostRunBet({ data: sendData }, _isAuto);
        }
      }
    } else {
      alert('you still have score uncollect')
    }
  }

  // hit bet item
  const betHitFunc = (index) => {
    if (rewardScore == 0) {
      let betCount = betBtnHitTimes + 1;
      setBetBtnHitTimes(betCount)
      if (ownedScore > 0 && ownedScore > betCount) {
        // reset bet numbers
        var betBtnListCopy = [];
        if (isRuned) {
          betBtnListCopy = JSON.parse(JSON.stringify(INIT_BET_BTN_LIST));
          setIsRuned(false);
          setBetBtnHitTimes(1);
          setIsBetLock(false);
        } else {
          betBtnListCopy = JSON.parse(JSON.stringify(betBtnList));
        }
        betBtnListCopy[index].num += 1;
        betBtnListCopy[index].serial_number = index + 1;
        let newownscore = ownedScore - 1;
        setOwnedScore(newownscore);
        setBetBtnList(betBtnListCopy);
      }
    }
  }
  // collect score
  const collectScoreFunc = () => {
    // have or not collect score
    if (Object.keys(userInfo.activityUserInfo.betInfo).length > 0) {
      ajaxPostCollectScore();
    }
  }

  // bet big or small 
  const ajaxPostBetmm = async (type) => {
    // mock random number 1-10
    let timer = setInterval(() => {
      let _resitemidx = Math.floor(Math.random() * 10) + 1;
      setBigorsmallNumber(_resitemidx)
    }, 50);
    const res = await APIS.postBetmm({
      betId: userInfo.activityUserInfo.betId,
      isMaxOrMin: type
    });
    if (res.code == 200) {
      setTimeout(() => {
        clearInterval(timer)
        if (res.data.isWin == 1) {
          let doublerewardScore = rewardScore * 2;
          setRewardScore(doublerewardScore);
          switch (type) {
            case 1:
              setBigorsmallNumber(Math.floor(Math.random() * 5) + 1);
              break;
            case 2:
              setBigorsmallNumber(Math.floor(Math.random() * 5) + 6);
              break;
          }
        } else {
          setRewardScore(0);
          // refresh base info
          let _userInfo = JSON.parse(JSON.stringify(userInfo))
          _userInfo.activityUserInfo.betInfo = [];
          setUserInfo(_userInfo);
        }
      }, 2000);
    }
  }
  const betSmallFunc = () => {
    // have uncollect score
    if (rewardScore > 0) {
      ajaxPostBetmm(1)
    }
  }

  const betBigFunc = () => {
    // have uncollect score
    if (rewardScore > 0) {
      ajaxPostBetmm(2)
    }
  }
  const _autoRunAgain = (_isAuto) => {
    let _autoTimeout = setTimeout(() => {
      clearTimeout(_autoTimeout);
      _autoTimeout = null;
    //   if (this._betBtnHitTimes > this.ownedScore) {
    //     this.$toast.show("余额不足");
    //     this.activeAuto = false;
    //     return;
    //   }
      if (_isAuto) {
        if (rewardScore > 0) {
          collectScoreFunc(true);
        } else {
          runBetFunc();
        }
      }
    }, 2000);
  }
  return (
    <div className="main">
      <header className="header">
        <span className="back-btn"></span>
        <span className="gametitle"></span>
        <span className="gamerule" onClick={swichGameRuleFunc}></span>
      </header>
      <main className="machine-main">
        <section className="score-container">
          <span className="score-item reward-score"><span className="score-text">{rewardScore}</span></span>
          <span className="score-item owned-score"><span className="score-text">{ownedScore}</span></span>
        </section>
        <section className="game-panel">
          <ul className="bet-list">
            {
              Object.keys(betItemPosition).map(keyindex => {
                return <li className={`bet-item${keyindex}` + ` ${keyindex == currentLightPosition ? 'light-on' : ''}`} style={{ backgroundImage: `url(${betItemPosition[keyindex].img})` }} key={keyindex}></li>
              })
            }
          </ul>
          <div className={'big-item-image'}>{
            Object.keys(betItemPosition).map(keyindex => {
              return <img className={`${currentLightPosition == keyindex ? '' : 'display-none'}`} src={betItemPosition[keyindex].maximg} key={keyindex} />
            })
          }</div>
          <div className="big-or-small"><span className="big-or-small-number">{bigorsmallNumber}</span><i className={`big-or-small-lighton ${bigorsmallNumber == 0 ? 'display-none' : bigorsmallNumber < 5 ? 'left' : 'right'}`}></i></div>
        </section>
        <section className="bet-active-buttons">
          <span className="button-circle small-button" onClick={betSmallFunc}></span>
          <span className="button-circle big-button" onClick={betBigFunc}></span>
          <span className="button-rectangle" onClick={collectScoreFunc}></span>
          <span className={`button-circle auto-button ${activeAuto ? 'auto-button-lock' : ''}`} onClick={runAutoFunc}></span>
          <span className="button-circle start-button" onClick={runBetFunc}></span>
        </section>
        <section className="number-of-bet">
          {
            betBtnList.map((el, index) => {
              return <span className="number-count-item" key={index}>{el.num}</span>
            })
          }
        </section>
        <section className="bet-buttons">
          {
            betBtnList.map((el, index) => {
              return <span className={'bet-button-item' + ' ' + `bet-button-item${index + 1}`} onClick={() => betHitFunc(index)} key={index}></span>
            })
          }
        </section>
      </main>
      {
        isShowRule ? (<section className="game-rule">
          <span className="close-game-rule" onClick={swichGameRuleFunc}></span>
        </section>) : ''
      }
    </div>
  )
}
export default App