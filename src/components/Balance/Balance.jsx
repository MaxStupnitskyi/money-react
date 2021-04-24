import React from 'react';
import Transactions from '../Transactions/Transactions';
import './Balance.sass';

let startDate = new Date().setDate(1);
const timezone = new Date(startDate).getTimezoneOffset() / 60;
startDate = new Date(startDate).setHours(-timezone, 0, 0, 0);
export default class Balance extends React.Component {
	state = {
		showEdit: false,
		title: '',
		balance: '',
		activeStartDate: new Date(startDate).toISOString(),
		activeEndDate: new Date().toISOString(),
		filter: null,
		filterAcc: null,

		deleteAccount: false,
		deletedAccount: null,
	};

	onAccountAdded(e) {
		e.preventDefault();
		this.props.onAccountAdded({ title: this.state.title, balance: this.state.balance });
		this.setState({ title: '', balance: '' });
	}

	componentDidUpdate() {
		localStorage.setItem('accounts', JSON.stringify(this.props.accounts));
		localStorage.setItem('transactions', JSON.stringify(this.props.transactions));
	}

	confirmAccountDelete(e, id) {
		e.stopPropagation();
		this.setState({ deleteAccount: true, deletedAccount: id });
	}

	render() {
		const accounts = this.props.accounts.map(acc => {
			return (
				<div
					onClick={() =>
						this.setState(state => {
							return {
								filter: state.filter !== null && state.filterAcc === acc.id ? null : 'acc', // { filter: 'acc', filterAcc: acc.id }
								filterAcc: state.filterAcc === acc.id ? null : acc.id,
							};
						})
					}
					key={acc.title}
					className="account"
				>
					<div>
						<div className="account__title">{acc.title}</div>
						<div className="account__balance">
							{String(acc.balance).includes('.') ? acc.balance.toFixed(2) : acc.balance}
						</div>
					</div>
					<div>
						{acc.id === this.state.filterAcc ? '✓  ' : ''}
						{this.state.showEdit && (
							<button
								className="account__delete"
								onClick={e => this.confirmAccountDelete(e, acc.id)}
							>
								-
							</button>
						)}
					</div>
				</div>
			);
		});
		return (
			<div className="balance">
				<div className="balance__accounts">
					<h1 className="title">Accounts</h1>
					{accounts}
					<button
						className="button edit"
						onClick={() => this.setState({ showEdit: !this.state.showEdit })}
					>
						{this.state.showEdit ? 'Done' : 'Edit'}
					</button>
					{this.state.showEdit && (
						<form className="add-account" onSubmit={e => this.onAccountAdded(e)}>
							<label className="add-account__title">Create new Account</label>
							<input
								type="text"
								placeholder="Title"
								autoFocus
								required
								value={this.state.title}
								onChange={e => this.setState({ title: e.target.value })}
							/>
							<input
								type="text"
								required
								placeholder="Balance"
								value={this.state.balance}
								onChange={e => {
									const reg = /^[0-9]*\.?[0-9]{0,2}$/;
									e.target.value.match(reg) && this.setState({ balance: e.target.value });
								}}
							/>
							<button className="button">Add</button>
						</form>
					)}
				</div>
				<div className="balance__transactions">
					<div className="transactions__filter">
						<input
							type="date"
							value={this.state.activeStartDate.slice(0, 10)}
							onChange={e => {
								this.setState({ activeStartDate: new Date(e.target.value).toISOString() });
							}}
						/>
						<span>—</span>
						<input
							type="date"
							value={this.state.activeEndDate.slice(0, 10)}
							min={this.state.activeStartDate.slice(0, 10)}
							onChange={e => {
								this.setState({ activeEndDate: new Date(e.target.value).toISOString() });
							}}
						/>
					</div>
					<Transactions
						activeStartDate={this.state.activeStartDate}
						activeEndDate={this.state.activeEndDate}
						transactions={this.props.transactions}
						filter={this.state.filter}
						filterAcc={this.state.filterAcc}
						onEditTransaction={this.props.onEditTransaction}
						accounts={this.props.accounts}
						categories={this.props.categories}
					/>
				</div>
				{this.state.deleteAccount && (
					<>
						<div className="overlay" onClick={() => this.setState({ deleteAccount: false })}></div>
						<div className="modal deleteAccount">
							<h3 className="modal__title">
								Are you sure you want to delete account? All account transactions will be deleted
								too
							</h3>
							<div className="modal__buttons">
								<button
									onClick={() => {
										this.props.deleteAccount(this.state.deletedAccount);
										this.setState({ deleteAccount: false });
									}}
									className="button modal__button danger"
								>
									Delete account
								</button>

								<button
									className="button modal__button"
									onClick={() => this.setState({ deleteAccount: false })}
								>
									Cancel
								</button>
							</div>
						</div>
					</>
				)}
			</div>
		);
	}
}
