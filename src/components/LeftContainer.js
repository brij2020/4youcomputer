import React,{ useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { addFilter, showFilterAction } from '../actions/filterActions'

const LeftContainer = () => {

  
  const location = useLocation();
  const history = useHistory();
  const [isLeft, setIsLeft]  = React.useState(false);
  const  { filterIcon } = useSelector( s => s.FilterReducer);
  const [_showFilterIcon, _setFilterIcon] = React.useState(false)
  const filterList = useSelector(s => s.filterList) ?? []
  const [card,setCard] = React.useState([]);
  const [selectedCat, setCat ] = React.useState('');
  const dispatch = useDispatch()
  useEffect(() => {
    const card2 = Array.isArray(filterList.filters) && filterList.filters
    .map((fil,i) => { 
        return ({
            label: fil.label,
            chName:fil.label,
            child: [...fil.filter ],
            isOpen: i == 0 ? true:false,
            id:"A"+ i,
            type: i == 0  ? "radio" : 'checkbox'
          })
        }) 
    setCard(card2)
  },[filterList]) 
 


  React.useEffect(() => {
    let check = false;
      const query = new Proxy(new URLSearchParams(location.search),{
            get: (searchParams,prop) => searchParams.get(prop) 
          })
          
      if(query.refid !== null) {
          setCat(query.refid)
      } else {
        setCat('')
      }
    if(typeof window != 'undefined') {
     
      check = /Mobi/i.test(window.navigator.userAgent)
    }
    if(location.pathname === '/' || location.pathname.includes('/products')) {
      // setIsLeft(true)
      console.log('check un check', check)
      if(check) {
          dispatch(showFilterAction(false));
          _setFilterIcon(true);
      } else {
        dispatch(showFilterAction(true))
        _setFilterIcon(false);
      }

    } else {
      // setIsLeft(false);
      dispatch(showFilterAction(false))
      _setFilterIcon(true);
    }
  },[location.pathname]) 
  
  const handleClick  = id => {
    setCard(card.map(c => c.id === id ? Object.assign({},c,{isOpen:!c.isOpen}): c ))
  }
  const handleCategoryChange = ({target:{ value,id,name }}) => {
    window.location.href = `/products/${name}?refid=${value}`
  }
  const handleFilter = ({target:{name, value, checked}}) => {
    console.log(checked)
    dispatch(addFilter({key:name, data: [value], checked: checked}))
  }
  
  const handleFilterIcon = () => {
    dispatch(showFilterAction(true)) 
  }
  return (<>
    {
      !filterIcon ? (<div class="sticky-icon">
     <i class="fa fa-filter" aria-hidden="true" onClick={ handleFilterIcon }></i>
    </div>): (null)
    }
    <div id="sidebar" style={{padding: "5px"}}  style={{display: filterIcon ? '': 'none'}}>
    
    
    
    
    <i class="fa fa-times" aria-hidden="true" style={{
    "position": "absolute",
    "left": "87%",
    "top": "95%",
    "font-size": "25px",
    "color": "red"
  }}
  onClick={ __ => dispatch(showFilterAction(false))  }
></i>
      <div id="accordion" class="myaccordion">
       {
        card && card.map(c => (
           <div class=" left-filter" >
            <div class="card-header" id="headingOne">
              <h2 class="mb-0">
                <button class="d-flex align-items-center justify-content-between btn btn-link"
                onClick={ e => handleClick(c.id) }
                 data-toggle="collapse" data-target="#collapseOne" aria-expanded={ c.isOpen ? true : false} aria-controls="collapseOne">
                  { c?.label}
                  <span class="fa-stack fa-sm">
                    <i class="fas fa-circle fa-stack-2x"></i>
                    <i class={`fas ${ c.isOpen ?  'fa-angle-up' :'fa-angle-down' } fa-stack-1x fa-inverse`}></i>
                  </span>
                </button>
              </h2>
            </div>
            <div id="collapseOne" class={`collapse ${c.isOpen ? 'show' : ""}`} aria-labelledby="headingOne" data-parent="#accordion">
              <div class="card-body">

                <ul>

                { c.type === 'radio' ? ( <>
                {
                  c.child && c.child.map( ch =>  (<div class="form-check">
                      <input class="form-check-input" type="radio" name={ch['cat-seo']} id={ch.label} value={ch.value} checked={selectedCat === ch.value} onChange={ handleCategoryChange } />
                      <label class="form-check-label" for={ch.label}>
                        { ch.label}
                      </label> </div>))
                }
                  </>) : c.type === 'price' ? (<><div data-role="rangeslider">
                    <label for="price-min">Price:</label>
                    <input type="range" name="price-min" id="price-min"  min="0" max="1000" />
                  
                  </div>

                  </>)  :(<>
                <div class="form-check">
                  {
                    c.child  && c.child.map(ch => ( <label class="control control--checkbox">{ch.label}
                    <input type="checkbox"  onChange={ handleFilter } value={ch.value} name={c.label }/>
                    <div class="control__indicator"></div>
                  </label>))
                  }
                  
            
                </div>

                 </> )}
               
                  
                </ul>
              </div>
            </div>
          </div>
          ))
       }
        
      </div>
    </div>
</>)
}

export default LeftContainer;