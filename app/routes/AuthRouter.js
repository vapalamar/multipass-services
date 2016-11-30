const express = require('express');
const request = require('request');

const AuthService = require('./../services/AuthService');
const config = require('./../config');

const EXPIRATION_TIME = "1 day";

class AuthRouter {
  constructor() {
    this.router = express.Router();
    this.init();
  }

	verify(req, res, next) {
    const url = `${config.api.users}/${req.body.email}`;
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
		request.get(url, (err, resBody, response) => {
      if (err) {
        res.send({
          ok: false,
          reason: err
        });
      } else if (resBody) {
				const user = JSON.parse(resBody.body);

        if (AuthService.decrypt(user.pass) !== req.body.pass) {
          res.send({
            ok: false,
            reason: 'Authentication failed. Wrong password or email.'
          });

          return;
        }

        const tokenData = {
        	email: user.email,
	        pass: user.pass
        };
        const token = AuthService.getToken(tokenData, {
          expiresIn: EXPIRATION_TIME
        });

        res.send({
	        ok: true,
	        user: user,
	        token: token
        });

      } else {
	      res.send({
	        ok: false,
          reason: 'Authentication failed. User not found.'
	      });
      }
    });
  }

  create(req, res, next) {
		req.body.pass = AuthService.encrypt(req.body.pass);
	  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
		request.post(config.api.users, { body: req.body, json: true }, (err, resBody, response) => {
			if (err) {
				res.send({
					ok: false,
					reason: err
				});
			} else if (resBody) {
				const tokenData = {
					email: req.body.email,
					pass: req.body.pass
				};
				const token = AuthService.getToken(tokenData, {
					expiresIn: EXPIRATION_TIME
				});

				res.send({
					ok: true,
					token: token
				});
			}
		});
  }

  init() {
    this.router.post('/login', this.verify);
    this.router.post('/signup', this.create);

  }
}

module.exports = new AuthRouter().router;