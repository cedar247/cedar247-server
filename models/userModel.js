require('dotenv').config()

const bcrypt = require('bcrypt');
const mongoose = require('mongoose')
const Schema = mongoose.Schema

//encription for the default password
let pswrd = bcrypt.hashSync(process.env.REACT_APP_DEFAULT_PASSWORD, 9);

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        default: pswrd
    },
    email: {
        type: String,
        validate: {
          //to check the email id is exits or not
          validator: async function(email) {
            const user = await this.constructor.findOne({ email });
            if(user) {
              if(this.id === user.id) {
                return true;
              }
              return false;
            }
            return true;
          },
          message: props => 'The specified email address is already in use.'
        },
        required: [true, 'User email required']
      },
    type: {
        type: String,
        required: true
    }

}, { timestamps: true })


module.exports = mongoose.model('User', userSchema)