import React from 'react'
import '../../styles/hero.scss'

const Hero = () => {
	return (
		<div className='container'>
			{/* <h1>SanDocs</h1> */}
			<h2>
				A collabrative online document editor.
				<br />
				Create and share online documents using rich text editor.
			</h2>
			<button className='btn'>{'Get started ->'}</button>
		</div>
	)
}

export default Hero
