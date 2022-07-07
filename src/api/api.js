import * as axios from "axios";


export const RatesAPI ={
    getRate(base, currencies){
        return axios.get(`https://api.exchangerate.host/latest*?base=${base}&symbols=${currencies}&places=3`).then(response => response.data.rates)
    }
}
