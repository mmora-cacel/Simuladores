let savings = require('../json/savings.json')
const moment = require('moment')

module.exports.simulate = async (req, res) =>
{
    const { amount: amountBody, term: termBody, dayDebit: dayDebitBody, option } = req.body
	const dayNow = moment().format('DD')
	const dayDebit = Number(dayNow) < Number(dayDebitBody) ? moment() : moment().add(1, 'month')
	const dateDebit = dayDebit.set('date', dayDebitBody)

	const nexDebit = moment(dateDebit).subtract(1, 'month');

    let params = null;

    for(let item of savings)
    {
        if( (amountBody >= item.montoMinimo && amountBody <= item.montoMaximo ) && ( termBody >= item.plazoMinino && termBody <= item.plazoMaximo ))
		{            
			params = item;            
			break;
		}
    }    

	if (params == null)
	{
		return res.json({code: 'DATOS_INVALIDOS', info: 'Datos fuera del rango establecido', result: {}})
	}

	let tablaPagos = [];
	let montoAcumulado = 0;
	let interesAcumulado = 0;
	let ahorroAcumulado = 0;
	let resultMonths = await getMonthDebit(dayDebitBody, termBody);
    for(let item of resultMonths)
	{
		montoAcumulado += amountBody;
		ahorroAcumulado += amountBody;
        let interesMensual = Number( (( montoAcumulado * params.tasaAnual * item.ultimodia ) / 36000).toFixed(2) );
		interesAcumulado += interesMensual;
		
		tablaPagos.push({
			month: item.date,
			daysCalculation: item.ultimodia,
            valueDebt: Number(amountBody.toFixed(2)),
			accumulatedBalance : Number( (montoAcumulado).toFixed(2)),
            interestEarned: Number(interesMensual.toFixed(2)),
			valueReceive: Number( (montoAcumulado + interesMensual).toFixed(2) )
        });
		montoAcumulado += interesMensual;
	}

	res.json({
		code: 'OK',
		result: {
			interest: params.tasaAnual,
			totalSaving: tablaPagos[tablaPagos.length - 1].accumulatedBalance,
			totalInterestEarned: Number(interesAcumulado.toFixed(2)),
			totalValueRecieve : Number(montoAcumulado.toFixed(2)),
			payments: tablaPagos
		},
		info: ''
	})
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



