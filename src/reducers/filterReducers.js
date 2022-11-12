import {
	FILTER_ADD_ITEM,
	FILTER_CLEAR_ITEMS,
	FILTER_REMOVE_ITEM
} from '../constants/commonConstants'


const filterReducer = (state=new Map(), { type, payload:{ fiters } = {}  } = {} ) => {
	console.log("fiters",fiters)
	switch(type) {
		case FILTER_ADD_ITEM: 
			return fiters
			
		case FILTER_REMOVE_ITEM:
			return fiters
			
		case FILTER_CLEAR_ITEMS:
			return fiters
			
		default:
		return state
		

	}
}
export { filterReducer }