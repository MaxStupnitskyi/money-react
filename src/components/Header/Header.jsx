import React from 'react';
import './Header.sass';
import { NavLink } from 'react-router-dom';

export default class Header extends React.Component {
	render() {
		return (
			<div className="header">
				<nav className="nav">
					<NavLink className="nav__item" activeClassName="selected" to="/" exact>
						Today
					</NavLink>
					<NavLink className="nav__item" activeClassName="selected" to="/balance">
						Balance
					</NavLink>
					<NavLink className="nav__item" activeClassName="selected" to="/budget">
						Budget
					</NavLink>
					<NavLink className="nav__item" activeClassName="selected" to="/report">
						Report
					</NavLink>
				</nav>
			</div>
		);
	}
}
