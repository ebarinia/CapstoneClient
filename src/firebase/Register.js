import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, storage, db } from "../firebase.js";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";

const Register = ( {onCreate} ) => {
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [stateUser, setStateUser] = useState({
    firstName: "",
    lastName: "",
    email: ""
  })

  const handleInputChange = (e) => {
    let propertyName = e.target.name;
    let copiedUser = {...stateUser}
    copiedUser[propertyName] = e.target.value
    setStateUser(copiedUser)
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    
    const firstName = e.target[0].value;
    const lastName = e.target[1].value;
    const emailAddress = e.target[2].value;
    const password = e.target[3].value;
    const file = e.target[4].files[0];
    try {
      const res = await createUserWithEmailAndPassword(auth, emailAddress, password);
      console.log(res);

      const userWithUid = {
        ...stateUser,
        uid: res.user.uid
      };
      
      const date = new Date().getTime();
      const storageRef = ref(storage, `${firstName + date}`);

      await uploadBytesResumable(storageRef, file).then(() => {
        getDownloadURL(storageRef).then(async (downloadURL) => {
            try {
              await updateProfile(res.user, {
                firstName,
                lastName,
                photoURL: downloadURL,
              });
              await setDoc(doc(db, "users", res.user.uid), {
                uid: res.user.uid,
                firstName,
                lastName,
                emailAddress,
                photoURL: downloadURL,
              });
              await setDoc(doc(db, "userChats", res.user.uid), {});
              navigate("/");

              onCreate({
                ...userWithUid,
                photoURL: downloadURL,
              });
              
            } catch (err) {
              console.log(err);
              setErr(true);
              setLoading(false);
            }
          });
        }
      );
    } catch (err) {
      setErr(true);
      setLoading(false);
    }
  };
  
  return (
    <div className="formContainer">
      <div className="formWrapper">
        <span className="logo">SJG Chat</span>
        <span className="title">Register</span>
        <form onSubmit={handleSubmit} id="register">
          <input type="text" placeholder="first name" name="firstName" onChange={handleInputChange}/>
          <input type="text" placeholder="last name" name="lastName" onChange={handleInputChange}/>
          <input type="email" placeholder="email address" name="email" onChange={handleInputChange}/>
          <input type="password" placeholder="password" />
          <input type="file" id="file" />
          <button>Sign up</button>
          {err && <span>Something went wrong..</span>}
        </form>
        <p>You have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
};
export default Register;