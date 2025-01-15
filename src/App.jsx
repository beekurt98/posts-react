import { useEffect, useRef, useState } from 'react'
import './App.css'
import EmojiPicker from 'emoji-picker-react';
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";


// todo: if liked, remove dislike & vice versa
// open photo onclick as dialog
// add bold etc to replies

function App() {
  const [posts, setPosts] = useState([])
  const [userName, setUserName] = useState("Bee")
  // writing controls
  const [emojiScreenOn, setEmojiScreen] = useState(false)
  const [input, setInput] = useState("")
  // img controls
  const [imgs, setImgs] = useState([])
  const [imgToShow, setImgToShow] = useState(null)
  const [addImg, setAddImg] = useState(false)
  const textareaRef = useRef(null)
  // link control
  const [showLink, setShowLink] = useState(false)

  useEffect(() => {
    async function getData() {
      const data = await fetch('https://api.npoint.io/66575b019f7534b35ead').then(res => res.json())
      setPosts(data)
    }

    getData();
  }, [])

  function handleCommentSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target)
    const formObj = Object.fromEntries(formData)
    const newComment = {
      name: userName,
      time: "Just now",
      comment: formObj.comment,
      likes: 0,
      dislikes: 0,
      replies: [],
    }
    newComment.images = imgs
    setImgs([])
    setPosts([...posts, newComment])
    e.target.reset()
    setInput("")
  }

  function renderPosts(posts) {
    return posts.map((post) => {
      return <Post setImgToShow={setImgToShow} imgs={imgs} userName={userName} setPosts={setPosts} posts={posts} key={crypto.randomUUID()} post={post} renderPosts={renderPosts} />
    })
  }

  function handleEmoji(e) {
    setInput(prevInput => prevInput + e.emoji)
  }

  function handleBold() {
    let selectText = handleSelection()
    setInput(input.replace(selectText, `**${selectText}**`))
  }

  function handleItalic() {
    let selectText = handleSelection()
    setInput(input.replace(selectText, `*${selectText}*`))
  }

  function handleUnderline() {
    let selectText = handleSelection()
    setInput(input.replace(selectText, `<u>${selectText}</u>`))
  }

  function handleLink(e) {
    e.preventDefault();
    const formData = new FormData(e.target)
    const formObj = Object.fromEntries(formData)
    console.log(formObj)
    setInput(prevInput => prevInput + `[${formObj.linkTitle}](${formObj.linkUrl})`)

    e.target.reset()
  }

  function handleCommentInput(e) {
    setInput(e.target.value)
  }

  function handleSelection() {
    const start = textareaRef.current.selectionStart
    const end = textareaRef.current.selectionEnd
    const txt = input.slice(start, end)
    // setSelectedText(txt)
    return txt;
  }

  function handleAddImg(e) {
    e.preventDefault();
    const formData = new FormData(e.target)
    const formObj = Object.fromEntries(formData)
    console.log(formObj)
    setInput(prevInput => prevInput + `![${formObj.imgAlt}](${formObj.imgUrl})`)

    e.target.reset()
  }

  return (
    <>
      <h1>hey</h1>
      <div className="write-comment">
        <form onSubmit={handleCommentSubmit}>
          <textarea ref={textareaRef} onSelect={handleSelection} onDoubleClick={handleSelection} autoComplete="off" className='comment-main-input' onChange={handleCommentInput} value={input} type="text" name="comment" id="" placeholder='Add comment...' ></textarea>
          <input type="submit" value="Submit" />
        </form>
        <div className="control">
          <button onClick={handleBold}>B</button>
          <button onClick={handleItalic}><em>I</em></button>
          <button onClick={handleUnderline}><u>U</u></button>
          <span className="vertical-line"></span>
          <button key={crypto.randomUUID()} onClick={() => {setShowLink(!showLink); setAddImg(false); setEmojiScreen(false)}}>🔗</button>
          
          <button key={crypto.randomUUID()} onClick={() => {setAddImg(!addImg); setShowLink(false); setEmojiScreen(false) }}>🖼️</button>
          
          <button onClick={(e) => { e.preventDefault(); setEmojiScreen(!emojiScreenOn); setShowLink(false); setAddImg(false) }}>☺️</button>
          {
            emojiScreenOn && <EmojiPicker onEmojiClick={handleEmoji} />
          }
          {
            addImg && <div>
            <form onSubmit={handleAddImg}>
              <input type="text" placeholder='image alt' name='imgAlt' />
              <input type="text" placeholder='image url' name="imgUrl" />
              <input type="submit" name="" value="submit" />
            </form>
          </div>
          }
          {
            showLink && <div>
              <form onSubmit={handleLink}>
                <input type="text" placeholder='link title' name='linkTitle' />
                <input type="text" placeholder='link url' name="linkUrl" />
                <input type="submit" name="" value="submit" />
              </form>
            </div>
          }
        </div>
      </div>
      <div className="posts-div">
        {renderPosts(posts)}
      </div>
      <dialog > 
        {imgToShow}
      </dialog>
    </>
  )
}

function Post({ setImgToShow, userName, imgs, post, renderPosts, posts, setPosts }) {
  // like & dislike controls
  const [likeCount, setLikeCount] = useState(post.likes)
  const [dislikeCount, setDislikeCount] = useState(post.dislikes)
  const [commentLiked, setCommentLiked] = useState(false)
  const [commentDisliked, setCommentDisliked] = useState(false)

  // reply controls
  const [replying, setReplying] = useState(false)
  const [replies, setReplies] = useState([post.replies][0])


  function handleLikes() {
    setCommentDisliked(false)
    setCommentLiked(!commentLiked)
    commentDisliked && setDislikeCount(dislikeCount - 1)
    !commentLiked ? setLikeCount(post.likes + 1) : setLikeCount(likeCount - 1)
  }

  function handleDislikes() {
    setCommentLiked(false)
    setCommentDisliked(!commentDisliked)
    commentLiked && setLikeCount(likeCount - 1)
    !commentDisliked ? setDislikeCount(post.dislikes + 1) : setDislikeCount(dislikeCount - 1)
  }

  function handleReply(e) {
    e.preventDefault();
    const formData = new FormData(e.target)
    const formObj = Object.fromEntries(formData)
    const newReply = {
      name: userName,
      time: "Just now",
      comment: formObj.comment,
      likes: 0,
      dislikes: 0,
      replies: [],
    }
    setReplies([...replies, newReply])
    // console.log(replies)
    e.target.reset();
    const thisPost = posts.find(x => x.comment == post.comment)
    console.log(thisPost.replies)
    thisPost.replies.push(newReply)
  }


  return (
    <>
      <div className='comment'>
        <img width={50} src="https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg" />
        <h3>{post.name}</h3> <span>{post.time}</span>
        <div className='comment-content' dangerouslySetInnerHTML={{ __html: marked.parse(post.comment) }} />
        
        <button className={commentLiked ? "liked" : ""} onClick={handleLikes} >👍 {likeCount}</button>
        <button className={commentDisliked ? "disliked" : ""} onClick={handleDislikes}>👎 {dislikeCount}</button>
        <button className="reply-btn" onClick={() => setReplying(!replying)}>🗩 Reply</button>
        {
          replying && <div className="reply-div">
            <form onSubmit={handleReply}>
              <input type="text" name='comment' placeholder='Add reply...' />
              <input type="submit" value="Submit" />
            </form>
          </div>
        }
        {post.replies && renderPosts(post.replies)}
      </div>

    </>
  )
}


export default App
