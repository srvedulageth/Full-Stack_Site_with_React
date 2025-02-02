import {useState} from 'react';
import {useParams, useLoaderData} from 'react-router-dom';
import artciles from '../article-content';
import CommentsList from '../CommentsList';
import axios from 'axios';
import AddCommentForm from '../AddCommenForm';
import useUser from '../useUser';

export default function ArticlePage() {
    const params = useParams();
    const name = params.name;
    const {upVotes: initialupVotes, comment: initialComment} = useLoaderData();
    const [upVotes, setupVotes] = useState(initialupVotes);
    const [comment, setComment] = useState(initialComment);
 
    const article = artciles.find(a => a.name == name);

    const {isLoading, user} = useUser();

    //const {name} = useParams();

    async function onUpvoteclicked() {
        const token = user && await user.getIdToken();
        const headers = token ? {authtoken : token} : {};

        {/*const res = await axios.post('/apimd/articles/' + name + '/upvotes');*/}
        const res = await axios.post('/apimd/articles/' + name + '/upvotes', null, {headers});

        const updatedArticleData = res.data;
        setupVotes(updatedArticleData.upVotes);
    }

    async function onAddComment({nameText, commentText}) {
        const token = user && await user.getIdToken();
        const headers = token ? {authtoken : token} : {};

        const res = await axios.post('/apimd/articles/' + name + '/comment', {
            postedBy: nameText,
            comment: commentText
        }, {headers});
        const updatedArticleData = res.data;
        setComment(updatedArticleData.comment);
    }
    
    return (
        <>
        <h1>This is {article.title} Page</h1>
        {user && <button onClick={onUpvoteclicked}>Upvote</button>}
        <p>This article has {upVotes} upvotes!</p>
        {article.content.map(p => <p key={p}> {p} </p>)}
        {user ? <AddCommentForm onAddComment={onAddComment} />
        : <p>Log in to add a comment</p>}
        <CommentsList comments={comment} />
        </>
    );
}

export async function loader ({params}) {
    const res = await axios.get('/apimd/articles/' + params.name);
    console.log(res.data.upVotes);
    const {upVotes, comment} = res.data;
    return {upVotes, comment};
}