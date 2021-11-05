import { Link } from 'react-router-dom'
import React from 'react'
import Menu from './Menu'
import logo from '../../assests/logo.svg'
import '../../styles/navbar.scss'

const NavBar = () => {
	return (
		<div className='nav-bar'>
			<img className='logo' src={logo} alt='SanDocs' />
			<div className='btn-group'>
				<Link className='auth-btn' to='/login'>
					Sign in
				</Link>
				<Link className='auth-btn' to='/register'>
					Sign up
				</Link>
			</div>
			<Menu />
		</div>
	)
}

export default NavBar
