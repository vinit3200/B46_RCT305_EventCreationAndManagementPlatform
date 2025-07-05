import { createContext,useContext } from "react";
import { useState,useEffect } from "react";
import {
    collection,
    addDoc,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    where,
    onSnapshot,
    QuerySnapshot
} from "firebase/firestore";
import {db} from "../config/firebase";
import {useAuth} from "./AuthContext";

let EventsContext = createContext();

export function useEvents(){
    return useContext(EventsContext);
}

export function EventsProvider({children}){
    let [events,setEvents]=useState([]);
    let [loading,setLoading]=useState(true);
    let {currentUser}=useAuth();

    async function createEvent(eventData){
        if(!currentUser) return;
        let docRef=await addDoc(collection(db,"events"),{
            ...eventData,
            createdBy:currentUser.uid,
            createdAt:new Date(),
            attendees:[],
            rsvps:{
                attending:[],
                maybe:[],
                declined:[]
            }
        });
        return docRef.id;
    }

    async function updateEvent(eventId,updates){
        let eventRef=doc(db,"events",eventId);
        await updateDoc(eventRef,updates);
    }

    async function deleteEvent(eventId){
        await deleteDoc(doc,(db,"events",eventId));
    }

    async function rsvpToEvent(eventId,status){
        if(!currentUser) return;

        let eventRef=doc(db,"events",eventId);
        let event=events.find(e=>e.id===eventId);

        if(event){
            let updatedRsvps={
                attending:event.rsvps.attending.filter(uid=>uid!==currentUser.uid),
                maybe:event.rsvps.maybe.filter(uid=>uid!==currentUser.uid),
                declined:event.rsvps.declined.filter(uid=>uid!==currentUser.uid)
            };
            updatedRsvps[status].push(currentUser.uid);
            await updateDoc(eventRef,{rsvps:updatedRsvps});
        }
    }

    function getUserEvents(userId){
        return events.filter(event=>event.createdBy===userId);
    }

    function getUpcomingEvents(){
        let now=new Date();
        return events.filter(event=>new Date(event.date)>=now);
    }
    
    function getPastEvents(){
        let now=new Date();
        return events.filter(event=>new Date(event.date)<now);
    }

    useEffect(()=>{
        let q=query(collection(db,"events"),orderBy("date","desc"));
        let unsubscribe=onSnapshot(q,(QuerySnapshot)=>{
            let eventsData=[];
            QuerySnapshot.forEach((doc)=>{
                eventsData.push({id:doc.id, ...doc.data()});
            });
            setEvents(eventsData);
            setLoading(false);
        });
        return unsubscribe;
    },[]);

    let value={
        events, loading,
        createEvent, updateEvent, deleteEvent,
        rsvpToEvent,
        getUserEvents, getUpcomingEvents, getPastEvents
    };

    return (
        <EventsContext.Provider value={value}>
            {children}
        </EventsContext.Provider>
    );
}