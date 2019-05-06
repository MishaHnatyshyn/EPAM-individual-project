import React from 'react';
import axios from 'axios';
import LotCard from './LotCard';
import Pagination from "./Pagination";

const availablePaymentMethods = ['Cash', 'Visa', 'Mastercard', 'PayPal', 'Other'];
const availableDeliveryMethods = ['Post office', 'Personal meeting', 'Courier', 'Other'];

const CheckBox = ({id, name, checked, handler, label, value}) => (
  <label className="check-box-container">
    {label}
    <input type="checkbox"  name={name} id={id} value={value} checked={checked} onChange={handler} />
    <span className="checkmark" />
  </label>
)

const RadioButton = ({id, name, checked, handler, label, value}) => (
  <label className="radio-button-container">
    {label}
    <input type="radio" name={name} id={id} value={value} checked={checked} onChange={handler} />
    <span className="checkmark"/>
  </label>
)

export default class Lots extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lots: [],
      priceFrom: 0,
      priceTo: 0,
      activePage: 1,
      name: '',
      selectedPaymentMethods: [],
      selectedDeliveryMethods: [],
      pagesCount: 0,
      visibleLots: [],
      category: '',
      sortBy: null,
      displayFilters: false
    };
    this.sortFuncs = {
      dateAZ: { timestamp: 1 },
      dateZA:  { timestamp: -1 },
      priceAZ: { startPrice: 1 },
      priceZA: { startPrice: -1 },
      nameAZ: { name: 1 },
      nameZA: { name: -1 },
    }
    this.requestTimeout = null;
  }

  delayRequest = () => {
    this.clearPrevRequestDelay()
    this.requestTimeout = setTimeout(this.updateVisibleLots, 400)
  }

  clearPrevRequestDelay = () => {
    clearTimeout(this.requestTimeout)
  }

  componentDidMount = () => {
    const { category } = this.props;
    if (category) {
      this.setState({ category: category.replace(/-/g, ' ') }, this.fetchPage)

    }
    else this.fetchPage()
  }

  changeSortFunc = (e) => {
    const func = e.target.value;
    this.setState({ sortBy: this.sortFuncs[func] }, this.updateVisibleLots)
  }

  fetchPage = (page = 1) => {
    const {
      priceFrom,
      priceTo,
      selectedPaymentMethods,
      selectedDeliveryMethods,
      category,
      sortBy,
      name
    } = this.state;
    axios.post('/api/lots/filter',{
      priceFrom,
      priceTo,
      selectedPaymentMethods,
      selectedDeliveryMethods,
      category,
      sortBy,
      name,
      page
    }).then((res) => {
      const { lots, pagesCount } = res.data;
      this.setState({
        activePage: page,
        lots,
        pagesCount
      })
    }).catch((err) => {})
  }

  updateVisibleLots = () => {
    this.fetchPage()
  }

  changePriceRange = (e) => {
    e.preventDefault()
    const { name, value } = e.target;
    if (!value.match(/^[0-9]*$/) || value[0] === '0') return;
    this.setState({ [name]: value }, this.delayRequest)
  }

  changeActivePage = (page) => {
    this.fetchPage(page)
  }

  handlePaymentChange = payment => event => {
    const currentPaymentMethods = [...this.state.selectedPaymentMethods];
    if (currentPaymentMethods.includes(payment)) {
      currentPaymentMethods.splice(currentPaymentMethods.indexOf(payment), 1)
    } else currentPaymentMethods.push(payment)
    console.log(currentPaymentMethods)
    this.setState({ selectedPaymentMethods: currentPaymentMethods}, this.updateVisibleLots)
  }

  handleDeliveryChange = delivery => event => {
    const currentDeliveryMethods = [...this.state.selectedDeliveryMethods];
    if (currentDeliveryMethods.includes(delivery)) {
      currentDeliveryMethods.splice(currentDeliveryMethods.indexOf(delivery), 1)
    } else currentDeliveryMethods.push(delivery)
    this.setState({ selectedDeliveryMethods: currentDeliveryMethods}, this.updateVisibleLots)
  }

  handleCategoryChange = (e) => {
    this.setState({ category: e.target.value }, this.updateVisibleLots)
  }

  toggleFilters = () => {
    this.setState((prevState) => ({ displayFilters: !prevState.displayFilters }))
  }

  changeName = (e) => {
    this.setState({ name: e.target.value }, this.delayRequest)
  }

  render() {
    const {
      lots,
      activePage,
      selectedPaymentMethods,
      selectedDeliveryMethods,
      pagesCount,
      priceFrom,
      priceTo,
      category,
      displayFilters,
      name
    } = this.state;

    return (
      <section className="lots-section">
        <div className="lots-list-content lots-container">
          <section className="filters">
            <div className={`filters-container ${displayFilters ? '' : 'mobile-hide'}`}>
              <h2>
                Filters
                <span>
                  {displayFilters
                    ? <i onClick={this.toggleFilters} className="fas fa-times"/>
                    : <i onClick={this.toggleFilters} className="fas fa-angle-down" />
                  }
                </span>
              </h2>

              <div className="filter-container">
                <div className="filter-title">Category</div>
                <div className="filter-list">
                  <select name="category" id="category" value={category} onChange={this.handleCategoryChange}>
                    <option value="">All</option>
                    <option>Art</option>
                    <option>Household appliances</option>
                    <option>Clothing</option>
                    <option>Electronics</option>
                    <option>Drinks</option>
                    <option>Jewelry</option>
                    <option>Furniture</option>
                    <option>Coins</option>
                    <option>Stamps</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>


              <div className="filter-container">
                <div className="filter-title">Price</div>
                <div className="filter-list">
                  <div>
                    <RadioButton id="priceAZ" name="sort" value="priceAZ" label="From lower to higher" handler={this.changeSortFunc}/>
                  </div>
                  <div>
                    <RadioButton id="priceZA" name="sort" value="priceZA" label="From higher to lower" handler={this.changeSortFunc}/>
                  </div>
                  <div className="price-range">
                    <div>
                      <input type="text" placeholder="From" id="price-from" name="priceFrom" value={priceFrom || ''} onChange={this.changePriceRange}/>-
                      <input type="text" placeholder="To" id="price-to" name="priceTo" value={priceTo || ''} onChange={this.changePriceRange}/>
                    </div>
                  </div>
                </div>
              </div>
              <div className="filter-container">
                <div className="filter-title">Name</div>
                <div className="filter-list">
                  <div>
                    <RadioButton id="nameAZ" value="nameAZ" name="sort" label="From A to Z" handler={this.changeSortFunc}/>
                  </div>
                  <div>
                    <RadioButton id="nameZA" value="nameZA" name="sort" label="From Z to A" handler={this.changeSortFunc}/>
                  </div>
                </div>
                <div className="price-range name-contains">
                  <div>
                    <input type="text" placeholder="Match" id="name-contains" name="name-contains" value={name} onChange={this.changeName}/>
                  </div>
                </div>
              </div>

              <div className="filter-container">
                <div className="filter-title">Date</div>
                <div className="filter-list">
                  <div>
                    <RadioButton id="dateAZ" value="dateAZ" name="sort" label="From A to Z" handler={this.changeSortFunc}/>
                  </div>
                  <div>
                    <RadioButton id="dateZA" value="dateZA" name="sort" label="From Z to A" handler={this.changeSortFunc}/>
                  </div>
                </div>
              </div>


              <div className="filter-container">
                <div className="filter-title">Payment type</div>
                <div className="filter-list">
                  {availablePaymentMethods.map(payment => (
                    <div key={payment}>
                      <CheckBox
                        id="payment1"
                        name="payment"
                        value={payment}
                        label={payment}
                        checked={selectedPaymentMethods.includes(payment)}
                        handler={this.handlePaymentChange(payment)}
                      />
                    </div>
                  ))}
                </div>
              </div>


              <div className="filter-container">
                <div className="filter-title">Delivery type</div>
                <div className="filter-list">
                  {availableDeliveryMethods.map(delivery => (
                    <div key={delivery}>
                      <CheckBox
                        type="checkbox"
                        id="delivery1"
                        name="delivery"
                        value={delivery}
                        label={delivery}
                        checked={selectedDeliveryMethods.includes(delivery)}
                        handler={this.handleDeliveryChange(delivery)}
                      />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </section>
          <section className="lots">
            <div className="lots-grid">
              {lots.map(lot => <LotCard {...lot} key={lot.name} />)}
            </div>
            {
              !lots.length && pagesCount
                ? <div className="no-lots">No lots found</div>
                : <Pagination changeActivePage={this.changeActivePage} active={activePage} pageCount={pagesCount}/>
            }

          </section>
        </div>
      </section>
    );
  }
}
