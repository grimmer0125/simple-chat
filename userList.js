class UserList extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    console.log('UserList in render');

    const { users, currentUser } = this.props;

    const listUI = [];
    if (users) { // is object, not array
      for (const user_uid in users) {
        console.log('user_uid:', user_uid);
        const user = users[user_uid];

        if (user.rid !== currentUser.rid) {
          listUI.push(<div key={user.rid}>
            <button onClick={() => this.props.startChat(user.rid)}>
              {user.rid}
            </button>
                      </div>);
        }
      }
    }
    return (
      <div>
        public user list, click to chat
        {listUI}
      </div>
    );
  }
}
