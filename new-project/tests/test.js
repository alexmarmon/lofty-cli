import { mount } from 'avoriaz';
import test from 'ava';
import request from 'supertest';

// modules
import User from '../modules/user.vue';

// backend
import server from '../../config/prod-server';

// state
import store from '../state';

// test things are rendering
test('Renders default data', (t) => {
  const userName = 'Alex Marmon';
  const wrapper = mount(User, { store });
  const text = wrapper.find('p')[0].text();

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