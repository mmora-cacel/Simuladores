const invesments = require('../json/invesments.json');

module.exports.simulate = async (req, res) => {
    const { amount, term } = req.body;
    let response = {};
    try
    {
        let params = null;

        for(let item of invesments)
        {
            if( (amount >= item.montoMinimo && amount <= item.montoMaximo ) && ( term >= item.plazoMinino && term <= item.plazoMaximo ))
            {            
                params = item;            
                break;
            }
        }
    
        if(params == null)
        {
            return res.json({code: 'DATOS_INVALIDOS', info: 'Datos fuera del rango establecido', result: {}})
        }
    
        let annualInterest = params.tasa;
        const interestValue = Number((amount * annualInterest * term / 36000).toFixed(2));
        const amountTotal = amount + interestValue - 0;
        
        response =
        {
            code: 'OK',
            info: '',
            result: {
                amount: amount,
                annualInterest,
                interestValue,
                amountTotal: Number(amountTotal.toFixed(2)) 
            }
        }
    }
    catch (error)
    {
        response = { code: 'ERR', info: 'Error en el servicio', result: { error } }
    }
    res.json(response);
}