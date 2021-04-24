import React from 'react';
import './Transactions.sass';

const offset = new Date().getTimezoneOffset();

export default class Transactions extends React.Component {
	transaction = [];
	state = {
		edit: null,
		editAccount: '',
		editSum: '',
		editCategory: '',
		editDate: '',
	};

	componentDidMount() {
		document.body.addEventListener('click', this.hidePopover);
	}

	componentWillUnmount() {
		document.body.removeEventListener('click', this.hidePopover);
	}

	// Filter transactions by selected date
	filteredTransactions(t) {
		switch (this.props.filter) {
			case 'date':
				return t
					.filter(task => {
						let date = new Date(task.date).setHours(0, 0, 0, 0);
						return new Date(date).toISOString() === this.props.selectedDate?.toISOString();
					})
					.sort((a, b) => new Date(b.date) - new Date(a.date));
			case 'acc':
				return t
					.filter(task => {
						return task.account === this.props.filterAcc;
					})
					.sort((a, b) => new Date(b.date) - new Date(a.date));
			default:
				return t.sort((a, b) => new Date(b.date) - new Date(a.date));
		}
	}

	// Show transactions of current month
	showedTransactions(transactions) {
		return transactions.filter(
			transaction =>
				transaction.date >= this.props.activeStartDate &&
				transaction.date < new Date(this.props.activeEndDate).toISOString()
		);
	}

	showPopover = (e, t) => {
		let date = new Date(t.date).getTime() - offset * 1000 * 60;
		e.currentTarget.contains(e.target) &&
			!e.target.closest('.transactions__popover') &&
			this.setState({
				edit: t.id,
				editAccount: t.account,
				editSum: Math.abs(t.price),
				editCategory: t.cat,
				editDate: new Date(date).toISOString().slice(0, 16),
			});
	};

	hidePopover = e => {
		if (
			(this.state.edit || this.state.edit === 0) &&
			!this.transaction.map(i => i?.contains(e.target)).includes(true)
		) {
			this.setState({ edit: null });
		}
	};

	render() {
		const renderedTrans = this.showedTransactions(
			this.filteredTransactions(this.props.transactions)
		);

		const options = {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		};
		const transactions = renderedTrans.map(t => {
			const popover = (
				<div className={`transactions__popover${this.state.edit === t.id ? ' visible' : ''}`}>
					<div className="add-expences__item">
						<label className="add-expences__label">Account:</label>
						<select
							className="add-expences__input"
							value={this.state.editAccount}
							onChange={e =>
								this.setState({
									editAccount: this.props.accounts.find(acc => acc.id === +e.target.value).id,
								})
							}
						>
							{this.props.accounts.map(acc => {
								return (
									<option value={acc.id} key={acc.id}>
										{acc.title}
									</option>
								);
							})}
						</select>
					</div>
					<div className="add-expences__item">
						<label className="add-expences__label">Sum:</label>
						<input
							className="add-expences__input"
							type="text"
							value={this.state.editSum}
							placeholder="Enter the sum"
							onChange={e => {
								const reg = /^[0-9]*\.?[0-9]{0,2}$/;
								if (e.target.value.slice(0, 1) === '0') return;
								e.target.value.match(reg) && this.setState({ editSum: e.target.value });
							}}
						/>
					</div>
					<div className="add-expences__item">
						<label className="add-expences__label">Category:</label>
						<select
							className="add-expences__input"
							value={this.state.editCategory}
							onChange={e => this.setState({ editCategory: e.target.value })}
						>
							{this.props.categories[`${t.price > 0 ? 'incomes' : 'expences'}`].map(cat => {
								return (
									<option value={cat} key={cat}>
										{cat}
									</option>
								);
							})}
						</select>
					</div>
					<div className="add-expences__item">
						<label className="add-expences__label">Date:</label>
						<input
							className="add-expences__input"
							type="datetime-local"
							value={this.state.editDate}
							onChange={e => this.setState({ editDate: e.target.value })}
						/>
					</div>

					{/* <button className="button" onClick={this.props.onEditTransaction(t)}> */}
					<button
						onClick={() => {
							this.props.onEditTransaction([
								this.state.edit,
								this.state.editAccount,
								this.state.editSum,
								this.state.editCategory,
								this.state.editDate,
							]);
							this.setState({ edit: null });
						}}
						className="button transactions__popover__button"
					>
						Save Changes
					</button>
					<button
						onClick={() => {
							this.props.onEditTransaction([
								this.state.edit,
								this.state.editAccount,
								this.state.editSum,
								this.state.editCategory,
								this.state.editDate,
								true,
							]);
							this.setState({ edit: null });
						}}
						className="button transactions__popover__button danger"
					>
						Delete
					</button>
				</div>
			);

			return (
				<div
					ref={ref => (this.transaction[t.id] = ref)}
					onClick={e => this.showPopover(e, t)}
					className="transactions__item"
					key={t.id}
				>
					<div className="transactions__item__main">
						<div className="transactions__item__cat">{t.cat}</div>
						<div className="transactions__item__date">
							{new Date(t.date).toLocaleString(window.navigator.language, options)}
						</div>
					</div>
					<div className={`transactions__item__price ${t.price > 0 ? 'income' : 'expence'}`}>
						{String(t.price).includes('.') ? Math.abs(t.price).toFixed(2) : Math.abs(t.price)}
					</div>
					{popover}
				</div>
			);
		});
		return (
			<div className="transactions">
				{transactions.length > 0 ? (
					transactions
				) : (
					<h4 className="transactions__none">You don't have any transactions yet</h4>
				)}
			</div>
		);
	}
}
