import { useState } from "react";

export default function AddCommentForm({onAddComment}) {
    const [nameText, setnameText] = useState('');
    const [commentText, setcommentText] = useState('');

    return(
        <div>
            <h3>Add a Comment</h3>
            <label>
                Name:
                <input type="text" value={nameText} onChange={e => setnameText(e.target.value)} />
            </label>
            <label>
                Comment:
                <input type="text" value={commentText} onChange={e => setcommentText(e.target.value)} />
            </label>
            <button onClick ={() => {
                onAddComment({nameText, commentText});
                setnameText('');
                setcommentText('');
            }}> Add Comment </button>
        </div>
    );
}