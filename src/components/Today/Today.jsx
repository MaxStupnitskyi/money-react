import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import AddTransaction from '../AddTransaction/AddTransaction';
import Transactions from '../Transactions/Transactions';
import './Today.sass';

const startDate = new Date(new Date().setDate(1)).toISOString();
export default class Today extends React.Component {
	state = {
		selectedDate: null,
		filter: null,
		activeStartDate: startDate,
		activeEndDate: new Date(
			new Date(startDate).setMonth(new Date(startDate).getMonth() + 1)
		).toISOString(),
	};

	// Push to state selected date when click on calendar day
	onChangeDate(date) {
		this.setState({ selectedDate: date });
	}

	// Apply day filter or deny it if clicked on selected day
	onSelectDay(_day, e) {
		if (e.currentTarget.classList.contains('react-calendar__tile--active')) {
			this.setState({ filter: null });
			e.currentTarget.classList.remove('react-calendar__tile--active');
		} else {
			e.currentTarget.classList.add('react-calendar__tile--active');
			this.setState({ filter: 'date' });
		}
	}

	// Deny filter by date when switching month
	changeMonth(activeStartDate) {
		const date = new Date(activeStartDate).setMonth(activeStartDate.getMonth() + 1);
		this.setState({
			activeStartDate: new Date(activeStartDate).toISOString(),
			activeEndDate: new Date(date).toISOString(),
			filter: null,
		});
	}

	// Add mark to days with transactions
	markActiveDays(date, view) {
		const dates = new Set();
		this.props.transactions.forEach(i => {
			dates.add(new Date(i.date).setHours(0, 0, 0, 0));
		});
		return (
			view === 'month' &&
			Array.from(dates).map(i => {
				return new Date(date).getTime() === new Date(new Date(i)).getTime() ? (
					<div className="mark" key={date}></div>
				) : null;
			})
		);
	}

	componentDidUpdate() {
		localStorage.setItem('transactions', JSON.stringify(this.props.transactions));
		localStorage.setItem('accounts', JSON.stringify(this.props.accounts));
	}

	render() {
		return (
			<div className="today">
				<Calendar
					minDetail="year"
					showNeighboringMonth={false}
					onChange={date => this.onChangeDate(date)}
					onClickDay={(day, e) => this.onSelectDay(day, e)}
					value={this.state.selectedDate}
					onActiveStartDateChange={({ activeStartDate }) => this.changeMonth(activeStartDate)}
					tileContent={({ date, view }) => this.markActiveDays(date, view)}
				/>
				<div className="today__transactions">
					<h1 className="title">Transactions</h1>
					<Transactions
						activeStartDate={this.state.activeStartDate}
						activeEndDate={this.state.activeEndDate}
						transactions={this.props.transactions}
						filter={this.state.filter}
						selectedDate={this.state.selectedDate}
						accounts={this.props.accounts}
						categories={this.props.categories}
						onEditTransaction={this.props.onEditTransaction}
					/>
				</div>
				<AddTransaction
					onAddedTransaction={this.props.onAddedTransaction}
					categories={this.props.categories}
					accounts={this.props.accounts}
					lastestID={this.props.lastestID}
				/>
			</div>
		);
	}
}
