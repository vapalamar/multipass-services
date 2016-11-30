const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('./../config');

class AuthService {
	encrypt(text) {
		const cipher = crypto.createCipher(config.crypt.algorithm, config.crypt.pass);
		const encrypted = cipher.update(text, 'utf-8', 'hex') + cipher.final('hex');

		return encrypted;
	}

	decrypt(text){
		const decipher = crypto.createDecipher(config.crypt.algorithm, config.crypt.pass);
		const dec = decipher.update(text, 'hex', 'utf8') + decipher.final('utf8');

		return dec;
	}

	getToken(user, options = {}) {
		return jwt.sign(user, config.secret, options);
	}

	verifyToken(token, callback) {
		jwt.verify(token, config.secret, callback);
	}
}

module.exports = new AuthService();