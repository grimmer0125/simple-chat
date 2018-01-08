class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.setupFirebase();
  }

  updateUserStatus(userValue) {
    this.setState({ currentUser: userValue });
  }

  syncAuthStatus() {
    firebase.auth().onAuthStateChanged((authUser) => {
      console.log('got auth user change in DB:', authUser);

      if (authUser) {
        const dataPath = `/users/${authUser.uid}`;

        firebase.database().ref(dataPath).on('value', (snap) => {
          const userValue = snap.val();

          console.log('userdata from firebase:', userValue);

          if (userValue && userValue.rid) {
            console.log('rid for:', authUser.uid, ';rid:', userValue.rid);
          } else {
            console.log('no rid for:', authUser.uid);
          }

          this.updateUserStatus(userValue);
        });
      } else {
        console.log('auth becomes null');
        // TODO handle this case
      }
    });
  }
  syncUserList() {
    const dataPath = 'users';

    firebase.database().ref(dataPath).on('value', (snap) => {
      const users = snap.val();
      console.log('users change in DB:', users);

      this.setState({ users });
    });
  }

  setupFirebase() {
    const config = {
      apiKey: 'AIzaSyB5HLZfls9ktbQDGogmc2ukcT4jbEXypi8',
      authDomain: 'simple-chat-38892.firebaseapp.com',
      databaseURL: 'https://simple-chat-38892.firebaseio.com',
      projectId: 'simple-chat-38892',
      storageBucket: '',
      messagingSenderId: '1026327948383',
    };
    console.log('firebase:', firebase);
    firebase.initializeApp(config);

    this.syncAuthStatus();
    this.syncUserList();
  }

  handleChangeEmail = (e) => {
    this.setState({ email: e.target.value });
  }

  handleChangePassword = (e) => {
    this.setState({ password: e.target.value });
  }

  signinEmailAccount = (e) => {
    const { email, password } = this.state;
    if (email && password) {
      firebase.auth().signInWithEmailAndPassword(email, password)
        .then((user) => {
          console.log('sign in ok, get the user:', user);
        })
        .catch((error) => {
          // Handle Errors here.
          console.log('sign in fail');
          const errorCode = error.code;
          const errorMessage = error.message;
          alert(errorMessage);
        });
    } else {
      alert('empty email/pwd');
    }
  }

  signupEmailAccount = (e) => {
    const { email, password } = this.state;
    if (email && password) {
      firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((user) => {
          console.log('signup & auto login get the user:', user);
          // e.g.
          // displayName:null
          // email:"grimmer0125@gmail.com"
          // emailVerified:false

          const dataPath = `/users/${user.uid}`;// `/users/${firebase.auth().currentUser.uid}`;
          firebase.database().ref(dataPath).update({
            rid: user.email,
          }).then(() => {
            console.log('register rid ok !!!:', user.email);
          });

          this.syncUserList();

          // TODO send Email Verification
          // https://firebase.google.com/docs/auth/web/manage-users
          // user.sendEmailVerification().then(() => {
          //   // Email sent.
          // }).catch((error) => {
          //   // An error happened.
          // });
        })
        .catch((error) => {
        // Handle Errors here.
          const errorCode = error.code;
          // e.g. {code: "auth/weak-password", message: "Password should be at least 6 characters"}

          const errorMessage = error.message;
          alert(errorMessage);
        });
    } else {
      alert('empty email/pwd');
    }
  }

  render() {
    console.log('render');

    const loginUI = (
      <div >
        <div>
          <label>
            {'email: '}
          </label>
          <input style={{ width: 200 }} type="text" value={this.state.email} onChange={this.handleChangeEmail} />
        </div>
        <div>
          <label>
            {'password: '}
          </label>
          <input type="password" value={this.state.password} onChange={this.handleChangePassword} />
        </div>
        <div>
          <button onClick={this.signupEmailAccount}>
            Sign up
          </button>

          <button onClick={this.signinEmailAccount}>
            Sign in
          </button>
        </div>
      </div>
    );

    if (this.state.currentUser) {
      console.log('user in render:', this.state.currentUser);
    } else {
      console.log('user not in render:');
    }

    return (
      <div className="flex-container">
        {this.state.currentUser ? <UserList users={this.state.users} currentUser={this.state.currentUser} /> : loginUI}
      </div>
    );
  }
}
ReactDOM.render(<App />, document.getElementById('app'));
