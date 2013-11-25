'use strict';

var mout = require('mout'),
	rules = require('./rules');

function validateSchema(schema) {
	if (!mout.lang.isObject(schema)) {
		throw new Error('Schema(name, schema): schema: Must be an object!');
	}
}

var Schema = module.exports = function Schema(name, schema) {

	if (!mout.lang.isString(name)) {
		throw new Error('Schema(name, schema): name: Must be a string!');
	}
	this.name = name;

	validateSchema(schema);
	this.schema = schema;
};

function _validate(targetKey, attrs, cb) {
	var errors = {};
	var _this = this;
	mout.object.forOwn(attrs, function (value, key) {
		var nestedKey = targetKey + (targetKey.length ? '.' : '') + key;
		if (mout.lang.isObject(value)) {
			_validate.apply(_this, [nestedKey, value, function (err) {
				if (err) {
					errors[key] = err;
				}
			}]);
		} else {
			var schemaRules = mout.object.get(_this.schema, nestedKey);
			mout.object.forOwn(schemaRules, function (ruleValue, ruleKey) {
				if (!rules[ruleKey](ruleValue, value)) {
					if (!errors[key]) {
						errors[key] = {
							errors: []
						};
					}
					errors[key].errors.push(ruleKey);
				}
			});
		}
	});
	if (mout.object.keys(errors).length > 0) {
		cb(errors);
	} else {
		cb();
	}
}

Schema.prototype.validate = function validate(attrs, cb) {
	_validate.apply(this, ['', attrs, function (errors) {
		if (errors && mout.object.keys(errors).length > 0) {
			cb(errors);
		} else {
			cb();
		}
	}]);
};