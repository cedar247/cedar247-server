const bcrypt = require('bcrypt');
require('dotenv').config()


pwd = process.env.REACT_APP_DEFAULT_PASSWORD
console.log(pwd);
let pswrd = bcrypt.hashSync(pwd, 9);
console.log(bcrypt.compareSync('123456', pswrd));
console.log(pswrd);