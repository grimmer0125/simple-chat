class ChatUI extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    this.el.scrollIntoView({ behaviour: 'smooth' });
  }

  componentDidMount() {
    this.scrollToBottom();
  }
  render() {
    const chatHistoryUI = [];
    const { chatHistory, chatInputText, handleChangeChatInput } = this.props;
    if (chatHistory) {
      console.log('chatHistory:', chatHistory);

      // left(someone)
      for (const pushMessageID in chatHistory) {
        // if (chat.name )
        const message = chatHistory[pushMessageID];
        if (message.name !== this.props.currentUser.rid) {
          chatHistoryUI.push(<div key={pushMessageID}>
            <div>
              {`${message.name}:`}
            </div>
            <div>
              {message.content}
            </div>
                             </div>);
        } else {
          chatHistoryUI.push(<div style={{ display: 'flex', justifyContent: 'flex-end' }} key={pushMessageID}>
            {message.content}
                             </div>);
        }
      }
      // chatHistoryUI
      // <div style={{display:"flex", justifyContent:"flex-end"}}>
      //   right(self)
      // </div>
      // <div style={{display:"flex"}}>
      //   left(someone)
      // </div>
    }
    return (
      <div style={{ width: 600 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={this.props.backToListPage}>
            Back
          </button>
        </div>
        <div style={{ height: 500, overflow: 'scroll', backgroundColor: '#7FDBFF' }}>
          {chatHistoryUI}
          <div
            ref={(el) => { this.el = el; }}
          />
        </div>
        <div style={{ height: 100, backgroundColor: '#DDDDDD' }}>
          <input type="text" style={{ width: '80%', height: 70 }} value={chatInputText} onChange={e => handleChangeChatInput(e.target.value)} />
          <button onClick={this.props.handleChatSend}>send</button>
        </div>
      </div>
    );
  }
}
