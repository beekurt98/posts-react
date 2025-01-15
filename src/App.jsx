import { useEffect, useState } from 'react'
import './App.css'
import EmojiPicker from 'emoji-picker-react';

// todo: if liked, remove dislike & vice versa
// add markdown stuff to input field
// add links
// open photo onclick as dialog
// bold etc: use replace str

function App() {
  const [posts, setPosts] = useState([])
  const [userName, setUserName] = useState("Bee")
  // writing controls
  const [emojiScreenOn, setEmojiScreen] = useState(false)
  const [input, setInput] = useState("")
  const [selectedText, setSelectedText] = useState("")
  const [img, setImg] = useState(null)
  // img controls
  const [imagesDiv, setImagesDiv] = useState(false)
  const [imgs, setImgs] = useState([])
  const [imgToShow, setImgToShow] = useState(null)

  useEffect(() => {
    async function getData() {
      const data = await fetch('./src/data.json').then(res => res.json())
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
    // e.preventDefault()
    setInput(prevInput => prevInput + e.emoji)
  }

  function handleBold(e) {
    e.preventDefault()
    setSelectedText(`**${selectedText}**`)
    console.log(selectedText)
  }

  function handleCommentInput(e) {
    setInput(e.target.value)
  }

  function handleSelection(e) {
    e.preventDefault()
    setSelectedText(e.target.value)
  }

  function deleteImg(img) {
    setImgs(imgs.filter(x => x !== img))
  }

  function handleOnFocus(e) {
    console.log(e.target.value, "r")
  }

  return (
    <>
      <h1>hey</h1>
      <div className="write-comment">
        <form onSubmit={handleCommentSubmit}>
          <input onDoubleClick={handleSelection} onFocus={handleOnFocus} autoComplete="off" className='comment-main-input' onChange={handleCommentInput} value={input} type="text" name="comment" id="" placeholder='Add comment...' />

          <input type="submit" value="Submit" />

        </form>
        {
          imagesDiv && <div className="images-div">
            {
              imgs.map((img, index) => {
                return <>
                  <img key={index} className='user-img' src={img} alt="" />
                  <button onClick={(e) => { e.preventDefault(); deleteImg(img); }}>X</button>
                </>

              })
            }
          </div>
        }
        <div className="control">
          <button onClick={handleBold}>B</button>
          <button><em>I</em></button>
          <button><u>U</u></button>
          <span className="vertical-line"></span>
          <button>🔗</button>
          <ImageInput imgs={imgs} setImgs={setImgs} setImagesDiv={setImagesDiv} img={img} setImg={setImg} />
          <button onClick={(e) => { e.preventDefault(); setEmojiScreen(!emojiScreenOn) }}>☺️</button>
          {
            emojiScreenOn && <EmojiPicker onEmojiClick={handleEmoji} />
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
        <p>{post.comment}</p>
        <div className="user-images">
          {
            post.images && post.images.map((img) => {
              return <img onClick={() => setImgToShow(img)} className='user-img' key={crypto.randomUUID()} src={img} />
            })
          }
        </div>
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

function ImageInput({ img, setImg, imgs, setImgs, setImagesDiv }) {
  const [showAddImgDiv, setShowAddImgDiv] = useState(false)
  const [addImgUrl, setAddImgUrl] = useState(true)

  function handleAddImg(e) {
    e.preventDefault();
    setShowAddImgDiv(!showAddImgDiv)
  }

  function acceptImgSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target)
    const formObj = Object.fromEntries(formData)
    setImg(formObj.imgUrl)
    setImgs([...imgs, formObj.imgUrl])
    setImagesDiv(true)
    e.target.reset()
    console.log(imgs)
  }

  return (
    <>
      <button onClick={handleAddImg}>🖼️</button>
      {
        showAddImgDiv && <div className="add-img-div">
          {
            addImgUrl && <form onSubmit={acceptImgSubmit}>
              <input type="text" name='imgUrl' placeholder='url of the img' />
              <input type="submit" />
            </form>
          }
        </div>
      }

    </>
  )
}

export default App
