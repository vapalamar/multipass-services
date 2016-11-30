const express = require('express');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const AuthRouter = require('./routes/AuthRouter');
const AuthService = require('./services/AuthService')

class App {
  constructor() {
    this.express = express();
    this._middleware();
    this._routes();
    this._errors();
  }

  _middleware() {
	  this.express.use(logger('dev'));
	  this.express.use(bodyParser.json());
	  this.express.use(bodyParser.urlencoded({ extended: true }));
	  this.express.use(cookieParser());
  }

  _routes() {
	  this.express.use('/services/auth/', AuthRouter);

	  this.express.use((req, res, next) => {
		  const token = req.body.token || req.query.token || req.headers['x-access-token'];

		  if (token) {
			  AuthService.verifyToken(token, (err, decoded) => {
				  if (err) {
					  return res.json({
						  ok: false,
						  reason: 'Failed to authenticate token.'
					  })
				  } else {
					  req.decoded = decoded;
					  next();
				  }
			  });
		  } else {
			  return res.status(403).send({
				  ok: false,
				  reason: 'No token provided.'
			  });
		  }
	  });
  }

  _errors() {
	  // // catch 404 and forward to error handler
    this.express.use((req, res, next) => {
      const err = new Error('Not Found');
      err.status = 404;
      next(err);
    });

    // error handler
    this.express.use((err, req, res) => {
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};

      // render the error page
      res.status(err.status || 500);
      res.json({
        ok: false,
        reason: 'Server Error.'
      });
    });
  }
}

module.exports = new App().express;
