import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from 'primereact/button';
import app from './config';

const provider = new GoogleAuthProvider();
const auth = getAuth(app);

function AdminSignInButton({showError, setShowLoading}) {
    const navigate = useNavigate();

    const signInPressed = () => {
        setShowLoading(true);
        signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
            const userid = user.uid;
            fetch('http://127.0.0.1:5000/admin/check_sign_in', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userid })
            })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'True') {
                    setTimeout(() => {
                        navigate('/admin/home');
                        setShowLoading(false);
                    }, 2000);
                } else {
                    navigate('/admin/signup');
                    setShowLoading(false);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showError('Log in failed, try again');
            })
        })
        .catch(() => {
            showError('Log in failed, try again');
            setShowLoading(false);
        });
    };
    return (
        <>
            <Button className="w-12rem" label="DCU Staff Login" severity="Primary" onClick={signInPressed}/>
        </>
    );
}

function SignInButton({ showError, setShowLoading }) {
    const navigate = useNavigate();

    const signInPressed = () => {
        setShowLoading(true);
        signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
            const userid = user.uid;
            fetch('http://127.0.0.1:5000/check_sign_in', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userid })
            })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'True') {
                    setTimeout(() => {
                        navigate('/home');
                        setShowLoading(false);
                    }, 2000);
                } else {
                    navigate('/signup');
                    setShowLoading(false);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showError('Log in failed, try again');
            })
        })
        .catch(() => {
            showError('Log in failed, try again');
            setShowLoading(false);
        });
    };
    return (
        <>
            <Button className="w-12rem" label="DCU Student Login" severity="success" onClick={signInPressed}/>
        </>
    );
}

function RequireAuth() {
    const navigate = useNavigate();
    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                const userid = user.uid;
                fetch('http://127.0.0.1:5000/check_sign_in', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ userid })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to check sign-in');
                    }
                    return response.json();
                })
                .then(data => {
                    if (!data || !data.message || data.message !== "True") {
                        throw new Error('User not signed in');
                    }
                    const uid = user.uid;
                    console.log(uid);
                })
                .catch(error => {
                    console.error('Error:', error);
                    navigate('/login');
                });
            } else {
                navigate('/login');
            }
        });
    }, [navigate]);

    return (
        <div id="detail"><Outlet /></div>
    );
};

function RequireAdminAuth() {
    const navigate = useNavigate();
    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                const userid = user.uid;
                fetch('http://127.0.0.1:5000/admin/check_sign_in', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ userid })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to check sign-in');
                    }
                    return response.json();
                })
                .then(data => {
                    if (!data || !data.message || data.message !== "True") {
                        throw new Error('User not signed in');
                    }
                    const uid = user.uid;
                    console.log(uid);
                })
                .catch(error => {
                    console.error('Error:', error);
                    navigate('/home');
                });
            } else {
                navigate('/login');
            }
        });
    }, [navigate]);

    return (
        <div id="detail"><Outlet /></div>
    );
};

async function getUserInformation() {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                const userID = user.uid;
                const userEmail = user.email;
                const userName = user.displayName;
                const userInfo = { email: userEmail, name: userName, userid: userID};
                resolve(userInfo);
            } else {
                reject(new Error('User is not signed in.'));
            }
            unsubscribe();
        });
    });
}

function SignOutButton() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);


    const signOutPressed = () => {
        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            signOut(auth).then(() => {
                navigate('/login');
            }).catch((error) => {
                console.log(error);
            });
        }, 2000);
    }
    return(
        <Button label="Log out" icon="pi pi-sign-out" loading={loading} onClick={signOutPressed} iconPos="right" className="m-2 text-gray-200" severity="secondary"/>
    )
}

export {SignInButton, RequireAuth, SignOutButton, getUserInformation, AdminSignInButton, RequireAdminAuth};