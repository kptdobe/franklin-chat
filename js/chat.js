// TODO get from auth
const CONTEXT = {
  channel: 'G01AB8QLXH7',
  profile: {
    name: 'Alexandre Capt',
    email: 'acapt@adobe.com',
  },
}

const url = new URL(document.location.href);
if (url.searchParams.has('profile')) {
  CONTEXT.profile.name = 'John Doe';
  CONTEXT.profile.email = 'alexandre.capt@adobe.com';
}

const CHAT_API_URL = 'https://e217-88-162-11-6.eu.ngrok.io/chat';

const TITLE_SELECTOR = 'h1';
const MESSAGES_SELECTOR = '.messages';
const PUSH_SELECTOR = '.messages .push';
const INPUT_SELECTOR = '.new .input';
const SEND_SELECTOR = '.new .send';
const USER_NO_AVATAR_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" role="img" fill="currentColor" height="24" width="24" aria-hidden="true" aria-label="User"><path d="M32.949 34a.993.993 0 0 0 1-1.053c-.661-7.184-8.027-9.631-10.278-9.827C22.026 22.977 22 21.652 22 20c0 0 3.532-3.943 3.532-8.958C25.532 5.617 22.445 2 18 2s-7.532 3.617-7.532 9.042C10.468 16.057 14 20 14 20c0 1.652-.026 2.977-1.674 3.12-2.251.2-9.617 2.643-10.278 9.827a.993.993 0 0 0 1 1.053Z"></path></svg>';

const loadMessages = async (limit = 10) => {
  const res = await fetch(CHAT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cmd: 'history',
      channel: CONTEXT.channel,
      limit,
    }),
  });
  const { messages } = await res.json();
  messages.reverse().forEach((msg) => {
    console.log(msg);
    const { text, user } = msg;
    const displayName = user ? `${user.name} - ${user.email}` : msg.username || 'unknown';
    const source = user ? user.source : 'old';
    const hasReplies = msg.reply_count && msg.reply_count > 0;

    const chatMsg = document.createElement('div');
    chatMsg.classList.add('msg');
    chatMsg.innerHTML = `
      ${source === 'slack' && user && user.avatar ? `<img src="${user.avatar}" class="user-avatar"/>` : `<div class="user-no-avatar">${USER_NO_AVATAR_ICON}</div>` }
      <div>
        <div class="msg-user">${displayName}</div>
        <div class="msg-text">${text}</div>
        ${ hasReplies ? `<div class="msg-replies">${msg.reply_count} ${msg.reply_count > 1 ? 'replies' : 'reply'}</div>` : ''}
      </div>`;
    document.querySelector(PUSH_SELECTOR).before(chatMsg);
  });
};

const postMessage = async () => {
  const input = document.querySelector(INPUT_SELECTOR);
  const message = input.value;
  console.log('sending message', message);
  if (message) {
    await fetch(CHAT_API_URL, {
      method: 'POST',
      body: JSON.stringify({
        cmd: 'msg',
        channel: CONTEXT.channel,
        user: { 
          name: CONTEXT.profile.name, 
          email: CONTEXT.profile.email,
          source: 'web ui',
        },

        message,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    await loadMessages(1);
    document.querySelector(INPUT_SELECTOR).value = '';
  }
}

const init = () => {
  const { name } = CONTEXT.profile;
  document.querySelector(TITLE_SELECTOR).innerText = `${name} - chat with your team`;
  document.querySelector(SEND_SELECTOR).addEventListener('click', postMessage);

  loadMessages(5);
}

init();