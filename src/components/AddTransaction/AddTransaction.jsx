import React from 'react';
import './AddTransaction.sass';
const localDate = new Date();
const offset = new Date().getTimezoneOffset();
const date = localDate.getTime() - offset * 1000 * 60;
export default class AddTransaction extends React.Component {
	state = {
		date: new Date(date).toISOString().slice(0, 16),
		sum: '',
		category: this.props.categories.expences[0],
		account: this.props.accounts[0],
		type: 'expences',
	};

	onAddedTransaction(e) {
		e.preventDefault();

		this.props.onAddedTransaction({
			cat: this.state.category,
			price: this.state.type === 'expences' ? Number(-`${this.state.sum}`) : +this.state.sum,
			date: new Date(this.state.date).toISOString(),
			id: this.props.lastestID,
			account: this.state.account.id,
		});
		this.setState({
			sum: '',
			category: this.props.categories.expences[0],
			account: this.props.accounts[0],
			type: 'expences',
		});
	}

	changeType(e) {
		this.setState({
			type: e.target.value,
			category: this.props.categories[e.target.value] && this.props.categories[e.target.value][0],
		});
	}

	render() {
		const categories =
			this.props.categories[this.state.type] &&
			this.props.categories[this.state.type].map(cat => {
				return (
					<option value={cat} key={cat}>
						{cat}
					</option>
				);
			});

		const accounts = this.props.accounts.map(acc => {
			return (
				<option value={acc.title} key={acc.title}>
					{acc.title}
				</option>
			);
		});

		return (
			<div className="add-expences">
				<h1 className="title">New Transaction</h1>

				{this.props.accounts.length > 0 ? (
					<form onSubmit={e => this.onAddedTransaction(e)}>
						<div className="add-expences__item">
							<label className="add-expences__label">Type:</label>
							<select
								className="add-expences__input"
								value={this.state.type}
								onChange={e => this.changeType(e)}
							>
								<option value="expences" key="expences">
									Expence
								</option>
								<option value="incomes" key="incomes">
									Income
								</option>
							</select>
						</div>
						<div className="add-expences__item">
							<label className="add-expences__label">Account:</label>
							<select
								className="add-expences__input"
								value={this.state.account.title}
								onChange={e =>
									this.setState({
										account: this.props.accounts.find(acc => acc.title === e.target.value),
									})
								}
							>
								{accounts}
							</select>
						</div>

						<div className="add-expences__item">
							<label className="add-expences__label">Sum:</label>
							<input
								required
								className="add-expences__input"
								type="text"
								value={this.state.sum}
								placeholder="Enter the sum"
								onChange={e => {
									const reg = /^[0-9]*\.?[0-9]{0,2}$/;
									if (e.target.value.slice(0, 1) === '0') return;
									e.target.value.match(reg) && this.setState({ sum: e.target.value });
								}}
							/>
						</div>
						{this.state.type !== 'transfer' && (
							<div className="add-expences__item">
								<label className="add-expences__label">Category:</label>
								<select
									className="add-expences__input"
									value={this.state.category}
									onChange={e => this.setState({ category: e.target.value })}
								>
									{categories}
								</select>
							</div>
						)}
						<div className="add-expences__item">
							<label className="add-expences__label">Date:</label>
							<input
								className="add-expences__input"
								type="datetime-local"
								value={this.state.date}
								onChange={e => this.setState({ date: e.target.value })}
							/>
						</div>

						<button className="button add-expences__button">Add</button>
					</form>
				) : (
					<div>Please, create new account</div>
				)}
			</div>
		);
	}
}
