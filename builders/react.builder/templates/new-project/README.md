{{name}}
=====================

An application that combines:

* [MobX](https://mobxjs.github.io/mobx) Version: ^3.1.9
* [React](https://facebook.github.io/react) Version: ^15.5.4
* [React Router 4](https://github.com/ReactTraining/react-router) Version ^4.1.1
* [React Hot Loader 3](https://github.com/gaearon/react-hot-boilerplate/pull/61) Version: ^3.0.0-beta.7
* [Webpack 3](https://github.com/webpack/webpack.js.org) Version: ^3.0.0
* [Enzyme](https://github.com/airbnb/enzyme) Version: ^2.8.2
* [Airbnb's ESLint](https://github.com/airbnb/javascript) Version: ^15.0.1
* [Express](https://expressjs.com/) Version: ^4.15.2
* [Mysql](https://github.com/mysqljs/mysql) Version: ^2.11.1
* [Lofty Config](https://github.com/alexmarmon/lofty-config) Version: ^1.0.0

### Getting Started
```
vim creds.json
{
  "host": "localhost",
  "user": "mysql user",
  "password": "mysql password",
  "database": "{{name}}"
}

// in mysql
create database {{name}};

mysql -u [user] -p {{name}} < /path/to/this/repo/src/api/{{name}}.sql
```

### Run It
```
npm run dev
```

### Run Lint
```
npm run lint
npm run lint-fix
```

### Run Tests
```
npm run test
```

### Build Production Files
```
npm run build
```

### Serve Production Files
```
npm run production
```
