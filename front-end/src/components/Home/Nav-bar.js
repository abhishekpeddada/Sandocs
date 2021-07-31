import React from 'react'
import { Link } from 'react-router-dom'
import { FaBars } from 'react-icons/fa'
import '../../styles/header.scss'
import logo from '../assests/favicon.svg'

const Header = () => {
	return (
		<>
			<nav className='nav-bar'>
				<Link to='/' className='logo'>
					<img className='logo-img' src={logo} alt='SanDocs' />
					<span className='title'>anDocs</span>
				</Link>

				<FaBars className='fa-bars' />

				<div className='menu'>
					<Link to='/' className='menu-link' activeClassName='active'>
						Home
					</Link>
					<Link to='/about' className='menu-link' activeClassName='active'>
						About
					</Link>
					<Link to='/contact' className='menu-link' activeClassName='active'>
						Contact
					</Link>
					<Link to='/login' className='menu-link' activeClassName='active'>
						Sign in
					</Link>
				</div>
				<button className='nav-btn'>
					<Link to='/register' className='nav-btn-link'>
						Sign Up
					</Link>
				</button>
			</nav>
		</>
	)
}

export default Header
