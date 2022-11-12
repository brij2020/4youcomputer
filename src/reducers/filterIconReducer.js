import {
	FILTER_SHOW_HIDE
} from '../constants/commonConstants'

export const FilterReducer = (
	state = { filterIcon: false },
	action
) => {
	switch (action.type) {
		case FILTER_SHOW_HIDE:
			return { ...state, ...{ filterIcon: action.payload }}
		default :
			return state
	}
}