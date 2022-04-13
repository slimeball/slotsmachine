import { get, post } from "./axiosConfig";

const APIS = {
  // base information
  getBaseInformation() {
    return get('/api/acrivity/base');
  },
  // sound effect list
  getSoundEffect() {
    return get('/api/acrivity/fruitmachine/sound/effect', );
  },
  // bet ui configuration
  getConfig() {
    return get('/api/acrivity/config');
  },
  // user information
  getUserInfo() {
    return get('/api/acrivity/user/info');
  },
  // bet item position configuration
  getBetItemPosition() {
    return get('/api/acrivity/fruitmachine/location');
  },
  // run bet
  postRunBet(data) {
    return post('/api/acrivity/fruitmachine/bet', data);
  },
  // collect score
  postCollectScore(data) {
    return post('/api/acrivity/fruitmachine/earn/points', data);
  },
  // bet big or small
  postBetmm(data) {
    return post('/api/acrivity/fruitmachine/betmm', data);
  },
  // get bet history
  postGetBet(data) {
    return post('/api/acrivity/fruitmachine/get/bet', data);
  },
}

export default APIS;