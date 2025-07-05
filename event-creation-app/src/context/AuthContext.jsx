import {createContext,useContext} from "react"
import {useState,useEffect} from "react";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,onAuthStateChanged,
    updateProfile
} from "firebase/auth";
import {doc,setDoc,getDoc} from "firebase/firestore";
import {auth,db} from "../config/firebase";

let AuthContext = createContext();

export function useAuth(){
    return useContext(AuthContext);
}

export function AuthProvider({children}){
   let [currentUser,setCurrentUser]=useState(null);
   let [loading,setLoading]=useState(true);
   let [userProfile,setUserProfile]=useState(null);

   async function signup (email,password,displayName){
    let userCredential = await createUserWithEmailAndPassword(auth,email,password);
    await updateProfile(userCredential.user, {displayName});
    await setDoc(doc(db,"users",userCredential.user.uid),{
        displayName,
        email,
        createdAt:new Date(),
        eventsCreated:[],
        eventsAttending:[]
    });
    return userCredential;
   }

   function login(email,password){
    return signInWithEmailAndPassword(auth,email,password);
   }

   function logout(){
    return signOut(auth);
   }

   async function getUserProfile(uid){
     let docRef = doc(db,"users",uid);
     let docSnap = await getDoc(docRef);
     if(docSnap.exists()){
        return docSnap.data();
     }
     return null;
   }

   useEffect(()=>{
    let unsubscribe = onAuthStateChanged(auth,async (user)=>{
        setCurrentUser(user);
        if(user){
            let profile = await getUserProfile(user.id);
            setUserProfile(profile);
        }else{
            setUserProfile(null);
        }
        setLoading(false);
    });
    return unsubscribe;
   },[]);

   let value = {
    currentUser,
    userProfile,
    signup,
    login,
    logout,
    getUserProfile
   };
   return (
    <AuthContext.Provider value= {value}>
        {!loading && children}
    </AuthContext.Provider>
   );
}