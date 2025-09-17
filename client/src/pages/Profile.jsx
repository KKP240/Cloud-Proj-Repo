import React, { useState } from 'react'
import { postJson } from '../services/api'
import { useNavigate } from 'react-router-dom'
import '../css/Profile.css';
import img12 from "../img/Profile.jpeg";

export default function Profile() {
    return(
        <div className='Profile'>
            <img src={img12} alt="Profile" className='Profile1' />
            <div className='User'><h3>Username: </h3> <h3>ibetfinnz</h3></div>
            <div className='Firstname'><h3>Firstname: </h3><h3>Tibet</h3></div>
            <div className='Surname'><h3>Surname: </h3><h3>Sawangkan</h3></div>
            <div className='Email'><h3>Email: </h3><h3>ibetfinnz@gmail.com</h3></div>
        </div>
    )
}