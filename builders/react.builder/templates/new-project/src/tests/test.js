import React from 'react';
import { mount } from 'enzyme';
import test from 'ava';
import request from 'supertest';

import User from '../modules/user/user';
import AppState from '../state/AppState';
import server from '../../config/prod-server';

const appState = new AppState();

// test things are rendering
test('Renders default data', (t) => {
  const userName = 'Alex Marmon';
  const wrapper = mount(<User state={appState} />); // eslint-disable-line react/jsx-filename-extension
  const text = wrapper.find('p').at(0).text();

  t.is(text, userName);
});


// test the api
test.cb('The users api works', (t) => {
  request(server)
    .get('/api/users')
    .expect(200)
    .end((err, res) => {
      if (err) throw err;
      t.is(res.status, 200);
      t.end();
    });
});
