async function loadComments(postId) {
  var commentsPopup = document.getElementById('comments-popup')
  var overlay = document.getElementById('overlay')
  commentsPopup.classList.add('show');
  overlay.classList.add('show');

  if (userId) {
    commentsPopup.querySelector('#newCommentBtn').removeEventListener('click', () => { submitComment(postId) })
    commentsPopup.querySelector('#newCommentBtn').addEventListener('click', () => { submitComment(postId) })
    document.getElementById('new-comment').value = ''
  }
  var list = document.getElementById('comments-list');
  list.innerHTML = '';
  list.innerHTML = partialLoader('comments-loader');
  var res = await fetch(`/post/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  var comments = await res.json();
  setTimeout(() => {
    if (comments.length > 0) {

      document.getElementById('comments-loader').classList.add('hidden');
      comments.forEach(c => {
        if (c.user._id.toString() === userId.toString() || (currentUser && currentUser.role == 'admin')) {
          var trashIcon = `<span class='fal fa-trash' onclick='deleteComment("${c._id}", "${postId}")'></span>`
        } else {
          var trashIcon = ''
        }
        list.innerHTML += `<div class="comment" id="comment-${c._id}">
                                  <img src="${c.user.profile ? c.user.profile : '/images/user.png'}" alt="" onclick="window.location.href='/${c.user.username}'" class="user-profile">
                                  <div class="comment-info">
                                  <p class="name" onclick="window.location.href='/${c.user.username}'">${c.user.name} &nbsp; <span class="time">${c.timeAgo}</span></p>
                              <span class="text">${c.text}</span>
                            </div>
                            <div class="action-buttons">
                              ${trashIcon}
                            </div>
                          </div>`;
      });

      setTimeout(() => {
        document.querySelectorAll('.comment').forEach(c => {
          c.style.display = 'flex'
        })
      }, 100)
    } else {
      list.innerHTML = "No comments yet"
    }
  }, 500)
}

async function submitComment(postId, isHomePage = true) {
  document.querySelector('#newCommentBtn').disabled = true;
  var text = document.getElementById('new-comment').value;
  var res = await fetch(`/post/${postId}/new/comment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  var data = await res.json()
  if (data.success) {
    if (isHomePage) {
      loadComments(postId);
      document.getElementById('new-comment').value = ''
      var id = `comment-btn-${postId}`
      document.getElementById(id).innerHTML = `<span class="fal fa-message-lines"></span>${data.commentsLength}`
    } else {
      window.location.reload()
    }
    document.querySelector('#newCommentBtn').disabled = false;
  } else {
    Toast('Failed to add comment! Please try again later.', 'error')
    document.querySelector('#newCommentBtn').disabled = false;
  }
}

async function deleteComment(commentId, postId, isHomePage = true) {
  var conf = confirm('Are you sure you want to delete this comment?')
  if (!conf) {
    return
  }
  var res = await fetch(`/post/${postId}/comment/${commentId}/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  var data = await res.json();
  if (data.success) {
    if (isHomePage) {
      loadComments(postId);
      var id = `comment-btn-${postId}`
      document.getElementById(id).innerHTML = `<span class="fal fa-message-lines"></span>${data.commentsLength}`
    } else {
      document.getElementById(`comment-${commentId}`).style.display = 'none'
    }
  } else {
    Toast('Failed to delete comment! Please try again later.', 'error')
  }
}




// Logic for mentions in comments
var editor = document.getElementById('editor');
var newCommentInput = document.getElementById('new-comment');
var mentionBox = document.getElementById('mentionBox');

let editorMentionStartNode = null;
let editorMentionStartOffset = 0;

editor.addEventListener('input', async () => {
    cleanupBrokenMentions();

    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const node = selection.anchorNode;
    const offset = range.startOffset;

    if (node.nodeType !== Node.TEXT_NODE) return;

    editorMentionStartNode = node;
    editorMentionStartOffset = offset;
    
    const textUpToCursor = node.textContent.slice(0, offset);
    const match = textUpToCursor.match(/@([a-zA-Z0-9_.]{1,20})$/);

    if (match) {
        const keyword = match[1];
        const suggestions = await fetchSuggestions(keyword);
        showMentionBox(suggestions, editor);

        mentionBox.onclick = (e) => {
            let li = e.target.closest('li');
            if (li) {
                insertMentionIntoEditor(li.dataset.username);
            }
        };
    } else {
        mentionBox.classList.add('hidden');
    }
});

function insertMentionIntoEditor(username) {
    if (!editorMentionStartNode) return;

    const text = editorMentionStartNode.textContent;
    const before = text.slice(0, editorMentionStartOffset).replace(/@([a-zA-Z0-9_.]{1,20})$/, '');
    const after = text.slice(editorMentionStartOffset);

    const span = document.createElement('span');
    span.textContent = `@${username}`;
    span.style.color = 'var(--primary)';
    span.setAttribute('data-username', username);
    span.classList.add('mention');
    span.contentEditable = 'false';

    editorMentionStartNode.textContent = before;
    editorMentionStartNode.parentNode.insertBefore(span, editorMentionStartNode.nextSibling);
    span.after(document.createTextNode('\u00A0' + after));

    const range = document.createRange();
    const sel = window.getSelection();
    range.setStartAfter(span.nextSibling || span);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);

    editor.focus();
    mentionBox.classList.add('hidden');
}

function cleanupBrokenMentions() {
    editor.querySelectorAll('span.mention').forEach(span => {
        if (span.textContent !== `@${span.dataset.username}`) {
            span.replaceWith(document.createTextNode(span.textContent));
        }
    });
}

newCommentInput.addEventListener('input', async () => {
    const textUpToCursor = newCommentInput.value.slice(0, newCommentInput.selectionStart);
    const match = textUpToCursor.match(/@([a-zA-Z0-9_.]{1,20})$/);

    if (match) {
        const keyword = match[1];
        const suggestions = await fetchSuggestions(keyword);
        showMentionBox(suggestions, newCommentInput);

        mentionBox.onclick = (e) => {
            let li = e.target.closest('li');
            if (li) {
                insertMentionIntoInput(li.dataset.username);
            }
        };
    } else {
        mentionBox.classList.add('hidden');
    }
});

function insertMentionIntoInput(username) {
    const input = newCommentInput;
    const currentVal = input.value;
    const cursorPos = input.selectionStart;

    const textBefore = currentVal.slice(0, cursorPos).replace(/@([a-zA-Z0-9_.]{1,20})$/, `@${username} `);
    const textAfter = currentVal.slice(cursorPos);

    input.value = textBefore + textAfter;
    
    input.focus();
    input.setSelectionRange(textBefore.length, textBefore.length); // Move cursor
    mentionBox.classList.add('hidden');
}

async function fetchSuggestions(keyword) {
    if (keyword.toLowerCase() === 'all') {
        return [{ username: 'all', name: 'Everyone', isAll: true }];
    }
    try {
        const res = await fetch(`/search-users?keyword=${keyword}`);
        return await res.json();
    } catch (error) {
        console.error("Failed to fetch suggestions:", error);
        return [];
    }
}

function showMentionBox(suggestions, targetElement) {
    if (suggestions.length === 0) {
        mentionBox.classList.add('hidden');
        return;
    }
    
    const rect = targetElement.getBoundingClientRect();
    mentionBox.style.top = `${rect.bottom + window.scrollY + 5}px`;
    mentionBox.style.left = `${rect.left + window.scrollX}px`;

    mentionBox.innerHTML = suggestions.map(user => {
        const isAll = user.isAll;
        return `<li data-username="${user.username}" ${isAll ? 'data-all="true"' : ''}>
            <img src="${isAll ? '/images/icons/members.png' : (user.profile || '/images/user.png')}" alt="${user.username}" />
            ${isAll ? 'Everyone' : user.username}
        </li>`;
    }).join('');
    
    mentionBox.classList.remove('hidden');
}