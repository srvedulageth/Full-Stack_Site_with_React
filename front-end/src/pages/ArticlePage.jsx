import {useState} from 'react';
import {useParams, useLoaderData} from 'react-router-dom';
import artciles from '../article-content';
import CommentsList from '../CommentsList';
import axios from 'axios';
import AddCommentForm from '../AddCommentForm';
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
	    console.log('A 444-1');
        const token = user && await user.getIdToken();
	    console.log('A 444-2');
        const headers = token ? {authtoken : token} : {};
	    console.log('A 444-3');

        {/*const res = await axios.post('/apimd/articles/' + name + '/upvotes');*/}
        const res = await axios.post('/apimd/articles/' + name + '/upvotes', null, {headers});
	    console.log('A 444-4');

        const updatedArticleData = res.data;
        console.log('ArticlePage 333'); console.log(updatedArticleData); console.log(upVotes);
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

{/*
        {user ? <AddCommentForm onAddComment={onAddComment} />
        : <p>Log in to add a comment</p>}
        <CommentsList comments={comment} />
*/}
        </>
    );
}

export async function loader ({params}) {
    console.log(params.name);
    const res = await axios.get('/apimd/articles/' + params.name);
    console.log('ArticlePage 111'); console.log(res);
    const {upVotes, comment} = res.data;
    console.log('ArticlePage 222'); console.log(upVotes);
    return {upVotes, comment};
}
