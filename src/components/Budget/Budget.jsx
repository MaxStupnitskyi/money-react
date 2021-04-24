import React from 'react';
import Calendar from 'react-calendar';
import Transactions from '../Transactions/Transactions';
import './Budget.sass';

const startDate = new Date(new Date().setDate(1)).toISOString();
export default class Budget extends React.Component {
	state = {
		activeStartDate: startDate,
		activeEndDate: new Date(
			new Date(startDate).setMonth(new Date(startDate).getMonth() + 1)
		).toISOString(),
		filter: null,
		showedTransactions: [],
		activeCategory: null,
		showEdit: false,
	};

	filterTransactions(type) {
		const html = this.props.categories[type]
			.map(cat => {
				const catTransactions = this.props.transactions.filter(
					t =>
						t.cat === cat &&
						t.date >= this.state.activeStartDate &&
						t.date < this.state.activeEndDate
				);

				const total =
					catTransactions.length > 0
						? catTransactions.reduce((sum, t) => sum + Math.abs(t.price), 0)
						: 0;
				const button = (
					<div className="category__wrap" key={cat} total={total}>
						<button
							className={`category${this.state.activeCategory === cat ? ' active' : ''}${
								this.state.showEdit ? ' editable' : ''
							}`}
							onClick={() => {
								this.showTransactions(catTransactions);
								this.setState({ activeCategory: cat });
							}}
						>
							<div className="category__title">{cat}</div>
							<div className="category__total">
								{String(total).includes('.') ? total.toFixed(2) : total}
							</div>
						</button>
						{this.state.showEdit && (
							<button
								className="delete-category"
								onClick={() => this.props.deleteCategory([type, cat, total])}
							>
								-
							</button>
						)}
					</div>
				);
				return this.state.showEdit ? button : catTransactions.length > 0 && button;
			})
			.filter(i => i !== false)
			.sort((a, b) => b.props.total - a.props.total);
		const monthTotal = html.reduce((sum, i) => sum + i.props.total, 0).toFixed(2);
		return { html, monthTotal };
	}

	showTransactions(catTransactions) {
		this.setState({
			showedTransactions: catTransactions,
		});
	}

	changeMonth(activeStartDate) {
		const date = new Date(activeStartDate).setMonth(activeStartDate.getMonth() + 1);
		this.setState({
			activeStartDate: new Date(activeStartDate).toISOString(),
			activeEndDate: new Date(date).toISOString(),
			showedTransactions: [],
			activeCategory: null,
		});
	}

	toggleCategories() {
		this.setState(({ showEdit }) => {
			return {
				showEdit: !showEdit,
			};
		});
	}

	componentDidUpdate() {
		localStorage.setItem('accounts', JSON.stringify(this.props.accounts));
		localStorage.setItem('transactions', JSON.stringify(this.props.transactions));
	}

	render() {
		const expences = this.filterTransactions('expences');
		const incomes = this.filterTransactions('incomes');

		return (
			<div className="budget">
				<div className="calendar">
					<Calendar
						minDetail="month"
						onActiveStartDateChange={({ activeStartDate }) => this.changeMonth(activeStartDate)}
					/>
				</div>
				<button className="button edit" onClick={() => this.toggleCategories()}>
					{this.state.showEdit ? 'Done' : 'Edit'}
				</button>
				<div className="budget__content">
					<div
						className="budget__categories"
						style={
							this.state.showedTransactions.length > 0
								? { flexBasis: '60%' }
								: { flexBasis: '100%' }
						}
					>
						<div className="budget__category expences">
							<div className="budget__category__header">
								<h1 className="title">Expences</h1>
								<div className="total">{expences.monthTotal}</div>
							</div>
							<div className="categories">
								{expences.html}
								{this.state.showEdit && (
									<button
										onClick={() => this.props.onCategoryAdded('expence')}
										className="category"
									>
										Add Category
									</button>
								)}
							</div>
						</div>
						<div className="budget__category incomes">
							<div className="budget__category__header">
								<h1 className="title">Incomes</h1>
								<div className="total">{incomes.monthTotal}</div>
							</div>
							<div className="categories">
								{incomes.html}
								{this.state.showEdit && (
									<button onClick={() => this.props.onCategoryAdded('income')} className="category">
										Add Category
									</button>
								)}
							</div>
						</div>
						<div className="budget__footer">
							<h1 className="title">Balance:</h1>
							<div className="total">{(incomes.monthTotal - expences.monthTotal).toFixed(2)}</div>
						</div>
					</div>
					<div
						className="budget__transactions"
						style={
							this.state.showedTransactions.length > 0
								? { flexBasis: '40%', display: 'block' }
								: { display: 'none' }
						}
					>
						<Transactions
							transactions={this.state.showedTransactions}
							activeStartDate={this.state.activeStartDate}
							activeEndDate={this.state.activeEndDate}
							onEditTransaction={this.props.onEditTransaction}
							accounts={this.props.accounts}
							categories={this.props.categories}
						/>
					</div>
				</div>
			</div>
		);
	}
}
