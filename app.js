class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: null,
      chatTo: null,
    };
    this.setupFirebase();
  }

  resetState() {
    this.setState({
      currentUser: null,
      chatTo: null,
    });
  }

  updateUserStatus(userValue) {
    this.setState({ currentUser: userValue });
  }

  registerAuthStatus() {
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

  signout = (e) => {
    console.log('sign out');
    firebase.auth().signOut()
      .then(() => {
        console.log('firebase logout');
        // dispatch(LogoutAction());
        this.resetState();
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

    this.registerAuthStatus();
    this.syncUserList();
  }

  handleChangeEmail = (e) => {
    this.setState({ email: e.target.value });
  }

  handleChangePassword = (e) => {
    this.setState({ password: e.target.value });
  }

  backToListPage = () => {
    this.setState({ chatTo: null });
  }

  clickToChat = (e) => {
    console.log('click someone to chat:', e);
    this.setState({ chatTo: e });

    // try to get chat history
    const chatID = this.getChatID(e);
    this.syncChatHistory(chatID);
  }

  getChatID(chatTo) {
    const array = [this.state.currentUser.rid, chatTo];
    array.sort();
    let chatID = array.join('');
    // chatID = chatID.replace('@', '');
    chatID = chatID.replace(/@/g, '');
    chatID = chatID.replace(/\./g, '');

    return chatID;
  }

  syncChatHistory(chatID) {
    // const dataPath = 'users';

    const dataPath = `chats/${chatID}`;

    firebase.database().ref(dataPath).on('value', (snap) => {
      const chat = snap.val();
      console.log('chat change in DB:', chat);

      const updatePart = {};
      updatePart[chatID] = chat;
      this.setState(updatePart);
    });
  }

  handleChatSend = () => {
    // const array = [this.state.currentUser.rid, this.state.chatTo];
    // array.sort();
    // let chatID = array.join('');
    // // chatID = chatID.replace('@', '');
    // chatID = chatID.replace(/@/g, '');
    // chatID = chatID.replace(/\./g, '');
    const chatID = this.getChatID(this.state.chatTo);

    const path = `chats/${chatID}`;
    const newMessageRef = firebase.database().ref(path).push();
    // const newMessageId = newMessageRef.key;

    // save to Firebase
    // 1. chats/"self + someone"
    // 2. timestamp
    // 3. content
    // /chats/
    //    "self:remote" (unique)
    //          //histroy
    //              //message1(timestamp1)
    //                  // content
    // const self = this.state.currentUser.rid;
    // const remote = this.state.chatTo;

    newMessageRef.set({
      name: this.state.currentUser.rid,
      content: this.state.chatInputText,
      // owners: [firebase.auth().currentUser.uid],
    });
  }

  handleChangeChatInput = (e) => {
    this.setState({ chatInputText: e });
  }

  signinEmailAccount = (e) => {
    const { email, password } = this.state;
    if (email && password) {
      firebase.auth().signInWithEmailAndPassword(email, password)
        .then((user) => {
          console.log('sign in ok, get the user:', user);

          this.syncUserList();
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
    // console.log('render');

    if (!this.state.currentUser) {
      // console.log('user not in render:');
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

      return (
        <div className="flex-container">
          {loginUI}
        </div>
      );
    }

    // console.log('user in render:', this.state.currentUser);

    // TODO may change to be called in ChatUI's property
    const chatID = this.getChatID(this.state.chatTo);
    // this.syncChatHistory(chatID);
    // let chatContent = null;
    // if (this.state.hasOwnProperty(chatID)) {
    //   chatContent = this.state[chatID];
    // }

    return (
      <div className="flex-container">
        {!this.state.chatTo ? <UserList
          users={this.state.users}
          currentUser={this.state.currentUser}
          startChat={this.clickToChat}
          signout={this.signout}
        /> :
        <ChatUI
          chatHistory={this.state.hasOwnProperty(chatID) ? this.state[chatID] : null}
          chatInputText={this.state.chatInputText}
          handleChangeChatInput={this.handleChangeChatInput}
          handleChatSend={this.handleChatSend}
          currentUser={this.state.currentUser}
          backToListPage={this.backToListPage}
        />
      }

      </div>
    );
  }
}
ReactDOM.render(<App />, document.getElementById('app'));
