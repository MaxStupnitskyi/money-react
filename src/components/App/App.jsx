import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import './App.sass';

import Header from '../Header/Header';

import Today from '../Today/Today';
import Balance from '../Balance/Balance';
import Budget from '../Budget/Budget';
import Report from '../Report/Report';

export default class App extends React.Component {
	state = {
		transactions: JSON.parse(localStorage.getItem('transactions')) || [],
		categories: JSON.parse(localStorage.getItem('categories')) || {
			expences: [
				'Food',
				'Travel',
				'Health',
				'Car',
				'House',
				'Gifts',
				'Entertainment',
				'Restaurants, cafe',
			],
			incomes: ['Salary', 'Dividend', 'Gift'],
		},
		accounts: JSON.parse(localStorage.getItem('accounts')) || [
			{ title: 'Cash', balance: 0, id: 0 },
		],

		addNewCategory: false,
		newCategoryType: null,
		addCategoryValue: '',

		deleteCategory: false,
		deletedCategory: null,
		moveTransactionsTo: null,

		showError: 'hidden',
	};

	onAddedTransaction(t) {
		this.setState(state => {
			const acc = t.account;
			const changedAccIdx = state.accounts.findIndex(account => account.id === acc);
			let changedAcc = { ...state.accounts[changedAccIdx] };
			changedAcc.balance = +changedAcc.balance + +t.price;
			return {
				transactions: [...state.transactions, t],
				accounts: [
					...state.accounts.slice(0, changedAccIdx),
					changedAcc,
					...state.accounts.slice(changedAccIdx + 1),
				],
			};
		});
	}

	onAccountAdded(acc) {
		this.setState(({ accounts }) => {
			return {
				accounts: [
					...accounts,
					{
						title: acc.title,
						balance: acc.balance,
						id: accounts.slice(-1)[0]?.id + 1 || 0,
					},
				],
			};
		});
	}

	onCategoryAdded(type) {
		this.setState({ addNewCategory: true, newCategoryType: type });
	}

	/* async onAccountAdded(e) {
		e.preventDefault();
		const account = await this.props.accounts.find(acc => acc.title === this.state.title);
		this.setState({ showError: account ? '' : 'hidden' });
		if (this.state.showError !== '') {
			this.props.onAccountAdded({ title: this.state.title, balance: this.state.balance });
			this.setState({ title: '', balance: '', showError: 'hidden' });
		}
	} */

	async addCategory(e) {
		e.preventDefault();
		const category = await this.state.categories[`${this.state.newCategoryType}s`].find(
			cat => cat === this.state.addCategoryValue
		);
		this.setState({ showError: category ? '' : 'hidden' });

		if (this.state.showError !== '') {
			this.setState(state => {
				let categories = state.categories;
				if (state.newCategoryType === 'income') {
					categories = {
						expences: state.categories.expences,
						incomes: [...state.categories.incomes, state.addCategoryValue],
					};
				}
				if (state.newCategoryType === 'expence') {
					categories = {
						expences: [...state.categories.expences, state.addCategoryValue],
						incomes: state.categories.incomes,
					};
				}

				localStorage.setItem('categories', JSON.stringify(categories));

				return {
					categories: categories,
					addNewCategory: false,
					newCategoryType: null,
					addCategoryValue: '',
				};
			});
		}
	}

	generateID() {
		return this.state.transactions.length > 0 ? this.state.transactions.length : 0;
	}

	onCategoryDeleted(cat) {
		this.setState(state => {
			return {
				deleteCategory: !this.state.deleteCategory,
				deletedCategory: cat,
				moveTransactionsTo:
					state.categories[cat[0]][0] !== cat[1]
						? state.categories[cat[0]][0]
						: state.categories[cat[0]][1],
			};
		});
	}

	deleteCategory(e, [type, cat], to) {
		e.preventDefault();

		const deleted = this.state.categories[type].findIndex(i => i === cat);

		this.setState(
			state => {
				const trans = state.transactions;
				const transChanged = trans
					.filter(t => t.cat === cat)
					.map(t => {
						return { ...t, cat: to };
					});
				const transOld = trans.filter(t => {
					return t.cat !== cat;
				});
				const newTrans = [...transChanged, ...transOld];
				return {
					categories:
						type === 'expences'
							? {
									expences: [
										...state.categories.expences.slice(0, deleted),
										...state.categories.expences.slice(deleted + 1),
									],
									incomes: state.categories.incomes,
							  }
							: {
									expences: state.categories.expences,
									incomes: [
										...state.categories.incomes.slice(0, deleted),
										...state.categories.incomes.slice(deleted + 1),
									],
							  },
					transactions: newTrans,
					deleteCategory: false,
				};
			},
			() => {
				localStorage.setItem('categories', JSON.stringify(this.state.categories));
				localStorage.setItem('transactions', JSON.stringify(this.state.transactions));
			}
		);
	}

	onEditTransaction([id, account, price, cat, date, deleted = false]) {
		const editedTransIdx = this.state.transactions.findIndex(trans => trans.id === id);
		const editedTrans = {
			cat,
			price: this.state.transactions[editedTransIdx].price > 0 ? +price : -price,
			date,
			id,
			account,
		};
		const editedAccIdx = this.state.accounts.findIndex(acc => acc.id === account);
		const editedAcc = { ...this.state.accounts[editedAccIdx] };
		if (deleted) {
			editedAcc.balance = editedAcc.balance -= this.state.transactions[editedTransIdx].price;
		}
		if (!deleted) {
			editedAcc.balance =
				this.state.transactions[editedTransIdx].price > 0
					? (editedAcc.balance += this.state.transactions[editedTransIdx].price - price)
					: (editedAcc.balance -= this.state.transactions[editedTransIdx].price + +price);
		}

		const newTransactions = deleted
			? [
					...this.state.transactions.slice(0, editedTransIdx),
					...this.state.transactions.slice(editedTransIdx + 1),
			  ]
			: [
					...this.state.transactions.slice(0, editedTransIdx),
					editedTrans,
					...this.state.transactions.slice(editedTransIdx + 1),
			  ];
		this.setState(({ accounts }) => {
			return {
				transactions: newTransactions,
				accounts: [
					...accounts.slice(0, editedAccIdx),
					editedAcc,
					...accounts.slice(editedAccIdx + 1),
				],
			};
		});
	}

	deleteAccount(id) {
		const deleted = this.state.accounts.findIndex(acc => acc.id === id);

		const newTransactions = this.state.transactions.slice(0).filter(t => t.account !== id);

		this.setState(({ accounts }) => {
			return {
				accounts: [...accounts.slice(0, deleted), ...accounts.slice(deleted + 1)],
				transactions: newTransactions,
			};
		});
	}

	render() {
		const id = this.generateID();
		return (
			<Router basename={'money-react'}>
				<div className="app">
					<Header />
					<Switch>
						<Route path="/" exact>
							<Today
								transactions={this.state.transactions}
								categories={this.state.categories}
								accounts={this.state.accounts}
								onAddedTransaction={t => this.onAddedTransaction(t)}
								lastestID={id}
								onEditTransaction={data => this.onEditTransaction(data)}
							/>
						</Route>
						<Route path="/balance">
							<Balance
								accounts={this.state.accounts}
								onAccountAdded={acc => this.onAccountAdded(acc)}
								transactions={this.state.transactions}
								categories={this.state.categories}
								onEditTransaction={data => this.onEditTransaction(data)}
								deleteAccount={acc => this.deleteAccount(acc)}
							/>
						</Route>

						<Route path="/budget">
							<Budget
								onCategoryAdded={type => this.onCategoryAdded(type)}
								categories={this.state.categories}
								transactions={this.state.transactions}
								deleteCategory={cat => this.onCategoryDeleted(cat)}
								accounts={this.state.accounts}
								onEditTransaction={data => this.onEditTransaction(data)}
							/>
						</Route>

						<Route path="/report">
							<Report transactions={this.state.transactions} />
						</Route>
					</Switch>
					{this.state.addNewCategory && (
						<>
							<div
								className="overlay"
								onClick={() => this.setState({ addNewCategory: false })}
							></div>
							<div className="modal newCategory">
								<h3 className="modal__title">Please, enter the name of the category</h3>
								<form className="modal__form" onSubmit={e => this.addCategory(e)}>
									<input
										type="text"
										placeholder="Type new category name"
										value={this.state.addCategoryValue}
										onChange={e => this.setState({ addCategoryValue: e.target.value })}
									/>
									<div className={`error-msg ${this.state.showError}`}>
										Please, use unique name for category
									</div>
									<button type="submit" className="button modal__button">
										Add
									</button>
								</form>
							</div>
						</>
					)}
					{this.state.deleteCategory && (
						<>
							<div
								className="overlay"
								onClick={() => this.setState({ deleteCategory: false })}
							></div>
							<div className="modal deleteCategory">
								{this.state.categories[this.state.deletedCategory[0]].length <= 1 ? (
									<>
										<h3 className="modal__title">You can't delete your last category</h3>
										<div className="modal__buttons">
											<button
												onClick={() => this.setState({ deleteCategory: false })}
												className="button modal__button"
											>
												Got it
											</button>
										</div>
									</>
								) : (
									<form
										className="modal__form"
										onSubmit={e =>
											this.deleteCategory(
												e,
												this.state.deletedCategory,
												this.state.moveTransactionsTo
											)
										}
									>
										{this.state.deletedCategory[2] === 0 ? (
											<h3 className="modal__title">Are you sure you want to delete category?</h3>
										) : (
											<>
												<h3 className="modal__title">
													Please, select category for moving transactions
												</h3>
												<select
													onChange={e => this.setState({ moveTransactionsTo: e.target.value })}
												>
													{this.state.categories[this.state.deletedCategory[0]]
														.filter(cat => cat !== this.state.deletedCategory[1])
														.map(cat => {
															return (
																<option value={cat} key={cat}>
																	{cat}
																</option>
															);
														})}
												</select>
											</>
										)}
										<div className="modal__buttons">
											<button
												disabled={this.state.categories[this.state.deletedCategory[0]].length <= 1}
												type="submit"
												className="button danger"
											>
												Delete category
											</button>
											<button
												type="button"
												className="button"
												onClick={() => this.setState({ deleteCategory: false })}
											>
												Cancel
											</button>
										</div>
									</form>
								)}
							</div>
						</>
					)}
				</div>
			</Router>
		);
	}
}
