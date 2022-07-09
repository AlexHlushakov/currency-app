// @ts-ignore
import React, {useEffect, useState} from 'react';
import {RatesAPI} from '../api/api';
// @ts-ignore
import styles from './ConvertPage.module.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



type PropsType = {
    rates: {}
}


const Header: React.FC<PropsType> = React.memo((props) =>{

    return (
        <header className={styles.header}>
            <div className={styles.header_rates}>
                <div>
                    <b>USD:</b><span>{props.rates.USD.UAH}</span>
                </div>
                <div>
                    <b>EUR:</b><span>{props.rates.EUR.UAH}</span>
                </div>
            </div>
        </header>
    )
})

const ConvertPage: React.FC =() =>{

    const notify = () => toast.error("Too Big Amount!");

    //  useState Data
    let currencies: Array<string> = ["USD", "EUR", "UAH", "RUB", "CNY"]

    let inputRegex = /^\d{0,11}$/;

    const createRatesObject  = (keys: Array<string>) => {
        return keys.reduce((accumulator, value) => {
            return {...accumulator, [value]: keys.reduce((accumulator, value) => {
                    return {...accumulator, [value]: 0};
                }, {})};
        }, {})
    }

    const [loading, setLoading] = useState(true);
    // const [rates, setRates] = useState({USD:{},EUR:{},UAH:{}});
    const [rates, setRates] = useState(createRatesObject(currencies))

    const [currencyOne, setCurrencyOne] = useState({currency: currencies[0], amount: 0})
    const [currencyTwo, setCurrencyTwo] = useState({currency: currencies[2], amount: 0})



    // Load exchange rates on page load using useEffect

    useEffect(() =>{

        let newRates = createRatesObject(currencies);

        let getRates = async () => {
            setLoading(true)
           try{
                let promises = [];
                for(let i = 0; i < currencies.length; i++) {
                    let result = await RatesAPI.getRate(currencies[i], currencies);
                    promises.push(result);
                    }
               Promise.all(promises).then(()=>{
                   for(let i = 0; i < currencies.length; i++) {
                       let key = currencies[i];
                       newRates[key] = promises[i];
                   }
               })
           } catch (error){
               console.error(error.message);
           }
        }

        getRates().then(() =>{
        setRates(newRates);
        setLoading(false)
        })
        }, [])



        let convert = (currencyOne: string, amountOne: number = null, currencyTwo: string, amountTwo: number = null) =>{
            let currenciesRate = Object.fromEntries(Object.entries(rates).filter(([key]) => key.includes(currencyOne)))[currencyOne][currencyTwo];

            if(amountOne !== null && amountTwo === null){
                return amountOne * currenciesRate;
            } else if(amountOne === null && amountTwo !== null){
                return amountTwo / currenciesRate;
            } else {
                alert("Invalid currency expression")
            }
        }



    const handleChangeAndConvert = (inputType: string) => (event) => {
        switch(inputType){
            case 'selectOne':{
                setCurrencyOne({currency: event.target.value, amount: currencyOne.amount});
                setCurrencyTwo({currency: currencyTwo.currency, amount: parseFloat((convert(event.target.value, currencyOne.amount, currencyTwo.currency)).toFixed(3))})
                break;
            }
            case 'selectTwo':{
                setCurrencyTwo({currency: event.target.value, amount: currencyTwo.amount});
                setCurrencyOne({currency: currencyOne.currency, amount: parseFloat((convert(currencyOne.currency, null, event.target.value, currencyTwo.amount)).toFixed(3))})
                break;
            }
            case 'inputOne':{
                if (!inputRegex.test(event.target.value.toString()) && currencyOne.amount < event.target.value) {
                    console.log(event.target.value)
                    notify()
                    break;
                } else {
                    setCurrencyOne({currency: currencyOne.currency, amount: event.target.value});
                    setCurrencyTwo({currency: currencyTwo.currency, amount: parseFloat((convert(currencyOne.currency, event.target.value, currencyTwo.currency)).toFixed(3))})
                    break;
                }
            }
            case 'inputTwo':{
                if (!inputRegex.test(event.target.value.toString()) && currencyTwo.amount < event.target.value) {
                    console.log(event.target.value)
                    notify()
                    break;
                } else {
                    setCurrencyTwo({currency: currencyTwo.currency, amount: event.target.value});
                    setCurrencyOne({currency: currencyOne.currency, amount: parseFloat((convert(currencyOne.currency, null, currencyTwo.currency, event.target.value)).toFixed(3))})
                    break;
                }
            }
            default:{
                break;
            }
        }
    }




    if(loading){
        return<span>Loading...</span>
    } else{
        return(
            <div className={styles.container}>
                <Header rates={rates}/>
                <main className={styles.main}>
                    <div className={styles.currency_block}>
                        <input type="number" name="amountOne" value={currencyOne.amount !== 0 ? currencyOne.amount : ''}
                               onChange={handleChangeAndConvert('inputOne')}  placeholder='Enter amount'/>
                        <select value={currencyOne.currency} onChange={handleChangeAndConvert('selectOne')}>
                            {currencies.map(option=>(
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.currency_block}>
                        <input type="number" name="amountTwo" value={currencyTwo.amount !== 0 ? currencyTwo.amount : ''}
                               onChange={handleChangeAndConvert('inputTwo')} placeholder='Enter amount' />
                        <select value={currencyTwo.currency} onChange={handleChangeAndConvert('selectTwo')}>
                            {currencies.map(option=>(
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                </main>
                <ToastContainer />
            </div>
        )
    }
}

export default ConvertPage