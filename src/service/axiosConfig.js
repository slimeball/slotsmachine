import axios from 'axios';
import apiAddress from './apiAddress';
axios.defaults.timeout = 500000;
axios.defaults.headers.common['Sign-Token'] = 'TpxKpHUgJJml5hFYVIhBEY7vMrmAZIYJGhE51uQ3Ad8O%2BT5kAkQ0M9yn2B3WJ%2F%2Badn%2B2jZnZydROkD2GkVnTHA%3D%3D'
const domain = apiAddress;

// TpxKpHUgJJml5hFYVIhBEcKHu%2Bf2y63RZ8x4xlm6DE8XwiBFXE7Xk7DUFg9ALYe4QfW82RyzWvWiDLrY28DpkA%3D%3D

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
