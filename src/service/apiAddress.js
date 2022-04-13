let apiaddress = 'dev.api';
switch(import.meta.env.MODE) {
  case 'uat':
    apiaddress = 'uat.api';
    break;
  case 'production':
    apiaddress = 'production.api';
    break;
}

export default apiaddress;