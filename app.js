const { Stack, inToPost, outPrec, inPrec, isOperator, isOperand, spaceSeparator, evaluatePostfix } = require('./Stack')
const { Stock, registerProduct } = require('./helper')

const express = require('express')
const app = express()

app.set('port', process.env.PORT || 8080)
app.set('host', process.env.HOST || '13.115.100.160')

app.get('/', function(req, res) {
	res.send('AMAZON\n')
})

app.get('/secret', function(req, res) {
	const serverType = res.getHeaders()['x-powered-by']
	const authFailMessage = `<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
	<html><head>
	<title>401 Authorization Required</title>
	</head><body>
	<h1>Authorization Required</h1>
	<p>This server could not verify that you
	are authorized to access the document
	requested.  Either you supplied the wrong
	credentials (e.g., bad password), or your
	browser doesn't understand how to supply
	the credentials required.</p>
	<hr>
	<address>${serverType} (Amazon) Server at ${app.settings.host} Port ${app.settings.port}</address>
	</body></html>`
	const auth = { login: 'amazon', password: 'candidate' }
	const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
	const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')

	if (login && password && login === auth.login && password === auth.password) 
		res.send('SUCCESS\n')
	else 
		res.status(401).send(authFailMessage)
})

app.get('/calc', function(req, res) {
	const encodedQuery = encodeURIComponent(Object.keys(req.query))
	const decodedQuery = decodeURIComponent(encodedQuery.replace(/\%20/g, '+'))
	const regex = new RegExp('[-0-9()+*/]', 'gy')
	const regexNeg = new RegExp('^(-[0-9]+)', 'gm')
	const regexNegMatch = decodedQuery.match(regexNeg)

	function regexNegFormatter(arr) {
		const negInt = arr[0]
		return decodedQuery.replace(regexNeg, `(0${negInt})`)
	}

	if (!regex.test(decodedQuery)) 
		res.send('ERROR\n')
	else {
		let spaceSeparatedInfix = spaceSeparator((regexNegMatch) ? regexNegFormatter(regexNegMatch) : decodedQuery)
		let parsedInfix = spaceSeparatedInfix.filter(i => i)
		let postfix = inToPost(parsedInfix)
		let result = evaluatePostfix(postfix)
		res.send(`${result}\n`)
	}
})

app.get('/stocker', function(req, res) {
	// parse req query 
	const parameter = {}
	for (let [key, value] of Object.entries(req.query)) 
		parameter[key] = value

	if (parameter.function === 'deleteall') {
		stockTable = new Stock()
		res.end()
	} else if (parameter.function === 'addstock') {
		// + sign converts string into a number 
		if (!parameter.name || (parameter.amount && !(Number.isInteger(+parameter.amount))))
			res.send('ERROR\n')
		else {
			if (!(parameter.name in stockTable.names)) 
				stockTable.names = Object.assign(registerProduct(parameter.name, parameter.amount),stockTable.names)
			else {
				if (!parameter.amount)
					stockTable.names[parameter.name].amount += 1
				else
					stockTable.names[parameter.name].amount += parameter.amount
			}
			res.end()
		}
	} else if (parameter.function === 'checkstock') {
		if (!parameter.name) {
			// send all product list sorted by alpha
			Object.keys(stockTable.names).sort().forEach(key => {
				if (stockTable.names[key].amount != 0)
					res.write(`${key}: ${stockTable.names[key].amount}\n`)
			})
			res.end()
		} else {
			if (!(parameter.name in stockTable.names)) 
				res.send(`${parameter.name}: 0\n`)
			else {
				res.send(`${parameter.name}: ${stockTable.names[parameter.name].amount}\n`)
			}
		}
	} else if (parameter.function === 'sell') {
		if (!parameter.name)
			res.send('ERROR\n')
		else if (parameter.price && parameter.price <= 0) 
			res.send('ERROR\n')
		else if (parameter.price)
			stockTable.addSales(parameter.price, parameter.amount)
		else 
			stockTable.names[parameter.name].amount -= (parameter.amount) ? parameter.amount : 1
		
		res.end()
	} else if (parameter.function === 'checksales') {
		if (!(Number.isInteger(stockTable.sales)))
			res.send(`sales: ${stockTable.sales.toFixed(2)}\n`).end()
		else
			res.send(`sales: ${stockTable.sales}\n`).end()
	} else 
		res.send('ERROR\n')
})

app.listen(app.get('port'), function() {
	console.log(`listening to ${app.settings.host} at port ${app.settings.port}...`)
})


