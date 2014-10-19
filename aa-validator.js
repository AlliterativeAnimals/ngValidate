angular.module("aanimals.services.validator", []).
    factory("Validator", function() {
        var builtins = {
                number: function(value) {
                    return (
                        typeof value !== "number" ||
                            isNaN(value) ?
                            "Please enter a number" :
                            null
                    );
                },
                positive: function(value) {
                    return (
                        parseFloat(value) < 0 ?
                            "Please enter a positive number" :
                            null
                    );
                },
                email: function(value) {
                    return (
                        typeof value !== "string" ||
                            value.length < 6 || // a@b.co
                            value.split("@").length !== 2 ||
                            value.split(".").length <= 1 ?
                            "Please enter a valid email address" :
                            null
                    );
                },
                minlength: function(value, min) {
                    return (
                        value === undef ||
                            ("" + value).length < min ?
                            "Must be at least " + min + " characters long" :
                            null
                    );
                },
                maxlength: function(value, max) {
                    return (
                        value === undef ||
                            ("" + value).length > max ?
                            "Must be at most " + max + " characters long" :
                            null
                    );
                }
            },
            undef = (function(undef) { return undef; })();

        return function($scope) {
            var tests = [];

            function runTest(test) {
                if (
                    typeof test.test === "string" &&
                        builtins[test.test.split(":")[0]] !== undef
                ) {
                    var arguments = test.test.split(":");
                    arguments[0] = $scope[test.key];

                    return builtins[test.test].apply(arguments);
                } else if (typeof test.test === "function") {
                    return test.test($scope[key]);
                } else if (test.test.regexp instanceof RegExp) {
                    return (
                        test.test.regexp.test($scope[key]) ?
                            test.test.message :
                            null
                    );
                } else {
                    throw {
                        error: "Malformed test, must be builtin, function or regexp",
                        test: test
                    };
                }
            }

            return {
                /**
                 * Adds a new builtin that can be used with all instances of
                 * Validator
                 *
                 * @param String name of new builtin
                 * @param function func to run to test for error
                 */
                addBuiltin: function(name, func) {
                    if (typeof func !== "function") {
                        throw {
                            error: "Malformed builtin, must be a function",
                            builtin: {
                                name: name,
                                func: func
                            }
                        };
                    }

                    builtins[name] = func;
                },
                /**
                 * Adds a new test to test against a key
                **/
                addTest: function(key, test) {
                    tests.push({
                        key: key,
                        test: test
                    });
                    return this;
                },
                clearTests: function(key) {
                    if (key) {
                        tests = tests.filter(function(test) {
                            return test.key !== key;
                        });
                    } else {
                        tests = [];
                    }
                    return this;
                },
                getErrors: function(key) {
                    return tests.map(function(test) {
                        return runTest(test);
                    }).filter(function(value) {
                        return value;
                    });
                },
                getError: function(key) {
                    var errors = this.getErrors(key);
                    if (errors.length > 0) {
                        return errors[0];
                    } else {
                        return null;
                    }
                }
            }
        }
    });
