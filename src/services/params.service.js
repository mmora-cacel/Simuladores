const credits = require('../json/credit.json')
const invesments = require('../json/invesments.json')
const savings = require('../json/savings.json')

module.exports.get = async (req, res) =>
{
    let { searchType } = req.body;
    let response = { code: 'OK', info: '', result: {} };
    if(searchType == 'CR')
    {
        let result = [];
        for(let item of credits.types)
        {
            let show =
            {
                product: item.producto,
                minTerm: item.plazoMinino,
                maxTerm: item.plazoMaximo,
                minValue: item.montoMinimo,
                maxValue: item.montoMaximo,
                creditRate: item.tasaCreditoAnual,
                creditLifeInsurance:item.tasaSeguroDesgravamen,
                riskInsurance:item.tasaSeguroTodoRiesgo
            };
            let i = result.findIndex( e => e.product == show.product);
            
            if (i == -1) result.push( {product: item.producto, terms: [show]} )
            else result[i].terms.push(show);
        }
        response.result.typesAmortizationRate = credits.typesAmortizationRate;
        response.result.list = result;
    }
    else if (searchType == 'INV')
    {
        response.result = [];
        for(let item of invesments)
        {
            response.result.push(
            {
                minValue: item.montoMinimo,
                maxValue: item.montoMaximo,
                minTerm: item.plazoMinino,
                maxTerm: item.plazoMaximo,
                rate: item.tasa
            })
        }
        
    }
    else if (searchType == 'AHP')
    {
        response.result.list = [];
        for(let item of savings)
        {
            response.result.list.push(
            {
                minValue: item.montoMinimo,
                maxValue: item.montoMaximo,
                minTerm: item.plazoMinino,
                maxTerm: item.plazoMaximo,
                rate: item.tasaAnual
            })
        }
        response.result.reasons =[
            'VACACIONES',
            'JUBILACIÓN',
            'MIS AHORROS CACEL',
            'FONDOS DE RESERVA',
            'DECIMOS',
            'AHORROS'
        ]
    }

    res.json(response);
}