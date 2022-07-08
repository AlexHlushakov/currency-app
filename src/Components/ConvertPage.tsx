// @ts-ignore
import React, {useEffect, useState} from 'react';
import {RatesAPI} from '../api/api';
// @ts-ignore
import styles from './ConvertPage.module.css'


type PropsType = {
    usd: Object
    eur: Object
}


const Header: React.FC<PropsType> = React.memo((props) =>{

    return (
        <header className={styles.header}>
            <div className={styles.header_rates}>
                <div>
                    <b>USD:</b><span>{props.usd.UAH}</span>
                </div>
                <div>
                    <b>EUR:</b><span>{props.eur.UAH}</span>
                </div>
            </div>
        </header>
    )
})

const ConvertPage: React.FC =() =>{

    //  useState Data

    let [loading, setLoading] = useState(true);
    let [rates, setRates] = useState({USD:{},EUR:{},UAH:{}});
    const currencies: Array<string> = ["USD", "EUR", "UAH"]

    let [currencyOne, setCurrencyOne] = useState({currency: currencies[0], amount: 0})
    let [currencyTwo, setCurrencyTwo] = useState({currency: currencies[2], amount: 0})



    // Load exchange rates on page load using useEffect

    useEffect(() =>{

        let newRates ={USD:{},EUR:{},UAH:{}}

        let getRates = async () => {
            setLoading(true)
           try{
                let usdRates: Object  = await RatesAPI.getRate("USD", ["UAH", "EUR", "USD"]);
               let eurRates: Object  = await RatesAPI.getRate("EUR", ["UAH", "USD", "EUR"]);
               let uahRates: Object  = await RatesAPI.getRate("UAH", ["USD", "EUR", "UAH"]);
                Promise.all([usdRates, eurRates, uahRates]).then(()=>{
                    newRates.USD = usdRates;
                    newRates.EUR = eurRates;
                    newRates.UAH = uahRates;
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
                setCurrencyTwo({currency: currencyTwo.currency, amount: parseFloat((convert(currencyOne.currency, event.target.value, currencyTwo.currency)).toFixed(3))})
                break;
            }
            case 'inputTwo':{
                setCurrencyOne({currency: currencyOne.currency, amount: parseFloat((convert(currencyOne.currency, null, currencyTwo.currency, event.target.value)).toFixed(3))})
                break;
            }
            default:{
                break;
            }
        }
    }


    const handleChangeInput= (oneOrTwo: string) => (event) => {
        switch (oneOrTwo) {
            case 'one': {
                if (event.target.value > 9999999999) {
                    alert("Invalid input range. Max value is 9999999999")
                    break;
                } else {
                    setCurrencyOne({currency: currencyOne.currency, amount: event.target.value});
                    break;
                }
            }
            case 'two': {
                if (event.target.value > 9999999999) {
                    alert("Invalid input range. Max value is 9999999999")
                    break;
                } else {
                    setCurrencyTwo({currency: currencyTwo.currency, amount: event.target.value});
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
                <Header usd={rates.USD} eur={rates.EUR}/>
                <main className={styles.main}>
                    <div className={styles.currency_block}>
                        <input type="number" name="amountOne" value={currencyOne.amount} onChange={handleChangeInput("one")} onBlur={handleChangeAndConvert('inputOne')} />
                        <select value={currencyOne.currency} onChange={handleChangeAndConvert('selectOne')}>
                            {currencies.map(option=>(
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.currency_block}>
                        <input type="number" name="amountTwo" value={currencyTwo.amount}  onChange={handleChangeInput("two")} onBlur={handleChangeAndConvert('inputTwo')} />
                        <select value={currencyTwo.currency} onChange={handleChangeAndConvert('selectTwo')}>
                            {currencies.map(option=>(
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                </main>
            </div>
        )
    }
}

export default ConvertPage