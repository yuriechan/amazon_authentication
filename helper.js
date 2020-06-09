class Stock {
    constructor() {
        this.names = {}
        this.sales = 0
    }

    addSales(price, amount = 1) {
        this.sales += price * amount
    }
}

const registerProduct = (name, amount = 1) => ({
    [name] : {
        amount : amount
    }
})

module.exports = {
    Stock,
    registerProduct
}