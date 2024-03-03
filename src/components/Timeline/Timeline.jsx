import React, {useState, useEffect, useRef} from 'react';
import styled from 'styled-components';
import { FaEuroSign, FaExclamation, FaSackDollar, FaCalculator, FaFileCircleExclamation, FaCircleQuestion } from "react-icons/fa6";
import { DateNow, DateCounter, IsAlert } from '../utils/Utils';
import {Colors} from '../../Styles/Colors';
import '../../Styles/style.css';

//returns title depending on props
const GetTitle = (type) => {
  let title = '';

    switch (type) {
      case 'ACCOUNTING_PERIOD_END':
        title = 'the end of the accounting period'
        break;
      case 'VAT_PERIOD_END':
        title = 'the end of the VAT period'
        break;
      case 'VAT_PERIOD_REPORTING_DUE':
        title = 'VAT reporting due date'
        break;
      case 'BANK_INTEGRATION_RENEWAL':
       title = 'renewal of bank integration'
       break;
      case 'ACCOUNTING_PERIOD_REPORTING_DUE':
       title = 'accounting period reporting due date'
       break;
      default:
        title = 'the next task'
    }

    return title;
}
//Returns the information for the next task
const nextTask = (items) => {
   const next = items.find((obj) => {
     const objDate = new Date(obj.date);

     return objDate > DateNow();
   })

   return next;
}
// Return the information for the end of accounting period
const NextAccountingEnd = (items) => {

  const next = items?.find((obj) => {
    if(obj?.type){
      const objDate = new Date(obj?.date);
      return objDate > DateNow();
    }
    return;
  })

  return next;
}
//Returns details and days to the task
const Details = (props) => {
  const getType = nextTask(props.items)?.type ? nextTask(props.items)?.type : nextTask(props.items)?.label;
  let title = GetTitle(getType);
    
  return (
    <div className='row-div aling-center column-div'>
      {props.daysToNext ? 
        <p><span style={{color: props.isalert ? Colors.danger : Colors.text }}>{props.daysToNext}</span> days to {title}.</p>
        :
        <p>No task found</p>
      }
      {props.ToAccountingEnd ? 
        <p>The accounting period ends in <span style={{color: props.accountingAlert ? Colors.danger : Colors.text }}>{props.ToAccountingEnd}</span> days.</p>
      :
        <p>The accounting due date cannot be found</p>
      }
    </div>
  )
}
//Returns task details
const TaskDetails = (props) => {
  const item = props.item !== null && (props.item);
  const type = item?.type ? item?.type : item?.label;
  const title = GetTitle(type);

  return (
    <>
      <p>{item.date}</p>
      <p>{title}</p>
      <p>{item.description}</p>
      <p>Priority: {item.priority}</p>
    </>
  )
}
//Returns task items
const TaskItems = ({items, totalWidth, onLineOffsetChange, isalert, itemIndex}) => {
  const itemRefs = useRef(items.map(() => React.createRef()));
  
  useEffect(() => {
    onLineOffsetChange(totalWidth);
  }, [totalWidth, onLineOffsetChange]);

  useEffect(() => {
    const nextEventIndex = items.findIndex(item => item === nextTask(items));

    if (nextEventIndex !== -1 && itemRefs.current[nextEventIndex].current) {
      const nextEventElement = itemRefs.current[nextEventIndex].current;

      const checkDOM = setInterval(() => {
        if (document.readyState === 'complete') {
          clearInterval(checkDOM);
          
          if (nextEventElement && typeof nextEventElement.scrollIntoView === 'function') {
            nextEventElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
          }
        }
      }, 100);
    }
  }, [items]);

  const handleOnClick = (index) => {
    itemIndex(index);
  }

  const Icon = ({item}) => {
    const type = item?.type ? item?.type : item?.label;
    let priorityColor = Colors.low;

    switch (item.priority) {
      case 'HIGH':
        priorityColor = Colors.danger;
        break;
      case 'MODERATE':
        priorityColor = Colors.moderate;
        break;
      default:
        priorityColor = Colors.low;
        break;
    }

     switch (type) {
       case 'ACCOUNTING_PERIOD_END':
         return <FaCalculator color={priorityColor}/>
       case 'VAT_PERIOD_END':
         return <FaFileCircleExclamation color={priorityColor} />
       case 'VAT_PERIOD_REPORTING_DUE':
        return <FaEuroSign color={priorityColor} />
       case 'BANK_INTEGRATION_RENEWAL':
        return <FaSackDollar color={priorityColor}/>
       case 'ACCOUNTING_PERIOD_REPORTING_DUE':
        return <FaExclamation color={priorityColor}/>
       default:
         return <FaCircleQuestion color={priorityColor} />
     }
    
  }

  const sortedItems = items.sort((a, b) => new Date(a.date) - new Date(b.date));

  const mapTask = sortedItems.map((task, index) => {
    const modulo2 = index % 2;
    const getNextTask = task?.date === nextTask(items)?.date;
    
    return (
      <div key={'div'+index}>
      <Circle key={index}
        isalert = {getNextTask && (isalert)} 
        style={{ left: `${(index * 2 / (items.length - 1)) * totalWidth}em`,
        marginTop: modulo2 ? `0.5em` : `-0.5em`,
        padding: getNextTask && (`0.3em`) }}
        onClick= {() => handleOnClick(index)}
        ref={itemRefs.current[index]} >
          <Icon key = {'icon'+index} item={task}/>
          <span key = {'span'+index} style={{position: 'absolute', top: modulo2 ? `-1.8em` : `1.8em`}}>
            <p key = {'p'+index} style={{fontWeight:`400`, fontSize:`0.7em`, whiteSpace:'nowrap'}}>{task.date}</p>
          </span>
      </Circle>
      </div>
    )
  })

  return(
    <>
      {mapTask}
    </>
  )
}

export const Timeline = ({ items }) => {
  const [lineLength, setLineLength] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const daysToNext = DateCounter(DateNow(), nextTask(items)?.date);
  const ToAccountingEnd = DateCounter(DateNow(), NextAccountingEnd(items)?.date);
  const alertLvl = 10;
  const isAlert = IsAlert(daysToNext, alertLvl);
  const accountingAlert = IsAlert(ToAccountingEnd, alertLvl)

  useEffect(() => {
    const totalWidth = items.length * 2 * 1.5;
    setLineLength(totalWidth);
  }, [items]);
 
  return (
    <>
    <StyledPlaceholder>
      <Details daysToNext={daysToNext} isalert = {isAlert} accountingAlert = {accountingAlert} ToAccountingEnd = {ToAccountingEnd} items = {items}/>
      <div className='scroll-div'>
        <Line linelength={lineLength}/>
        <TaskItems items={items} totalWidth={lineLength} onLineOffsetChange={setLineLength} isalert = {isAlert} itemIndex = {setSelectedItem}/>
      </div>
    </StyledPlaceholder>
    {selectedItem !== null && (
    <InfoContainer>
          <FloatingButton onClick={() => setSelectedItem(null)}>
            x
          </FloatingButton>
          <TaskDetails item = {selectedItem !== null && (items[selectedItem])}/>
    </InfoContainer>
    )}
    </>
  )
}

const StyledPlaceholder = styled.div`
  border-radius: 1rem;
  background: ${Colors.bgColor};
  border: 3px solid ${Colors.primary};
  min-height: 6rem;
  max-height: 8rem
  overflow: hidden;
`

const InfoContainer = styled.div`
  position:relative;
  margin:5em auto;
  border-radius: 1rem;
  background: ${Colors.bgColor};
  border: 3px solid ${Colors.primary};
  width: 20em;
`

const Circle = styled.div`
  position:absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2em;
  height: 2em;
  border-radius: 50%;
  border: 3px double ${(props) => props.isalert ? Colors.danger : Colors.primary};
  top: 50%;
  margin-left: 1em;
  transform: translateY(-50%);
  background: #FFF;
  cursor: pointer;
  transition: border 0.2s;

  &:hover {
    border: 3px solid ${(props) => props.isalert ? Colors.danger : Colors.primary};
  }
`

const Line = styled.div`
  position:absolute;
  top: 50%;
  transform: translateY(-50%);
  width: ${(props) => props.linelength*2.3}em;
  min-width: 99.5%;
  height: 2px;
  border: 3px double ${Colors.primary};
  border-radius: 10px;
`

const FloatingButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  background-color: ${Colors.bgColor};
  color: #000;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    border: 1px solid ${Colors.primary}
  }
`;
