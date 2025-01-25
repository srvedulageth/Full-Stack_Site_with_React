import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {getAuth, createUserWithEmailAndPassword} from 'firebase/auth';

export default function CreateAccountPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    async function createAccount() {
        if(password !== confirmPassword) {
            setError('password and confirm password do not match');
            return;
        }

        try{
            await createUserWithEmailAndPassword(getAuth(), email, password);
            navigate('/articles');

        } catch(e) {
            setError(e.message)
        }
    }

    return (
        <>
        <h1>Create Account Page</h1>
        
        {error && <p>{error}</p>}

        {/* Whenever 'value' changes, setEmail to target value */}
        <input
        placeholder="your email address" 
        value={email} 
        onChange={e => setEmail(e.target.value)} >
        </input>
        
        <input
        placeholder='your password'
        type='password'
        value={password}
        onChange={e => setPassword(e.target.value)} >
        </input>

        <input
        placeholder='confirm your password'
        type='password'
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)} >
        </input>

        <button onClick={createAccount}>Create Account</button>
        <Link to='/login'> Already have an account? Log In. </Link>
        </>
    );
}