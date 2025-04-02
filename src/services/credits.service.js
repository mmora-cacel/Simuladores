const creditJson = require('../json/credit.json');
const moment = require('moment');

module.exports.simulate = async (req,res) =>
{
    let { amount, term, creditType, typeAmortizationRate } = req.body;

    let params = null
    let tablaAmortizacion = [];
    let credit = creditJson.types.filter( e => e.producto == creditType );

    if (credit.length <= 0)
    {
        res.json({code: 'CREDITO_INVALIDO', info: `El tipo de crédito no existe`, result: {}});
        return;
    }

    for(let item of credit)
    {
        if(amount >= item.montoMinimo && amount <= item.montoMaximo && creditType == item.producto)
        {            
            params = item;            
            break;
        }
    }

    if(params == null)
    {
        return res.json({code: 'DATOS_INVALIDOS', info: 'Datos fuera del rango establecido', result: {}})
    }

    if (term > params.plazoMaximo)
    {
        res.json({code: 'PLAZO_INVALIDO', info: `El plazo máximo es: ${params.plazoMaximo} cuotas`, result: {}});
        return;
    }

    let TEA = params.tasaCreditoAnual;
    let TED = Math.pow(1 + TEA / 100, 1 / 360) - 1; // Tasa efectiva diaria
    let insurance = params.tasaSeguroDesgravamen;
    let insuranceRisk = 0;
    let totalCredit = 0;
    let totalInsurance = 0;

    let interestTotal = 0;

    // Obtener los meses y sus días según la fecha de pago
    let resultMonths = await getMonthDebit(31, term);
    let i = 0;
    
    let balance = amount;
    let tasaAnual = params.tasaCreditoAnual;
    let coeficiente = 365/360;
    cuota = amount * (((((tasaAnual * coeficiente) / 100) / 12)) * ((Math.pow((1 + ((((tasaAnual * coeficiente) / 100) / 12))), term)) / (Math.pow((((((tasaAnual * coeficiente) / 100) / 12)) + 1), term) - 1)));

    for (let item of resultMonths)
    {
        i++;

        let interest = Number( ( (params.tasaCreditoAnual * balance * item.ultimodia) / 36000 ).toFixed(2) );
        let insuranceMonth = Number( ( (balance * params.tasaSeguroDesgravamen)/100 ).toFixed(2) );
        let insuranceRiesgo = Number( ( (amount * params.tasaSeguroTodoRiesgo) / 100).toFixed(2) );
        let capitalCalculo = typeAmortizationRate === 2 ? amount / term : i == resultMonths.length ? balance : Number( (cuota - interest).toFixed(2) );
        totalInsurance += insuranceMonth;
        insuranceRisk += insuranceRiesgo;
        interestTotal += interest;
        const quotaTotal = capitalCalculo + interest + insuranceMonth + insuranceRiesgo;
        
        tablaAmortizacion.push(
            {
                numQuota: i,
                month: item.date,
                days: item.ultimodia,
                balance: Number(balance.toFixed(2)),
                interest: interest,
                capital: Number( (capitalCalculo).toFixed(2) ),
                taxReliefInsurance: Number(insuranceMonth.toFixed(2)),
                riskInsurance: insuranceRiesgo,
                quotaTotal: Number(quotaTotal.toFixed(2))
            }
        );
        totalCredit += quotaTotal;    
        balance = balance - capitalCalculo;           
    }

    let response =
    {
        code: 'OK',
        info: '',
        result: {
            interest: TEA,
            interestTotal: Number(interestTotal.toFixed(2)),
            taxReliefInsuranceTotal: Number(totalInsurance.toFixed(2)),
            riskInsuranceTotal: insuranceRisk,
            total: Number(totalCredit.toFixed(2)),
            amortizationTable: tablaAmortizacion
        }
    }
    res.json(response)
}

const getMonthDebit = async (dayDebit, term) => {
    let listMonths = [];
    let fechaActual = moment().date(dayDebit); // Fecha actual con el día proporcionado

    // Si la fecha no es válida (ejemplo: 31 de febrero), la ajustamos al último día del mes
    if (!fechaActual.isValid()) {
        fechaActual = fechaActual.endOf('month');
    }

    for (let i = 0; i < term; i++) {
        // Obtener el último día del mes de la fecha actual
        let ultimodia = fechaActual.clone().endOf('month');

        // Si el día elegido (dayDebit) es mayor que el último día del mes, tomar el último día disponible
        let fechaMes = fechaActual.clone();
        if (dayDebit > ultimodia.date()) {
            fechaMes = ultimodia.clone(); // Tomamos el último día disponible
        } else {
            // Si el día elegido es válido en ese mes, lo mantenemos
            fechaMes = fechaActual.clone().date(dayDebit);;
        }

        let date = fechaMes.format('YYYY-MM-DD');
        listMonths.push({ date, ultimodia: Number(ultimodia.format('DD')) });

        // Avanzar al siguiente mes
        fechaActual = fechaActual.clone().add(1, 'month');
    }
    return listMonths;
};