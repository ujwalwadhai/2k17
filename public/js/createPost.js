const textarea = document.getElementById('editor');
const mentionBox = document.getElementById('mentionBox');

let mentionActive = false;
let mentionStartNode = null;
let mentionStartOffset = 0;
let suggestions = [];

textarea.addEventListener('input', async (e) => {
  cleanupBrokenMentions();

  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const node = selection.anchorNode;
  const offset = range.startOffset;

  if (node.nodeType !== Node.TEXT_NODE) return;

  mentionStartNode = node;
  mentionStartOffset = offset;

  const textUpToCursor = node.textContent.slice(0, offset);
  const match = textUpToCursor.match(/@([a-zA-Z0-9_.]{1,20})$/);

  if (match) {
    const keyword = match[1];
    mentionActive = true;

    if (keyword.toLowerCase() === 'all') {
      showMentionBox([{ username: 'all', name: 'Everyone', isAll: true }]);
    } else {
      const res = await fetch(`/search-users?keyword=${keyword}`);
      suggestions = await res.json();
      showMentionBox(suggestions);
    }
  } else {
    mentionBox.classList.add('hidden');
    mentionActive = false;
  }
});

function showMentionBox(suggestions) {
  mentionBox.innerHTML = suggestions.map(user => {
    const isAll = user.isAll;
    return `<li data-username="${user.username}" ${isAll ? 'data-all="true"' : ''}>
      <img src="${isAll ? '/images/icons/members.png' : (user.profile || '/images/user.png')}" alt="${user.username}" />
      ${isAll ? 'Everyone' : user.username}
    </li>`;
  }).join('');

  mentionBox.classList.remove('hidden');
}

mentionBox.addEventListener('click', (e) => {
  let li = e.target;
  if (li.tagName !== 'LI') li = li.closest('li');
  if (li) {
    const username = li.dataset.username;
    insertMention(username);
  }
});
 
function insertMention(username) {
  if (!mentionStartNode) return;

  const text = mentionStartNode.textContent;
  const before = text.slice(0, mentionStartOffset).replace(/@([a-zA-Z0-9_.]{1,20})$/, '');
  const after = text.slice(mentionStartOffset);

  const span = document.createElement('span');
  span.textContent = `@${username}`;
  span.style.color = 'var(--primary)';
  span.style.cursor = 'pointer';
  span.setAttribute('data-username', username);
  span.classList.add('mention');
  span.contentEditable = 'false';

  mentionStartNode.textContent = before;
  mentionStartNode.parentNode.insertBefore(span, mentionStartNode.nextSibling);
  span.after(document.createTextNode(' ' + after));

  const range = document.createRange();
  const sel = window.getSelection();
  range.setStartAfter(span.nextSibling);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);

  textarea.focus();
  mentionBox.classList.add('hidden');
  mentionActive = false;
}

function cleanupBrokenMentions() {
  const mentions = textarea.querySelectorAll('span.mention');
  mentions.forEach(span => {
    const username = span.getAttribute('data-username');
    if (span.textContent !== `@${username}`) {
      const plain = document.createTextNode(span.textContent);
      span.replaceWith(plain);
    }
  });
}
