import axios from 'axios';
import apiAddress from './apiAddress';
import UTILS from '../assets/js/utils';
axios.defaults.timeout = 500000;
axios.defaults.headers.common['Sign-Token'] = encodeURIComponent(UTILS.getUrlKey('token'));
const domain = apiAddress;

export function get(url, params = {}, header = {}, prefix = true) {
  return new Promise((resolve, reject) => {
    axios.get(prefix ? `${domain}${url}` : `${url}`, {
      params: params
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(err => {
        reject(err)
      })
  })
}

export function post(url, data, header = {}) {
  return new Promise((resolve, reject) => {
    axios.post(`${domain}${url}`, data,
      {
        headers: header
      }).then(response => {
        resolve(response.data);
      }, err => {
        reject(err)
      })
  })
}
