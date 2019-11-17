module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": "airbnb",
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "plugins": [
        "react"
    ],
    "rules": {
        "max-classes-per-file": 0,
        "no-console": "off",
        "no-plusplus": 0,
        "no-param-reassign": 0,
        "no-multi-assign": 0,
        "consistent-return": 0
    }
};