
import {
	FILTER_ADD_ITEM,
	FILTER_CLEAR_ITEMS,
	FILTER_REMOVE_ITEM,
	FILTER_SHOW_HIDE
} from '../constants/commonConstants'

import { PRODUCT_LIST_SUCCESS_FILTER } from '../constants/productConstants'

// Actions to add a single product to the cart
export const addFilter = ({ key, data, checked }) => async (dispatch, getState) => {
	
	let { filterReducer, productList:{products=[]}={} } = getState();
	
	if(filterReducer.has(key)) {
		if(checked) {
			filterReducer.set(key, filterReducer.get(key).concat(data))
		} else {
			
			filterReducer.set(key, filterReducer.get(key).filter(e => e !== data[0]))
			if(filterReducer.get(key).length === 0) {
				filterReducer.delete(key)
			}
		}
		
	} else {
		filterReducer.set(key, data)
	}
	let __product = [];
	filterReducer.forEach((value,_key) => {
		__product = products.filter( product => {
			let firstArray = product[_key];
			let secondArray = value;
			
			return firstArray.some(e => secondArray.includes(e))
		})
	})
	
	dispatch({type: PRODUCT_LIST_SUCCESS_FILTER,payload:{productCopy : __product, products: products}})
	dispatch({
		type: FILTER_ADD_ITEM,
		payload: {
			fiters: filterReducer,
			
		},
	})
	
}

export const showFilterAction = (data) => async (dispatch) => {
	dispatch({
		type: FILTER_SHOW_HIDE,
		payload: data,
	})
	
}
