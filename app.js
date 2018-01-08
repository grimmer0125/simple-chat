class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      logged_in: false,
    };
    this.setupFirebase();
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

    // after auto login or manually login
    // manually login's callback already includes user data
    // so only "auto login" has to use this way to handle user data
    firebase.auth().onAuthStateChanged((authUser) => {
      console.log('got auth user change in DB:', authUser);

      if (authUser) {
        const dataPath = `/users/${authUser.uid}`;// +"/KID";

        // will not trigger two times !!! if on(xx) two times
        firebase.database().ref(dataPath).on('value', (snap) => {
          const userValue = snap.val();

          console.log('userdata from firebase:', userValue);

          if (userValue && userValue.KID) {
            console.log('KID for:', authUser.uid, ';KID:', userValue.KID);
          } else {
            console.log('no KID for:', authUser.uid);
          }

          // dispatch(fetchUserData(true, userValue));
        });
      } else {
        console.log('auth becomes null');


        // dispatch(fetchUserData(false, null));
      }
    });
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

          this.setState({ logged_in: true });
        })
        .catch((error) => {
          // Handle Errors here.
          const errorCode = error.code;
          const errorMessage = error.message;
          // ...
        });
    } else {
      alert('empty email/pwd');
    }
  }

  signupEmailAccount = (e) => {
    // e.preventDefault(); -> for form

    const { email, password } = this.state;
    if (email && password) {
      firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((user) => {
          console.log('signup & auto login get the user:', user);

          this.setState({ logged_in: true });
          // e.g.
          // displayName:null
          // email:"grimmer0125@gmail.com"
          // emailVerified:false

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
          // Pi {code: "auth/weak-password", message: "Password should be at least 6 characters"}


          const errorMessage = error.message;
          alert(errorMessage);
        // ...
        });
    } else {
      alert('empty email/pwd');
    }
  }

  // signupEmailAccount(e) {
  //   e.preventDefault();
  //   // if (!this.state.text.length) {
  //   //   return;
  //   // }
  //   // const newItem = {
  //   //   text: this.state.text,
  //   //   id: Date.now(),
  //   // };
  //   // this.setState(prevState => ({
  //   //   items: prevState.items.concat(newItem),
  //   //   text: '',
  //   // }));
  // }

  render() {
    console.log('render');
    //  {/*<div id="tester1" style={{width:"90%", height:"250px"}}>*/}
    return (
      <div className="flex-container">
        <div >
          <div>
            <label>
                email:
            </label>
            <input type="text" value={this.state.email} onChange={this.handleChangeEmail} />
          </div>
          <div>
            <label>
                password:
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


        {/* <input
            onChange={this.handleChangeemail}
            value={this.state.email}
          />
          <input
            onChange={this.handleChangePassword}
            value={this.state.password}
          />
          <button>
            Sign up
          </button> */}
        {/* </form> */}
        {/* <span>
          accountID:
        </span>
        <span>
            input here
        </span> */}


        {/* hello App.js
        <UserList /> */}
      </div>
    );
  }
}
ReactDOM.render(<App />, document.getElementById('app'));
