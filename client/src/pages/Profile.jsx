import React, { useState } from 'react'
import { postJson } from '../services/api'
import { useNavigate } from 'react-router-dom'
import '../css/Profile.css';
import img12 from "../img/Profile.jpeg";

export default function Profile() {
    return(
        <div className='Profile'>
            <img src={img12} alt="Profile" className='Profile1' />
            <div className='User'><p>Username</p></div>
            <div className='User'><p>Firstname</p></div>
            <div className='User'><p>Lastname</p></div>
            <div className='User'><p>Email</p></div>
        </div>
    )
}