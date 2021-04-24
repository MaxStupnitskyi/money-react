import React from 'react';
// import Transactions from '../Transactions/Transactions';
import './Report.sass';
import arrow from '../../img/angle.svg';

let startDate = new Date().setDate(1);
const timezone = new Date(startDate).getTimezoneOffset() / 60;
startDate = new Date(startDate).setHours(-timezone, 0, 0, 0);

let key = 0;
const generateKey = () => key++;

function ReportType({ value, title, width, onSelected }) {
	return (
		<button
			onClick={onSelected}
			className={`report__block ${title.toLowerCase()}`}
			style={{ width: `${width}%` }}
		>
			<div>{title}</div> <div>{value}</div>
		</button>
	);
}

export default class Report extends React.Component {
	state = {
		activeStartDate: new Date(startDate).toISOString(),
		activeEndDate: new Date().toISOString(),
		showDetail: false,
	};

	showBudget(type) {
		let moves = this.props.transactions;
		moves = moves.filter(move => {
			return (
				move.date >= this.state.activeStartDate &&
				move.date < new Date(this.state.activeEndDate).toISOString()
			);
		});

		return type === 'expences'
			? moves.filter(move => move.price < 0)
			: moves.filter(move => move.price > 0);

		// return moves.reduce((sum, move) => sum + Math.abs(move.price), 0).toFixed(2);
	}

	setDetail(cats) {
		if (!cats.length > 0) return;
		this.setState({ showDetail: cats[0].price > 0 ? 'incomes' : 'expences' });
	}

	showDetail(cats) {
		const uniqueCategories = {};
		cats.forEach(cat => {
			uniqueCategories.hasOwnProperty(cat.cat)
				? (uniqueCategories[cat.cat] += Math.abs(cat.price))
				: (uniqueCategories[cat.cat] = Math.abs(cat.price));
		});

		const sortedCategories = Object.entries(uniqueCategories).sort(
			(a, b) => Math.abs(b[1]) - Math.abs(a[1])
		);

		const html = sortedCategories.map(cat => {
			const width =
				cat[1] === sortedCategories[0][1]
					? 100
					: (Math.abs(cat[1]) * 100) / Math.abs(sortedCategories[0][1]);
			return (
				<div
					className={`report__block ${
						this.state.showDetail === 'incomes' ? 'incomes' : 'expences'
					}`}
					style={{ width: `${width}%` }}
					key={generateKey()}
				>
					<div>{cat[0]}</div>
					<div>{String(cat[1]).includes('.') ? cat[1].toFixed(2) : cat[1]}</div>
					{/* {`${cat[0]}: ${Math.abs(cat[1])}`} */}
				</div>
			);
		});
		return <div>{html}</div>;
	}

	backToOverall() {
		this.setState({ showDetail: false });
	}

	render() {
		const expences = this.showBudget('expences');
		const incomes = this.showBudget('incomes');

		const expencesSum = Number(
			expences.reduce((sum, move) => sum + Math.abs(move.price), 0).toFixed(2)
		);
		const incomesSum = Number(
			incomes.reduce((sum, move) => sum + Math.abs(move.price), 0).toFixed(2)
		);

		let incomesWidth = 50,
			expencesWidth = 50;
		if (incomesSum > expencesSum) {
			[incomesWidth, expencesWidth] = [100, (expencesSum * 100) / incomesSum];
		}
		if (incomesSum < expencesSum) {
			[incomesWidth, expencesWidth] = [(incomesSum * 100) / expencesSum, 100];
		}

		return (
			<div>
				<div className="transactions__filter">
					<input
						type="date"
						value={this.state.activeStartDate.slice(0, 10)}
						onChange={e => {
							this.setState({
								activeStartDate: new Date(e.target.value).toISOString(),
							});
						}}
					/>
					<span>—</span>
					<input
						type="date"
						value={this.state.activeEndDate.slice(0, 10)}
						min={this.state.activeStartDate.slice(0, 10)}
						onChange={e => {
							this.setState({
								activeEndDate: new Date(
									new Date(e.target.value).setHours(23, 59, 59, 999)
								).toISOString(),
							});
						}}
					/>
				</div>
				<div className="report__content">
					{!this.state.showDetail && (
						<>
							<div className="incomes">
								<ReportType
									title="Incomes"
									value={incomesSum}
									width={incomesWidth || 0}
									onSelected={() => this.setDetail(incomes)}
								/>
							</div>
							<div className="expences">
								<ReportType
									onSelected={() => this.setDetail(expences)}
									title="Expences"
									value={expencesSum}
									width={expencesWidth || 0}
								/>
							</div>
						</>
					)}

					{this.state.showDetail === 'incomes' && (
						<div>
							<button onClick={() => this.backToOverall()}>
								<img src={arrow} alt="back" style={{ width: '10px' }} />
							</button>
							{this.showDetail(incomes)}
						</div>
					)}

					{this.state.showDetail === 'expences' && (
						<div>
							<button onClick={() => this.backToOverall()}>
								<img src={arrow} alt="back" style={{ width: '10px' }} />
							</button>
							{this.showDetail(expences)}
						</div>
					)}
				</div>
			</div>
		);
	}
}
