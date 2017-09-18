new-project
=====================

An application that combines:

* [Node](https://nodejs.org/api/v8.html) Version: ^8.0.0
* [Vue](https://github.com/vuejs/vue) Version: ^2.4.2
* [Vuex](https://github.com/vuejs/vuex) Version ^2.4.0
* [Vue Router](https://github.com/vuejs/vue-router) Version ^2.7.0
* [Webpack 3](https://github.com/webpack/webpack.js.org) Version: ^3.5.6
* [Airbnb's ESLint](https://github.com/airbnb/javascript) Version: ^11.3.2
* [Express](https://expressjs.com/) Version: ^4.15.4

### Getting Started
```
vim creds.json
{
  "host": "localhost",
  "user": "mysql user",
  "password": "mysql password",
  "database": "new-project"
}

// in mysql
create database new-project;

mysql -u [user] -p new-project < /path/to/this/repo/api/new-project.sql
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