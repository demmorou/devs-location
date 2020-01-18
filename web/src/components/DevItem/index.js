import React from 'react';
import { MdDeleteForever, MdEdit } from 'react-icons/md';
import { FaGithub } from 'react-icons/fa';

import api from './../../services/api';

import './styles.css';

export default function DevItem({ dev, loadDevs }) {
    async function destroy(e) {
        e.preventDefault();
    
        await api.delete(`/devs/${dev._id}`);

        await loadDevs();
    }

    return (
        <li className="dev-item">
            <header>
                <img src={dev.avatar_url} alt={dev.name} />
                <div className="user-info">
                    <strong> {dev.name} </strong>
                    <span> {dev.techs.join(', ')} </span>
                </div>
            </header>
            <p> {dev.bio} </p>
            <div className="options">
                <a title={`Editar ${dev.name}`} href=".">
                    <MdEdit size={22} />
                </a>
                <a onClick={destroy} title={`Deletar ${dev.name}`} href=".">
                    <MdDeleteForever size={22} />
                </a>
                <a href={`https://github.com/${dev.github_username}`}>
                    <FaGithub color="#333" size={22} />
                </a>
            </div>

        </li>
    );
}
