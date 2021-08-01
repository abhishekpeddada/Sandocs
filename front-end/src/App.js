// import React from 'react'
// import TextEditor from './components/TextEditor'
import {
	BrowserRouter as Router,
	// Switch,
	// Route,
	// Redirect,
} from 'react-router-dom'
// import { v4 as uuidv4 } from 'uuid'
// import Header from './components/Header'
import NavBar from './components/Home/Nav-bar'

const App = () => {
	return (
		<Router>
			{/* <Switch>
				<Route path='/' exact>
					<Redirect to={`/documents/${uuidv4()}`} />
				</Route>
				<Route path='/documents/:id' exact>
					<Header />
					<TextEditor />
				</Route>
			</Switch> */}
			<NavBar />
		</Router>
	)
}

export default App
