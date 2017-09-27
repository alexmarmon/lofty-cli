import { observable, computed } from 'mobx';

class AppState {
  // @observable user = { first_name: 'Alex', last_name: 'Marmon', phone: '0123456789' };

  // fetchData(query) {
  //   fetch(query).then(response => response.json())
  //     .then((response) => {
  //       this.user = response;
  //     });
  // }

  // @computed get fullName() {
  //   const name = `${this.user.first_name} ${this.user.last_name}`;
  //   return name;
  // }
}

export default AppState;
