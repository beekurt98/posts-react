import { useEffect, useRef, useState } from 'react'
import './App.css'
import EmojiPicker from 'emoji-picker-react';
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";
import { thumbsUp, thumbsDown, sortSvg, paperClip, imgSvg, emojiSvg, italicSvg, boldSvg, underlineSvg, replySvg } from './Svg';

// todo:
// open photo onclick as dialog

function App() {
  const [posts, setPosts] = useState([])
  const [userName, setUserName] = useState("Berna Kurt")
  // writing controls
  const [input, setInput] = useState("")
  // img controls
  const [imgs, setImgs] = useState([])
  const [imgToShow, setImgToShow] = useState(null)
  const textareaRef = useRef(null)
  const [mainPosts, setMainPosts] = useState([])

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
    console.log(mainPosts)
  }

  useEffect(() => {
    setMainPosts([...posts])
  }, [posts])

  function renderPosts(posts) {
    return posts.map((post) => {
      return <Post mainPosts={mainPosts} setImgToShow={setImgToShow} imgs={imgs} userName={userName} setPosts={setPosts} posts={posts} key={crypto.randomUUID()} post={post} renderPosts={renderPosts} />
    })
  }
  function handleSelection() {
    const start = textareaRef.current.selectionStart
    const end = textareaRef.current.selectionEnd
    const txt = textareaRef.current.value.substring(start, end)
    return txt;
  }


  function handleCommentInput(e) {
    setInput(e.target.value)
  }

  return (
    <>
      <div className="main-container">
        <div className="write-comment">
          <InputControlField handleSelection={handleSelection} textareaRef={textareaRef} input={input} setInput={setInput} />

          <form onSubmit={handleCommentSubmit}>
            <textarea required ref={textareaRef} onSelect={handleSelection} onDoubleClick={handleSelection} autoComplete="off" className='comment-main-input' onChange={handleCommentInput} value={input} type="text" name="comment" id="" placeholder='Add comment...' ></textarea>
            <input type="submit" value="Submit" className='comment-submit-btn' />
          </form>
        </div>
        <div className="posts-div">
          <div className="header">
            <h2>Comments <span className='comment-count'>{posts.length}</span></h2>
            <div className="header-btns">
              <button className="sort-btn">{sortSvg}</button>
              <select name="order" id="">
                <option value="MostRecent">Most Recent</option>
              </select>
            </div>
          </div>
          <div className="comments-container">
            {renderPosts(posts)}
          </div>
        </div>
      </div>

      <dialog >
        {imgToShow}
      </dialog>

      <footer></footer>
    </>
  )
}

function Post({ mainPosts, setImgToShow, userName, imgs, post, renderPosts, posts, setPosts }) {
  // like & dislike controls
  const [likeCount, setLikeCount] = useState(post.likes)
  const [dislikeCount, setDislikeCount] = useState(post.dislikes)
  const [commentLiked, setCommentLiked] = useState(false)
  const [commentDisliked, setCommentDisliked] = useState(false)
  const textareaReplyRef = useRef(null)
  // reply controls
  const [replying, setReplying] = useState(false)
  const [replies, setReplies] = useState([post.replies][0])
  const [replyInput, setReplyInput] = useState("")


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
    e.target.reset();
    const thisPost = posts.find(x => x.comment == post.comment)
    thisPost.replies.push(newReply)
    setReplyInput("")
    setReplying(false)
    console.log(mainPosts)
  }

  function handleCommentInput(e) {
    setReplyInput(e.target.value)
  }
  return (
    <>
      <div className={mainPosts.includes(post) ? "main-comment-div" : "main-comment-div left-margin"}>
        <div className={mainPosts.includes(post) ? "" : "thread"}></div>
        <div className='comment'>
          <div className="comment-left">
            <img src={`https://ui-avatars.com/api/?name=${post.name.split(" ")[0]}+${post.name.split(" ")[1]}&background=random&bold=true&color=fff`} />
          </div>
          <div className="comment-right">

            <h3>{post.name}<span>{post.time}</span></h3>
            <div className='comment-content' dangerouslySetInnerHTML={{ __html: marked.parse(post.comment) }} />
            <div className="feedback-cont">
              <div className={commentLiked ? "liked feedback-div" : "feedback-div"}>
                <button className="feedback-btn" onClick={handleLikes} >{thumbsUp}</button> <p className="feedback-count">{likeCount}</p>
              </div>
              <div className={commentDisliked ? "disliked feedback-div" : "feedback-div"}>
                <button className="feedback-btn" onClick={handleDislikes}>{thumbsDown} </button><p className="feedback-count">{dislikeCount}</p>
              </div>
              <div className="feedback-div reply-btn" onClick={() => setReplying(!replying)}>
                <div className="" >{replySvg}</div><p>Reply</p>
              </div>
            </div>

          </div>

        </div>
        {
          replying && <><div className="reply-div">
            <InputControlField textareaRef={textareaReplyRef} input={replyInput} setInput={setReplyInput} />

            <form onSubmit={handleReply}>
              <textarea required ref={textareaReplyRef} onChange={handleCommentInput} value={replyInput} type="text" name='comment' placeholder='Add reply...'> </textarea>
              <input type="submit" value="Submit" className='comment-submit-btn' />
            </form>

          </div>
          </>

        }
        <div className='replies-container'>
          {post.replies && renderPosts(post.replies)}
        </div>
      </div>
    </>
  )
}

function InputControlField({ textareaRef, input, setInput }) {
  const [addImg, setAddImg] = useState(false)
  const [showLink, setShowLink] = useState(false)
  const [emojiScreenOn, setEmojiScreen] = useState(false)

  function handleEmoji(e) {
    setInput(prevInput => prevInput + e.emoji)
  }

  function handleSelection(styling) {
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd

    if (start === end) return;


    const beforeSelection = textarea.value.substring(0, start);
    const selectedText = textarea.value.substring(start, end)
    const afterSelection = textarea.value.substring(end);

    const textSyling = {
      "bold": `**${selectedText}**`,
      "italic": `*${selectedText}*`,
      "underline": `<u>${selectedText}</u>`
    }
    // const boldedText = `**${selectedText}**`

    setInput(beforeSelection + textSyling[styling] + afterSelection)
  }

  function handleLink(e) {
    e.preventDefault();
    const formData = new FormData(e.target)
    const formObj = Object.fromEntries(formData)
    setInput(prevInput => prevInput + `[${formObj.linkTitle}](${formObj.linkUrl})`)

    e.target.reset()
  }

  function handleAddImg(e) {
    e.preventDefault();
    const formData = new FormData(e.target)
    const formObj = Object.fromEntries(formData)
    setInput(prevInput => prevInput + `![${formObj.imgAlt}](${formObj.imgUrl})`)
    e.target.reset()
  }
  return (
    <>
      <div className="control">
        <button className="icon-button" type='button' onClick={() => handleSelection("bold")}>{boldSvg}</button>
        <button className="icon-button" type='button' onClick={() => handleSelection("italic")}>{italicSvg}</button>
        <button className="icon-button" type='button' onClick={() => handleSelection("underline")}>{underlineSvg}</button>
        <span className="vertical-line"></span>
        <button className="icon-button" type='button' key={crypto.randomUUID()} onClick={() => { setShowLink(!showLink); setAddImg(false); setEmojiScreen(false) }}>{paperClip}</button>

        <button className="icon-button" type='button' key={crypto.randomUUID()} onClick={() => { setAddImg(!addImg); setShowLink(false); setEmojiScreen(false) }}>{imgSvg}</button>

        <button className="icon-button" type='button' onClick={(e) => { e.preventDefault(); setEmojiScreen(!emojiScreenOn); setShowLink(false); setAddImg(false) }}>{emojiSvg}</button>

      </div>

      {
        emojiScreenOn && <div className="emoji-div">
          <EmojiPicker onEmojiClick={handleEmoji} />
        </div>
      }
      {
        addImg && <div className='addMedia'>
          <div className="icon-button" >{imgSvg}</div>
          <form onSubmit={handleAddImg}>
            <input type="text" placeholder='Image alt' name='imgAlt' />
            <input type="url" placeholder='Image url' name="imgUrl" />
            <input type="submit" name="" value="Add" />
          </form>
        </div>
      }
      {
        showLink && <div className='addMedia'>
          <div className="icon-button" >{paperClip}</div>
          <form onSubmit={handleLink}>
            <input type="text" placeholder='Link title' name='linkTitle' />
            <input type="url" placeholder='Link url' name="linkUrl" />
            <input type="submit" name="" value="Add" />
          </form>
        </div>
      }
      <hr />

    </>
  )
}


export default App